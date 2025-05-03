import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisclosureSubmission, DisclosureStatus } from '../entities/disclosure-submission.entity';
import { SecurityIssue, IssueSource, IssueSeverity } from '../entities/security-issue.entity';
import { NotificationService } from './notification.service';

@Injectable()
export class DisclosureService {
  private readonly logger = new Logger(DisclosureService.name);

  constructor(
    @InjectRepository(DisclosureSubmission)
    private disclosureRepository: Repository<DisclosureSubmission>,
    @InjectRepository(SecurityIssue)
    private securityIssueRepository: Repository<SecurityIssue>,
    private readonly notificationService: NotificationService,
  ) {}

  async submitDisclosure(disclosureData: Partial<DisclosureSubmission>): Promise<DisclosureSubmission> {
    try {
      const disclosure = this.disclosureRepository.create({
        ...disclosureData,
        status: DisclosureStatus.SUBMITTED,
      });
      
      const savedDisclosure = await this.disclosureRepository.save(disclosure);
      
      // Send notification about new submission
      await this.notificationService.sendDisclosureNotification({
        disclosureId: savedDisclosure.id,
        title: savedDisclosure.title,
        reporterName: savedDisclosure.reporterName || 'Anonymous',
      });
      
      return savedDisclosure;
    } catch (error) {
      this.logger.error(`Error submitting disclosure: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAllDisclosures(): Promise<DisclosureSubmission[]> {
    return this.disclosureRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getDisclosureById(id: string): Promise<DisclosureSubmission> {
    const disclosure = await this.disclosureRepository.findOne({ where: { id } });
    
    if (!disclosure) {
      throw new Error(`Disclosure submission with ID ${id} not found`);
    }
    
    return disclosure;
  }

  async getPendingDisclosures(): Promise<DisclosureSubmission[]> {
    return this.disclosureRepository.find({
      where: [
        { status: DisclosureStatus.SUBMITTED },
        { status: DisclosureStatus.UNDER_REVIEW },
      ],
      order: {
        createdAt: 'ASC', // Oldest first, to prioritize them
      },
    });
  }

  async reviewDisclosure(id: string, reviewData: {
    status: DisclosureStatus,
    reviewedBy: string,
    reviewNotes?: string,
    securityIssueId?: string,
    confirmedDuplicate?: boolean,
    eligibleForBounty?: boolean,
    bountyAmount?: number,
  }): Promise<DisclosureSubmission> {
    try {
      const disclosure = await this.getDisclosureById(id);
      
      // Update the disclosure with review data
      Object.assign(disclosure, reviewData);
      
      // If marked as confirmed and no security issue is linked, create one
      if (reviewData.status === DisclosureStatus.CONFIRMED && !reviewData.securityIssueId && !reviewData.confirmedDuplicate) {
        const securityIssue = await this.securityIssueRepository.save({
          title: disclosure.title,
          description: disclosure.description,
          source: IssueSource.DISCLOSURE,
          severity: IssueSeverity.HIGH, // Default to high until properly assessed
          reportedBy: disclosure.reporterName || 'External Security Researcher',
          proofOfConcept: disclosure.proofOfConcept,
        });
        
        disclosure.securityIssueId = securityIssue.id;
      }
      
      const updatedDisclosure = await this.disclosureRepository.save(disclosure);
      
      // If the status was updated to confirmed or rejected, notify the reporter
      if (
        (reviewData.status === DisclosureStatus.CONFIRMED || 
         reviewData.status === DisclosureStatus.REJECTED) && 
        disclosure.reporterEmail
      ) {
        await this.notificationService.sendDisclosureStatusUpdate({
          disclosureId: disclosure.id,
          title: disclosure.title,
          status: reviewData.status,
          reporterEmail: disclosure.reporterEmail,
          reporterName: disclosure.reporterName,
          eligibleForBounty: disclosure.eligibleForBounty,
          bountyAmount: disclosure.bountyAmount,
        });
      }
      
      return updatedDisclosure;
    } catch (error) {
      this.logger.error(`Error reviewing disclosure ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async markAsFixed(id: string, fixData: {
    reviewedBy: string,
    publishedUrl?: string,
  }): Promise<DisclosureSubmission> {
    try {
      return await this.reviewDisclosure(id, {
        status: DisclosureStatus.FIXED,
        reviewedBy: fixData.reviewedBy,
        publishedUrl: fixData.publishedUrl,
      });
    } catch (error) {
      this.logger.error(`Error marking disclosure as fixed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async publishDisclosure(id: string, publishData: {
    reviewedBy: string,
    publishedUrl: string,
  }): Promise<DisclosureSubmission> {
    try {
      return await this.reviewDisclosure(id, {
        status: DisclosureStatus.PUBLISHED,
        reviewedBy: publishData.reviewedBy,
        publishedUrl: publishData.publishedUrl,
      });
    } catch (error) {
      this.logger.error(`Error publishing disclosure: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getResponsibleDisclosurePolicy(): Promise<string> {
    // This could load from a database or config file in a real implementation
    return `
# Responsible Disclosure Policy

## Introduction
We take the security of our systems seriously, and we value the security community. The responsible disclosure of security vulnerabilities helps us ensure the security and privacy of our users.

## Guidelines
If you believe you've found a security vulnerability in our service, please follow these guidelines:

1. **Email**: Send your findings to security@example.com
2. **Provide details**: Please provide sufficient information to reproduce the problem, so we can resolve it as quickly as possible.
3. **Allow time**: Give us a reasonable time to resolve the issue before making any information public.

## We promise to:
- Respond to your report within 3 business days
- Keep you updated as we work to fix the issue
- Not take legal action against you if you follow these guidelines
- Give proper credit for vulnerabilities responsibly disclosed

## Scope
- Our main application at https://example.com
- API services at https://api.example.com
- Mobile applications
- Out of scope: third-party services and applications

## Eligibility for Bounty
- Eligible: XSS, SQLi, Authentication bypass, Authorization flaws, RCE
- Not eligible: Rate limiting, Missing HTTP headers, Clickjacking on non-sensitive pages

## Bounty Amounts
- Critical: $500-$2500
- High: $250-$1000
- Medium: $100-$500
- Low: $50-$100

Thank you for helping keep our users and systems secure!
`;
  }
}