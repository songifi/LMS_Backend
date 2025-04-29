import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { BreakoutRoom } from "../entities/breakout-room.entity"
import { LiveSessionService } from "./live-session.service"

@Injectable()
export class BreakoutRoomService {
  constructor(
    @InjectRepository(BreakoutRoom)
    private readonly breakoutRoomRepository: Repository<BreakoutRoom>,
    @Inject(forwardRef(() => LiveSessionService))
    private readonly liveSessionService: LiveSessionService,
  ) {}

  async create(sessionId: string, name: string, facilitatorId?: string): Promise<BreakoutRoom> {
    const liveSession = await this.liveSessionService.findOne(sessionId)

    const breakoutRoom = this.breakoutRoomRepository.create({
      name,
      liveSession,
      live_session_id: sessionId,
      facilitatorId,
      participantIds: [],
      isActive: false,
    })

    return this.breakoutRoomRepository.save(breakoutRoom)
  }

  async findAll(sessionId: string): Promise<BreakoutRoom[]> {
    await this.liveSessionService.findOne(sessionId) // Verify session exists

    return this.breakoutRoomRepository.find({
      where: { live_session_id: sessionId },
    })
  }

  async findOne(id: string): Promise<BreakoutRoom> {
    const breakoutRoom = await this.breakoutRoomRepository.findOne({
      where: { id },
    })

    if (!breakoutRoom) {
      throw new NotFoundException(`Breakout room with ID ${id} not found`)
    }

    return breakoutRoom
  }

  async activate(id: string): Promise<BreakoutRoom> {
    const breakoutRoom = await this.findOne(id)

    if (breakoutRoom.isActive) {
      return breakoutRoom
    }

    breakoutRoom.isActive = true
    breakoutRoom.startTime = new Date()

    return this.breakoutRoomRepository.save(breakoutRoom)
  }

  async deactivate(id: string): Promise<BreakoutRoom> {
    const breakoutRoom = await this.findOne(id)

    if (!breakoutRoom.isActive) {
      return breakoutRoom
    }

    breakoutRoom.isActive = false
    breakoutRoom.endTime = new Date()

    return this.breakoutRoomRepository.save(breakoutRoom)
  }

  async addParticipant(id: string, participantId: string): Promise<BreakoutRoom> {
    const breakoutRoom = await this.findOne(id)

    if (!breakoutRoom.participantIds.includes(participantId)) {
      breakoutRoom.participantIds.push(participantId)
    }

    return this.breakoutRoomRepository.save(breakoutRoom)
  }

  async removeParticipant(id: string, participantId: string): Promise<BreakoutRoom> {
    const breakoutRoom = await this.findOne(id)

    breakoutRoom.participantIds = breakoutRoom.participantIds.filter((id) => id !== participantId)

    return this.breakoutRoomRepository.save(breakoutRoom)
  }

  async assignFacilitator(id: string, facilitatorId: string): Promise<BreakoutRoom> {
    const breakoutRoom = await this.findOne(id)
    breakoutRoom.facilitatorId = facilitatorId

    return this.breakoutRoomRepository.save(breakoutRoom)
  }

  async remove(id: string): Promise<void> {
    const breakoutRoom = await this.findOne(id)
    await this.breakoutRoomRepository.remove(breakoutRoom)
  }
}
