import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { InteractiveTool } from "../entities/interactive-tool.entity"
import { LiveSessionService } from "./live-session.service"
import type { CreateInteractiveToolDto } from "../dto/create-interactive-tool.dto"

@Injectable()
export class InteractiveToolService {
  constructor(
    @InjectRepository(InteractiveTool)
    private interactiveToolRepository: Repository<InteractiveTool>,
    @Inject(forwardRef(() => LiveSessionService))
    private liveSessionService: LiveSessionService,
    
  ) {}

  async create(sessionId: string, createToolDto: CreateInteractiveToolDto): Promise<InteractiveTool> {
    const liveSession = await this.liveSessionService.findOne(sessionId)

    const tool = this.interactiveToolRepository.create({
      ...createToolDto,
      liveSession,
      live_session_id: sessionId,
      results: {},
    })

    return this.interactiveToolRepository.save(tool)
  }

  async findAll(sessionId: string): Promise<InteractiveTool[]> {
    await this.liveSessionService.findOne(sessionId) // Verify session exists

    return this.interactiveToolRepository.find({
      where: { live_session_id: sessionId },
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<InteractiveTool> {
    const tool = await this.interactiveToolRepository.findOne({
      where: { id },
    })

    if (!tool) {
      throw new NotFoundException(`Interactive tool with ID ${id} not found`)
    }

    return tool
  }

  async activate(id: string): Promise<InteractiveTool> {
    const tool = await this.findOne(id)
    tool.isActive = true
    return this.interactiveToolRepository.save(tool)
  }

  async deactivate(id: string): Promise<InteractiveTool> {
    const tool = await this.findOne(id)
    tool.isActive = false
    return this.interactiveToolRepository.save(tool)
  }

  async submitResponse(id: string, participantId: string, response: any): Promise<InteractiveTool> {
    const tool = await this.findOne(id)

    if (!tool.isActive) {
      throw new NotFoundException(`Tool is not currently active`)
    }

    // Initialize results if not present
    if (!tool.results) {
      tool.results = {}
    }

    // Store response by participant ID
    tool.results[participantId] = {
      response,
      timestamp: new Date(),
    }

    return this.interactiveToolRepository.save(tool)
  }

  async remove(id: string): Promise<void> {
    const tool = await this.findOne(id)
    await this.interactiveToolRepository.remove(tool)
  }
}
