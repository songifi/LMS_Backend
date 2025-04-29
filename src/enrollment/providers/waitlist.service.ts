import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
  } from "@nestjs/common";
  import { InjectRepository } from "@nestjs/typeorm";
  import { Repository, IsNull } from "typeorm";
  import { Waitlist } from "../entities/waitlist.entity";
  import { WaitlistPosition, WaitlistStatus } from "../entities/waitlist-position.entity";
  import { CreateWaitlistDto } from "../dto/create-waitlist.dto";
  
  @Injectable()
  export class WaitlistService {
    constructor(
      @InjectRepository(Waitlist)
      private waitlistRepository: Repository<Waitlist>,
      @InjectRepository(WaitlistPosition)
      private waitlistPositionRepository: Repository<WaitlistPosition>,
    ) {}
  
    async findOrCreateWaitlist(courseId: string, sectionId: string | null, semesterId: string): Promise<Waitlist> {
      const where = {
        courseId,
        sectionId: sectionId === null ? IsNull() : sectionId,
        semesterId,
      };
  
      let waitlist = await this.waitlistRepository.findOne({ where });
  
      if (!waitlist) {
        waitlist = this.waitlistRepository.create({
          courseId,
          sectionId: sectionId ?? undefined,
          semesterId,
          maxCapacity: 50,
          currentCount: 0,
          isActive: true,
          autoEnrollEnabled: true,
        });
  
        waitlist = await this.waitlistRepository.save(waitlist);
      }
  
      return waitlist;
    }
  
    async addToWaitlist(createWaitlistDto: CreateWaitlistDto): Promise<WaitlistPosition> {
      const { studentId, courseId, sectionId, semesterId, notes } = createWaitlistDto;
  
      const waitlist = await this.findOrCreateWaitlist(courseId, sectionId ?? null, semesterId);
  
      if (!waitlist.isActive) {
        throw new BadRequestException("Waitlist is not active for this course");
      }
  
      if (waitlist.currentCount >= waitlist.maxCapacity) {
        throw new BadRequestException("Waitlist is full");
      }
  
      const existingPosition = await this.waitlistPositionRepository.findOne({
        where: {
          studentId,
          waitlistId: waitlist.id,
          status: WaitlistStatus.ACTIVE,
        },
      });
  
      if (existingPosition) {
        throw new ConflictException("Student is already on the waitlist for this course");
      }
  
      const position = this.waitlistPositionRepository.create({
        studentId,
        waitlistId: waitlist.id,
        position: waitlist.currentCount + 1,
        status: WaitlistStatus.ACTIVE,
        notes,
      });
  
      const savedPosition = await this.waitlistPositionRepository.save(position);
  
      waitlist.currentCount += 1;
      await this.waitlistRepository.save(waitlist);
  
      return savedPosition;
    }
  
    async getWaitlistPositions(studentId: string): Promise<WaitlistPosition[]> {
      return this.waitlistPositionRepository.find({
        where: {
          studentId,
          status: WaitlistStatus.ACTIVE,
        },
        relations: ["waitlist"],
        order: {
          position: "ASC",
        },
      });
    }
  
    async getWaitlistForCourse(
      courseId: string,
      sectionId: string | null,
      semesterId: string,
    ): Promise<WaitlistPosition[]> {
      const where = {
        courseId,
        sectionId: sectionId === null ? IsNull() : sectionId,
        semesterId,
      };
  
      const waitlist = await this.waitlistRepository.findOne({ where });
  
      if (!waitlist) {
        return [];
      }
  
      return this.waitlistPositionRepository.find({
        where: {
          waitlistId: waitlist.id,
          status: WaitlistStatus.ACTIVE,
        },
        order: {
          position: "ASC",
        },
      });
    }
  
    async removeFromWaitlist(waitlistPositionId: string): Promise<void> {
      const position = await this.waitlistPositionRepository.findOne({
        where: { id: waitlistPositionId },
        relations: ["waitlist"],
      });
  
      if (!position) {
        throw new NotFoundException(`Waitlist position with ID ${waitlistPositionId} not found`);
      }
  
      position.status = WaitlistStatus.REMOVED;
      position.statusUpdatedDate = new Date();
      await this.waitlistPositionRepository.save(position);
  
      const waitlist = position.waitlist;
      waitlist.currentCount = Math.max(0, waitlist.currentCount - 1);
      await this.waitlistRepository.save(waitlist);
  
      await this.reorderWaitlistPositions(waitlist.id);
    }
  
    private async reorderWaitlistPositions(waitlistId: string): Promise<void> {
      const positions = await this.waitlistPositionRepository.find({
        where: {
          waitlistId,
          status: WaitlistStatus.ACTIVE,
        },
        order: {
          position: "ASC",
        },
      });
  
      for (let i = 0; i < positions.length; i++) {
        positions[i].position = i + 1;
        await this.waitlistPositionRepository.save(positions[i]);
      }
    }
  
    async processNextWaitlistPosition(
      courseId: string,
      sectionId: string | null,
      semesterId: string,
    ): Promise<WaitlistPosition | null> {
      const where = {
        courseId,
        sectionId: sectionId === null ? IsNull() : sectionId,
        semesterId,
      };
  
      const waitlist = await this.waitlistRepository.findOne({ where });
  
      if (!waitlist || !waitlist.isActive || !waitlist.autoEnrollEnabled || waitlist.currentCount === 0) {
        return null;
      }
  
      const nextPosition = await this.waitlistPositionRepository.findOne({
        where: {
          waitlistId: waitlist.id,
          status: WaitlistStatus.ACTIVE,
        },
        order: {
          position: "ASC",
        },
      });
  
      if (!nextPosition) {
        return null;
      }
  
      nextPosition.status = WaitlistStatus.ENROLLED;
      nextPosition.statusUpdatedDate = new Date();
      await this.waitlistPositionRepository.save(nextPosition);
  
      waitlist.currentCount = Math.max(0, waitlist.currentCount - 1);
      await this.waitlistRepository.save(waitlist);
  
      await this.reorderWaitlistPositions(waitlist.id);
  
      return nextPosition;
    }
  }
  