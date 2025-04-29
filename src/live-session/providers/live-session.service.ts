import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { LiveSession, SessionStatus } from "../entities/live-session.entity"
import { VideoConference } from "../entities/video-conference.entity"
import { LiveChat } from "../entities/live-chat.entity"
import type { CreateLiveSessionDto } from "../dto/create-live-session.dto"
import type { UpdateLiveSessionDto } from "../dto/update-live-session.dto"

@Injectable()
export class LiveSessionService {
  constructor(
    @InjectRepository(LiveSession)
    private readonly liveSessionRepository: Repository<LiveSession>,
    @InjectRepository(VideoConference)
    private readonly videoConferenceRepository: Repository<VideoConference>,
    @InjectRepository(LiveChat)
    private liveChatRepository: Repository<LiveChat>,
  ) {}

  async findAll(): Promise<LiveSession[]> {
    return this.liveSessionRepository.find({
      relations: ["videoConference", "interactiveTools", "breakoutRooms"],
    })
  }

  async findOne(id: string): Promise<LiveSession> {
    const liveSession = await this.liveSessionRepository.findOne({
      where: { id },
      relations: ["videoConference", "interactiveTools", "breakoutRooms", "recording"],
    })

    if (!liveSession) {
      throw new NotFoundException(`Live session with ID ${id} not found`)
    }

    return liveSession
  }

  async create(createLiveSessionDto: CreateLiveSessionDto, hostId: string): Promise<LiveSession> {
    // Create video conference
    const videoConference = this.videoConferenceRepository.create(createLiveSessionDto.videoConference)
    await this.videoConferenceRepository.save(videoConference)

    // Create live chat
    const liveChat = this.liveChatRepository.create({
      isEnabled: true,
      isModerated: false,
    })
    await this.liveChatRepository.save(liveChat)

    // Create live session
    const liveSession = this.liveSessionRepository.create({
      ...createLiveSessionDto,
      scheduledStartTime: new Date(createLiveSessionDto.scheduledStartTime),
      hostId,
      videoConference,
      liveChat,
      status: SessionStatus.SCHEDULED,
    })

    return this.liveSessionRepository.save(liveSession)
  }

  async update(id: string, updateLiveSessionDto: UpdateLiveSessionDto): Promise<LiveSession> {
    const liveSession = await this.findOne(id)

    // Update video conference if provided
    if (updateLiveSessionDto.videoConference) {
      await this.videoConferenceRepository.update(liveSession.videoConference.id, updateLiveSessionDto.videoConference)
    }

    // Convert date strings to Date objects if provided
    if (updateLiveSessionDto.scheduledStartTime) {
      updateLiveSessionDto.scheduledStartTime = new Date(updateLiveSessionDto.scheduledStartTime) as any
    }
    if (updateLiveSessionDto.actualStartTime) {
      updateLiveSessionDto.actualStartTime = new Date(updateLiveSessionDto.actualStartTime) as any
    }
    if (updateLiveSessionDto.endTime) {
      updateLiveSessionDto.endTime = new Date(updateLiveSessionDto.endTime) as any
    }

    // Update live session
    await this.liveSessionRepository.update(id, {
      ...updateLiveSessionDto,
      videoConference: undefined, // Remove to avoid TypeORM error
    })

    return this.findOne(id)
  }

  async startSession(id: string): Promise<LiveSession> {
    const liveSession = await this.findOne(id)

    if (liveSession.status !== SessionStatus.SCHEDULED) {
      throw new BadRequestException(`Session is not in SCHEDULED state`)
    }

    await this.liveSessionRepository.update(id, {
      status: SessionStatus.LIVE,
      actualStartTime: new Date(),
    })

    return this.findOne(id)
  }

  async endSession(id: string): Promise<LiveSession> {
    const liveSession = await this.findOne(id)

    if (liveSession.status !== SessionStatus.LIVE) {
      throw new BadRequestException(`Session is not in LIVE state`)
    }

    await this.liveSessionRepository.update(id, {
      status: SessionStatus.COMPLETED,
      endTime: new Date(),
    })

    return this.findOne(id)
  }

  async remove(id: string): Promise<void> {
    const liveSession = await this.findOne(id)
    await this.liveSessionRepository.remove(liveSession)
  }
}
