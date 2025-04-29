import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

// Entities
import { LiveSession } from "./entities/live-session.entity"
import { VideoConference } from "./entities/video-conference.entity"
import { InteractiveTool } from "./entities/interactive-tool.entity"
import { LiveAttendance } from "./entities/live-attendance.entity"
import { SessionRecording } from "./entities/session-recording.entity"
import { LiveChat } from "./entities/live-chat.entity"
import { ChatMessage } from "./entities/chat-message.entity"
import { BreakoutRoom } from "./entities/breakout-room.entity"

// Controllers
import { LiveSessionController } from "./controllers/live-session.controller"
import { AttendanceController } from "./controllers/attendance.controller"
import { InteractiveToolController } from "./controllers/interactive-tool.controller"
import { RecordingController } from "./controllers/recording.controller"
import { BreakoutRoomController } from "./controllers/breakout-room.controller"

// Services
import { LiveSessionService } from "./providers/live-session.service"
import { AttendanceService } from "./providers/attendance.service"
import { InteractiveToolService } from "./providers/interactive-tool.service"
import { RecordingService } from "./providers/recording.service"
import { BreakoutRoomService } from "./providers/breakout-room.service"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LiveSession,
      VideoConference,
      InteractiveTool,
      LiveAttendance,
      SessionRecording,
      LiveChat,
      ChatMessage,
      BreakoutRoom,
    ]),
  ],
  controllers: [
    LiveSessionController,
    AttendanceController,
    InteractiveToolController,
    RecordingController,
    BreakoutRoomController,
  ],
  providers: [
    LiveSessionService,
    AttendanceService,
    InteractiveToolService,
    RecordingService,
    BreakoutRoomService,
  ],
  exports: [
    LiveSessionService,
    AttendanceService,
    InteractiveToolService,
    RecordingService,
    BreakoutRoomService,
  ],
})
export class LiveSessionModule {}
