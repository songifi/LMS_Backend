import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusType } from './entities/application-status.entity';
import { ApplicationReview } from './entities/application-review.entity';
import { StatusService } from './status.service';
import { CreateApplicationReviewDto, UpdateApplicationReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ApplicationReview)
    private reviewsRepository: Repository<ApplicationReview>,
    private statusService: StatusService,
  ) {}

  async findAll(): Promise<ApplicationReview[]> {
    return this.reviewsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findByApplication(applicationId: string): Promise<ApplicationReview[]> {
    return this.reviewsRepository.find({
      where: { applicationId },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<ApplicationReview> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async create(createReviewDto: CreateApplicationReviewDto): Promise<ApplicationReview> {
    const review = this.reviewsRepository.create(createReviewDto);
    
    if (createReviewDto.isCompleted) {
      review.completedAt = new Date();
    }
    
    const savedReview = await this.reviewsRepository.save(review);
    
    // Update application status if needed
    if (savedReview.isCompleted) {
      await this.statusService.updateStatus(savedReview.applicationId, {
        status: StatusType.REVIEW_COMPLETED,
        notes: `Review completed by ${savedReview.reviewerName}`,
        changedBy: savedReview.reviewerId,
      });
    }
    
    return savedReview;
  }

  async update(id: string, updateReviewDto: UpdateApplicationReviewDto): Promise<ApplicationReview> {
    const review = await this.findOne(id);
  
    if (updateReviewDto.isCompleted && !review.isCompleted) {
      review.completedAt = new Date();
  
      await this.statusService.updateStatus(review.applicationId, {
        status: StatusType.REVIEW_COMPLETED,
        notes: `Review completed by ${review.reviewerName}`,
        changedBy: review.reviewerId,
      });
    }
  
    Object.assign(review, updateReviewDto);
    return this.reviewsRepository.save(review);
  }

  async remove(id: string): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewsRepository.remove(review);
  }
}