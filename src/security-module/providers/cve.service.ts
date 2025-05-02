import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import axios from 'axios';
import { CveAlert, CveSeverity } from '../entities/cve-alert.entity';
import { SecurityIssue } from '../entities/security-issue.entity';
import { NotificationService } from './notification.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CveService {
  private readonly logger = new Logger(CveService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CveAlert)
    private cveAlertRepository: Repository<CveAlert>,
    @InjectRepository(SecurityIssue)
    private securityIssueRepository: Repository<SecurityIssue>,
    private readonly notificationService: NotificationService,
  ) {}

  async fetchLatestCVEs(): Promise<void> {
    try {
      this.logger.log('Fetching latest CVE data');
      
      // In a real implementation, you would use the NVD API or another CVE data source
      // For example, using the NVD API:
      // const nvdApiKey = this.configService.get('NVD_API_KEY');
      // const response = await axios.get(
      //   'https://services.nvd.nist.gov/rest/json/cves/2.0',
      //   {
      //     params: {
      //       pubStartDate: new Date(Date.now() - 86400000).toISOString(), // Last 24 hours
      //       apiKey: nvdApiKey,
      //     },
      //   }
      // );
      
      // Mock response for example
      const mockResponse = {
        data: {
          vulnerabilities: [
            {
              cve: {
                id: 'CVE-2023-12345',
                descriptions: [
                  { 
                    lang: 'en',
                    value: 'Cross-site scripting vulnerability in Express.js versions prior to 4.18.2',
                  },
                ],
                published: '2023-05-01T00:00:00.000',
                metrics: {
                  cvssMetricV31: [
                    {
                      cvssData: {
                        baseScore: 7.5,
                        baseSeverity: 'HIGH',
                      },
                    },
                  ],
                },
                configurations: [
                  {
                    nodes: [
                      {
                        cpeMatch: [
                          { criteria: 'cpe:2.3:a:expressjs:express:*:*:*:*:*:node.js:*:*', versionEndExcluding: '4.18.2' },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      };
      
      // Process each CVE
      for (const vuln of mockResponse.data.vulnerabilities) {
        await this.processCVE(vuln.cve);
      }
      
      this.logger.log('CVE fetch and processing completed');
    } catch (error) {
      this.logger.error(`Error fetching CVEs: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processCVE(cve: any): Promise<void> {
    try {
      // Check if this CVE already exists in our database
      const existingCVE = await this.cveAlertRepository.findOne({ 
        where: { cveId: cve.id } 
      });
      
      if (existingCVE) {
        this.logger.verbose(`CVE ${cve.id} already exists in the database, skipping`);
        return;
      }
      
      // Get the English description
      const description = cve.descriptions.find(desc => desc.lang === 'en')?.value || 'No description available';
      
      // Get severity and CVSS score if available
      let severity = CveSeverity.MEDIUM;
      let cvssScore = null;
      
      if (cve.metrics && cve.metrics.cvssMetricV31 && cve.metrics.cvssMetricV31.length > 0) {
        const cvssData = cve.metrics.cvssMetricV31[0].cvssData;
        cvssScore = cvssData.baseScore;
        
        // Map CVSS severity to our enum
        switch (cvssData.baseSeverity) {
          case 'CRITICAL':
            severity = CveSeverity.CRITICAL;
            break;
          case 'HIGH':
            severity = CveSeverity.HIGH;
            break;
          case 'MEDIUM':
            severity = CveSeverity.MEDIUM;
            break;
          case 'LOW':
            severity = CveSeverity.LOW;
            break;
          default:
            severity = CveSeverity.MEDIUM;
        }
      }
      
      // Extract affected packages
      const affectedPackages = [];
      const affectedVersions = [];
      
      if (cve.configurations && cve.configurations.length > 0) {
        for (const config of cve.configurations) {
          for (const node of config.nodes || []) {
            for (const match of node.cpeMatch || []) {
              // Extract package information from CPE string
              const cpeSegments = match.criteria.split(':');
              if (cpeSegments.length > 4) {
                const vendor = cpeSegments[3];
                const product = cpeSegments[4];
                affectedPackages.push(`${vendor}/${product}`);
              }
              
              // Extract version constraints
              if (match.versionEndExcluding) {
                affectedVersions.push(`< ${match.versionEndExcluding}`);
              } else if (match.versionEndIncluding) {
                affectedVersions.push(`<= ${match.versionEndIncluding}`);
              } else if (match.versionStartExcluding) {
                affectedVersions.push(`> ${match.versionStartExcluding}`);
              } else if (match.versionStartIncluding) {
                affectedVersions.push(`>= ${match.versionStartIncluding}`);
              }
            }
          }
        }
      }
      
      // Create the CVE alert record
      const cveAlert = this.cveAlertRepository.create({
        cveId: cve.id,
        title: `${cve.id}: ${description.slice(0, 100)}${description.length > 100 ? '...' : ''}`,
        description: description,
        severity: severity,
        cvssScore: cvssScore,
        affectedPackages: [...new Set(affectedPackages)], // Deduplicate
        affectedVersions: [...new Set(affectedVersions)], // Deduplicate
        publishedDate: cve.published ? new Date(cve.published) : new Date(),
      });
      
      const savedCVE = await this.cveAlertRepository.save(cveAlert);
      
      // Send notification about new critical or high CVEs
      if (savedCVE.severity === CveSeverity.CRITICAL || savedCVE.severity === CveSeverity.HIGH) {
        await this.notificationService.sendCveAlert({
          cveId: savedCVE.cveId,
          title: savedCVE.title,
          severity: savedCVE.severity,
          packages: savedCVE.affectedPackages,
        });
      }
      
    } catch (error) {
      this.logger.error(`Error processing CVE: ${error.message}`, error.stack);
      throw error;
    }
  }

  async acknowledgeCAL(id: string): Promise<CveAlert> {
    try {
      const cve = await this.cveAlertRepository.findOne({ where: { id } });
      
      if (!cve) {
        throw new Error(`CVE alert with ID ${id} not found`);
      }
      
      cve.acknowledged = true;
      return await this.cveAlertRepository.save(cve);
    } catch (error) {
      this.logger.error(`Error acknowledging CVE alert: ${error.message}`, error.stack);
      throw error;
    }
  }

  async markPatched(id: string, patchedVersion: string): Promise<CveAlert> {
    try {
      const cve = await this.cveAlertRepository.findOne({ where: { id } });
      
      if (!cve) {
        throw new Error(`CVE alert with ID ${id} not found`);
      }
      
      cve.patched = true;
      cve.patchedInVersion = patchedVersion;
      
      // Update any related security issues to mark them as resolved
      if (cve.securityIssues && cve.securityIssues.length > 0) {
        for (const issue of cve.securityIssues) {
          await this.securityIssueRepository.update(issue.id, {
            status: IssueStatus.RESOLVED,
            resolvedAt: new Date(),
            remediationSteps: `Patched in version ${patchedVersion}`,
          });
        }
      }
      
      return await this.cveAlertRepository.save(cve);
    } catch (error) {
      this.logger.error(`Error marking CVE as patched: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUnpatchedCVEs(): Promise<CveAlert[]> {
    return this.cveAlertRepository.find({
      where: { patched: false },
      order: {
        severity: 'ASC', // Highest severity first
        publishedDate: 'DESC', // Newest first
      },
    });
  }
}