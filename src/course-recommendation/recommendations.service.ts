import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { GenerateRecommendationsDto } from './dto/generate-recommendations.dto';
import { RecommendationQueryDto, SortBy } from './dto/recommendation-query.dto';
import { Student } from '../students/entities/student.entity';
import { Course } from '../../courses/entities/course.entity';
import { Algorithm, AlgorithmStatus } from '../../algorithms/entities/algorithm.entity';
import { Enrollment, EnrollmentStatus, GradeType } from '../students/entities/enrollment.entity';
import { DegreeRequirement } from '../../degree-audit/entities/degree-requirement.entity';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Algorithm)
    private algorithmRepository: Repository<Algorithm>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(DegreeRequirement)
    private requirementRepository: Repository<DegreeRequirement>,
  ) {}

  async create(createRecommendationDto: CreateRecommendationDto): Promise<Recommendation> {
    const student = await this.studentRepository.findOne({
      where: { id: createRecommendationDto.studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${createRecommendationDto.studentId} not found`);
    }

    const course = await this.courseRepository.findOne({
      where: { id: createRecommendationDto.courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${createRecommendationDto.courseId} not found`);
    }

    const algorithm = await this.algorithmRepository.findOne({
      where: { id: createRecommendationDto.algorithmId },
    });

    if (!algorithm) {
      throw new NotFoundException(`Algorithm with ID ${createRecommendationDto.algorithmId} not found`);
    }

    const recommendation = this.recommendationRepository.create({
      ...createRecommendationDto,
      student,
      course,
    });

    return this.recommendationRepository.save(recommendation);
  }

  async findAll(query: RecommendationQueryDto): Promise<Recommendation[]> {
    const { 
      studentId, 
      algorithmId, 
      department, 
      maxDifficulty, 
      minCredits, 
      maxCredits, 
      sortBy = SortBy.SCORE, 
      limit = 10 
    } = query;

    // Build query with relations
    const queryBuilder = this.recommendationRepository
      .createQueryBuilder('recommendation')
      .leftJoinAndSelect('recommendation.student', 'student')
      .leftJoinAndSelect('recommendation.course', 'course');

    // Apply filters
    if (studentId) {
      queryBuilder.andWhere('student.id = :studentId', { studentId });
    }

    if (algorithmId) {
      queryBuilder.andWhere('recommendation.algorithmId = :algorithmId', { algorithmId });
    }

    if (department) {
      queryBuilder.andWhere('course.department = :department', { department });
    }

    if (maxDifficulty) {
      queryBuilder.andWhere('course.difficultyLevel <= :maxDifficulty', { maxDifficulty });
    }

    if (minCredits) {
      queryBuilder.andWhere('course.creditHours >= :minCredits', { minCredits });
    }

    if (maxCredits) {
      queryBuilder.andWhere('course.creditHours <= :maxCredits', { maxCredits });
    }

    // Apply sorting
    switch (sortBy) {
      case SortBy.SCORE:
        queryBuilder.orderBy('recommendation.score', 'DESC');
        break;
      case SortBy.CAREER_RELEVANCE:
        // This would require a more complex query based on your data model
        queryBuilder.orderBy('recommendation.factors->\'careerRelevance\'', 'DESC');
        break;
      case SortBy.DIFFICULTY:
        queryBuilder.orderBy('course.difficultyLevel', 'ASC');
        break;
      case SortBy.POPULARITY:
        // This would require a subquery to count enrollments
        queryBuilder
          .addSelect(
            '(SELECT COUNT(*) FROM enrollments WHERE enrollments.course_id = course.id)',
            'enrollment_count'
          )
          .orderBy('enrollment_count', 'DESC');
        break;
    }

    // Apply limit
    queryBuilder.take(limit);

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Recommendation> {
    const recommendation = await this.recommendationRepository.findOne({
      where: { id },
      relations: ['student', 'course'],
    });

    if (!recommendation) {
      throw new NotFoundException(`Recommendation with ID ${id} not found`);
    }

    return recommendation;
  }

  async markAsSelected(id: string): Promise<Recommendation> {
    const recommendation = await this.findOne(id);
    recommendation.selected = true;
    return this.recommendationRepository.save(recommendation);
  }

  async generateRecommendations(dto: GenerateRecommendationsDto): Promise<Recommendation[]> {
    const { studentId, algorithmId } = dto;

    // Find the student
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['preferences'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Find the algorithm to use
    let algorithm: Algorithm;
    if (algorithmId) {
      algorithm = await this.algorithmRepository.findOne({
        where: { id: algorithmId },
      });
      
      if (!algorithm) {
        throw new NotFoundException(`Algorithm with ID ${algorithmId} not found`);
      }
    } else {
      // Use the active algorithm
      const activeAlgorithms = await this.algorithmRepository.find({
        where: { status: AlgorithmStatus.ACTIVE },
      });
      
      if (activeAlgorithms.length === 0) {
        throw new BadRequestException('No active algorithm found. Please specify an algorithm ID.');
      }
      
      algorithm = activeAlgorithms[0];
    }

    // Get student's course history
    const enrollments = await this.enrollmentRepository.find({
      where: { student: { id: studentId } },
      relations: ['course'],
    });

    const completedCourses = enrollments
      .filter(e => e.status === EnrollmentStatus.COMPLETED)
      .map(e => e.course);
    
    const completedCourseIds = new Set(completedCourses.map(c => c.id));
    
    const currentEnrollments = enrollments
      .filter(e => e.status === EnrollmentStatus.ENROLLED)
      .map(e => e.course);
    
    const currentCourseIds = new Set(currentEnrollments.map(c => c.id));

    // Get all available courses
    const allCourses = await this.courseRepository.find({
      relations: ['prerequisites', 'degreeRequirements', 'degreeRequirements.degreeProgram'],
    });

    // Filter out courses the student has already completed or is currently taking
    const availableCourses = allCourses.filter(
      course => !completedCourseIds.has(course.id) && !currentCourseIds.has(course.id)
    );

    // Get degree requirements for student's major
    const degreeRequirements = await this.requirementRepository.find({
      relations: ['degreeProgram', 'courses'],
      where: {
        degreeProgram: {
          department: student.major,
        },
      },
    });

    // Calculate recommendations based on the algorithm
    const recommendations = [];

    for (const course of availableCourses) {
      // Check if prerequisites are met
      const hasPrerequisites = course.prerequisites.length === 0 || 
        course.prerequisites.every(prereq => completedCourseIds.has(prereq.id));
      
      if (!hasPrerequisites) {
        continue; // Skip courses where prerequisites aren't met
      }
      
      // Calculate how well the course aligns with degree requirements
      const degreeRequirementScore = this.calculateDegreeRequirementScore(course, degreeRequirements, completedCourseIds);
      
      // Calculate how well the course aligns with career goals
      const careerRelevanceScore = this.calculateCareerRelevanceScore(course, student);
      
      // Calculate how well the course aligns with academic interests
      const interestScore = this.calculateInterestScore(course, student);
      
      // Calculate peer popularity (how many students have taken/are taking this course)
      const peerPopularityScore = await this.calculatePeerPopularityScore(course);
      
      // Apply algorithm weights
      const { weights } = algorithm.parameters;
      const weightedScores = {
        degreeRequirement: (degreeRequirementScore * (weights?.degreeRequirement || 0.4)),
        careerRelevance: (careerRelevanceScore * (weights?.careerRelevance || 0.3)),
        interest: (interestScore * (weights?.interest || 0.2)),
        peerPopularity: (peerPopularityScore * (weights?.peerPopularity || 0.1)),
      };
      
      // Calculate total score
      const totalScore = Object.values(weightedScores).reduce((sum, score) => sum + score, 0);
      
      // Generate explanation
      const explanation = this.generateExplanation(
        course, 
        weightedScores, 
        hasPrerequisites, 
        degreeRequirements
      );
      
      // Create recommendation
      const recommendation = this.recommendationRepository.create({
        student,
        course,
        score: totalScore,
        explanation,
        algorithmId: algorithm.id,
        algorithmVersion: algorithm.version,
        factors: {
          weightedScores,
          hasPrerequisites,
          matchesDegreeRequirements: degreeRequirementScore > 0.5,
          matchesCareerGoals: careerRelevanceScore > 0.5,
          matchesInterests: interestScore > 0.5,
          isPeerPopular: peerPopularityScore > 0.5,
        },
        selected: false,
      });
      
      recommendations.push(recommendation);
    }

    // Sort by score and take the top recommendations
    const sortedRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, algorithm.parameters.maxRecommendations || 10);

    // Save recommendations to database
    return this.recommendationRepository.save(sortedRecommendations);
  }

  private calculateDegreeRequirementScore(
    course: Course, 
    degreeRequirements: DegreeRequirement[],
    completedCourseIds: Set<string>
  ): number {
    let score = 0;
    
    // Check if course is part of a degree requirement
    for (const requirement of degreeRequirements) {
      const isPartOfRequirement = requirement.courses.some(c => c.id === course.id);
      
      if (isPartOfRequirement) {
        // Calculate how many courses in this requirement are already completed
        const requirementCourseIds = requirement.courses.map(c => c.id);
        const completedRequirementCourses = requirementCourseIds.filter(id => completedCourseIds.has(id));
        const requirementCompletion = completedRequirementCourses.length / requirementCourseIds.length;
        
        // Higher score for requirements that are almost complete
        const requirementScore = 0.5 + (0.5 * requirementCompletion);
        
        score = Math.max(score, requirementScore);
      }
    }
    
    return score || 0.1; // Minimum score of 0.1 for courses not in any requirement
  }

  private calculateCareerRelevanceScore(course: Course, student: Student): number {
    if (!student.careerGoals || student.careerGoals.length === 0 || !course.relatedCareers) {
      return 0.2; // Default low score if no career goals or course lacks career data
    }
    
    // Count how many of the student's career goals match the course's related careers
    const matchingCareers = student.careerGoals.filter(
      goal => course.relatedCareers.includes(goal)
    );
    
    return matchingCareers.length > 0
      ? matchingCareers.length / student.careerGoals.length
      : 0.1;
  }

  private calculateInterestScore(course: Course, student: Student): number {
    if (!student.academicInterests || student.academicInterests.length === 0 || !course.topics) {
      return 0.2; // Default low score if no interests or course lacks topics
    }
    
    // Count how many of the student's interests match the course's topics
    const matchingInterests = student.academicInterests.filter(
      interest => course.topics.some(topic => 
        topic.toLowerCase().includes(interest.toLowerCase()) || 
        interest.toLowerCase().includes(topic.toLowerCase())
      )
    );
    
    return matchingInterests.length > 0
      ? matchingInterests.length / student.academicInterests.length
      : 0.1;
  }

  private async calculatePeerPopularityScore(course: Course): Promise<number> {
    // Count enrollments for this course
    const enrollmentCount = await this.enrollmentRepository.count({
      where: { course: { id: course.id } },
    });
    
    // Scale between 0.1 and 1.0 based on enrollment count
    // This is a simplified approach - in practice, you'd want to normalize across all courses
    return Math.min(1.0, 0.1 + (enrollmentCount / 50));
  }

  private generateExplanation(
    course: Course,
    weightedScores: Record<string, number>,
    hasPrerequisites: boolean,
    degreeRequirements: DegreeRequirement[]
  ): string {
    const explanations = [];
    
    // Add degree requirement explanation
    if (weightedScores.degreeRequirement > 0.2) {
      const matchingRequirements = degreeRequirements.filter(req => 
        req.courses.some(c => c.id === course.id)
      );
      
      if (matchingRequirements.length > 0) {
        const requirementNames = matchingRequirements.map(r => r.name).join(', ');
        explanations.push(
          `This course fulfills the following degree requirements: ${requirementNames}.`
        );
      }
    }
    
    // Add career relevance explanation
    if (weightedScores.careerRelevance > 0.2) {
      explanations.push(
        `This course aligns well with your career goals.`
      );
    }
    
    // Add interest explanation
    if (weightedScores.interest > 0.2) {
      explanations.push(
        `This course covers topics that match your academic interests.`
      );
    }
    
    // Add peer popularity explanation
    if (weightedScores.peerPopularity > 0.2) {
      explanations.push(
        `This course is popular among other students in your program.`
      );
    }
    
    // Prerequisites notice
    if (course.prerequisites.length > 0 && hasPrerequisites) {
      explanations.push(
        `You have completed all prerequisites for this course.`
      );
    }
    
    // Fallback if no specific explanations
    if (explanations.length === 0) {
      explanations.push(
        `This course may be a good fit for your academic journey.`
      );
    }
    
    return explanations.join(' ');
  }
}