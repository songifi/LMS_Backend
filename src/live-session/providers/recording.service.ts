import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { SessionRecording } from "../entities/session-recording.entity"
import { LiveSessionService } from "./live-session.service"

@Injectable()
export class RecordingService {
  constructor(
    @InjectRepository(SessionRecording)
    private recordingRepository: Repository<SessionRecording>,
   
    @Inject(forwardRef(() => LiveSessionService))
    private liveSessionService: LiveSessionService,
  ) {}

  async startRecording(sessionId: string): Promise<SessionRecording> {
    const liveSession = await this.liveSessionService.findOne(sessionId)

    // Check if recording already exists
    if (liveSession.recording) {
      return liveSession.recording
    }

    // Create new recording
    const recording = this.recordingRepository.create({
      liveSessionId: sessionId,
      startTime: new Date(),
      url: `https://recordings.example.com/${sessionId}`, // Placeholder URL
      processingComplete: false,
    })

    const savedRecording = await this.recordingRepository.save(recording)

    // Update live session with recording reference
    await this.liveSessionService.update(sessionId, {
      recordSession: true,
    })

    return savedRecording
  }

  async stopRecording(sessionId: string): Promise<SessionRecording> {
    const liveSession = await this.liveSessionService.findOne(sessionId)

    if (!liveSession.recording) {
      throw new NotFoundException(`No active recording found for session ${sessionId}`)
    }

    const recording = await this.recordingRepository.findOne({
      where: { id: liveSession.recording.id },
    })

    if (!recording) {
      throw new NotFoundException(`Recording not found`)
    }

    const endTime = new Date()
    const durationSeconds = Math.floor((endTime.getTime() - recording.startTime.getTime()) / 1000)

    recording.endTime = endTime
    recording.durationSeconds = durationSeconds
    recording.processingComplete = true

    return this.recordingRepository.save(recording)
  }

  async getAllRecordings(): Promise<SessionRecording[]> {
    return this.recordingRepository.find({
      order: { startTime: "DESC" },
    })
  }

  async getRecording(id: string): Promise<SessionRecording> {
    const recording = await this.recordingRepository.findOne({
      where: { id },
    })

    if (!recording) {
      throw new NotFoundException(`Recording with ID ${id} not found`)
    }

    return recording
  }

  async getSessionRecording(sessionId: string): Promise<SessionRecording> {
    const liveSession = await this.liveSessionService.findOne(sessionId)

    if (!liveSession.recording) {
      throw new NotFoundException(`No recording found for session ${sessionId}`)
    }

    return this.getRecording(liveSession.recording.id)
  }
}
