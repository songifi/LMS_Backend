import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { LiveAttendance } from "../entities/live-attendance.entity";
import type { JoinSessionDto } from "../dto/join-session.dto";
import { LiveSessionService } from "./live-session.service";

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(LiveAttendance)
    private readonly attendanceRepository: Repository<LiveAttendance>,
    @Inject(forwardRef(() => LiveSessionService))
    private readonly liveSessionService: LiveSessionService,
  ) {}

  async joinSession(sessionId: string, joinSessionDto: JoinSessionDto): Promise<LiveAttendance> {
    const liveSession = await this.liveSessionService.findOne(sessionId);

    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        live_session_id: sessionId,
        participantId: joinSessionDto.participantId,
        leaveTime: IsNull(),
      },
    });

    if (existingAttendance) {
      return existingAttendance;
    }

    const attendance = this.attendanceRepository.create({
      liveSession,
      live_session_id: sessionId,
      participantId: joinSessionDto.participantId,
      joinTime: new Date(),
      cameraOn: false,
      microphoneOn: false,
      metadata: {
        name: joinSessionDto.participantName,
      },
    });

    return this.attendanceRepository.save(attendance);
  }

  async leaveSession(sessionId: string, participantId: string): Promise<LiveAttendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: {
        live_session_id: sessionId,
        participantId,
        leaveTime: IsNull(),
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Active attendance record not found`);
    }

    const leaveTime = new Date();
    const durationSeconds = Math.floor((leaveTime.getTime() - attendance.joinTime.getTime()) / 1000);

    attendance.leaveTime = leaveTime;
    attendance.durationSeconds = durationSeconds;

    return this.attendanceRepository.save(attendance);
  }

  async getSessionAttendance(sessionId: string): Promise<LiveAttendance[]> {
    await this.liveSessionService.findOne(sessionId); // Ensure session exists

    return this.attendanceRepository.find({
      where: { live_session_id: sessionId },
      order: { joinTime: "DESC" },
    });
  }

  async updateAttendanceStatus(
    sessionId: string,
    participantId: string,
    updates: { cameraOn?: boolean; microphoneOn?: boolean },
  ): Promise<LiveAttendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: {
        live_session_id: sessionId,
        participantId,
        leaveTime: IsNull(),
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Active attendance record not found`);
    }

    if (updates.cameraOn !== undefined) {
      attendance.cameraOn = updates.cameraOn;
    }

    if (updates.microphoneOn !== undefined) {
      attendance.microphoneOn = updates.microphoneOn;
    }

    return this.attendanceRepository.save(attendance);
  }
}
