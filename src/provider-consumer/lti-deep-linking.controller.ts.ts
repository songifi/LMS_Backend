import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LtiService } from '../services/lti.service';
import { LtiDeepLinkingService } from '../services/lti-deep-linking.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { DeepLinkingContentItemDto, DeepLinkingResponseDto } from '../dto/deep-linking-content.dto';

@Controller('lti/deep-linking')
export class LtiDeepLinkingController {
  constructor(
    private readonly ltiService: LtiService,
    private readonly deepLinkingService: LtiDeepLinkingService,
  ) {}

  /**
   * Deep Linking view endpoint - used after successful deep linking launch
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async deepLinkingView(
    @Query('session') session: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const ltiSessionId = req.user['ltiSessionId'];
      const ltiSession = await this.ltiService.getLtiSession(ltiSessionId);
      if (!ltiSession) {
        throw new NotFoundException('LTI session not found');
      }

      // Check if this is a Deep Linking request
      const messageType = ltiSession.messageType;
      if (messageType !== 'LtiDeepLinkingRequest') {
        throw new BadRequestException('Not a Deep Linking request');
      }

      // Render the Deep Linking selection interface
      return res.send(`
        <h1>LTI Deep Linking</h1>
        <p>Select content to add to your course</p>
        <form action="/lti/deep-linking/submit" method="post">
          <input type="hidden" name="session" value="${session}" />
          
          <div class="content-item">
            <h3>Sample Content Item 1</h3>
            <p>Description of content item 1</p>
            <button type="submit" name="contentId" value="content1">Select</button>
          </div>
          
          <div class="content-item">
            <h3>Sample Content Item 2</h3>
            <p>Description of content item 2</p>
            <button type="submit" name="contentId" value="content2">Select</button>
          </div>
          
          <div class="content-item">
            <h3>Sample Content Item 3</h3>
            <p>Description of content item 3</p>
            <button type="submit" name="contentId" value="content3">Select</button>
          </div>
        </form>
      `);
    } catch (error) {
      return res
        .status(error.status || 500)
        .send(`LTI Deep Linking error: ${error.message}`);
    }
  }

  /**
   * Deep Linking submission endpoint - receives selected content and responds to the platform
   */
  @Post('submit')
  @UseGuards(JwtAuthGuard)
  async submitDeepLinking(
    @Body('contentId') contentId: string,
    @Body('session') session: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const ltiSessionId = req.user['ltiSessionId'];
      const ltiSession = await this.ltiService.getLtiSession(ltiSessionId);
      if (!ltiSession) {
        throw new NotFoundException('LTI session not found');
      }

      // Prepare content items based on selection
      let contentItems: DeepLinkingContentItemDto[] = [];
      
      // In a real implementation, you would fetch these from a database
      const contentMap = {
        'content1': {
          type: 'ltiResourceLink',
          title: 'Sample Resource 1',
          text: 'This is a sample resource for deep linking',
          url: `${process.env.APP_URL}/api/resources/1`,
          lineItem: {
            scoreMaximum: 100,
            label: 'Assignment 1',
          },
          custom: {
            resource_id: '1',
            difficulty: 'easy',
          },
        },
        'content2': {
          type: 'ltiResourceLink',
          title: 'Sample Resource 2',
          text: 'Another sample resource for deep linking',
          url: `${process.env.APP_URL}/api/resources/2`,
          lineItem: {
            scoreMaximum: 100,
            label: 'Assignment 2',
          },
          custom: {
            resource_id: '2',
            difficulty: 'medium',
          },
        },
        'content3': {
          type: 'link',
          title: 'External Resource',
          url: 'https://example.com/resource',
          text: 'An external resource that can be used in the course',
        },
      };

      if (contentId && contentMap[contentId]) {
        contentItems.push(contentMap[contentId] as DeepLinkingContentItemDto);
      } else {
        throw new BadRequestException('Invalid content selection');
      }

      // Get the Deep Linking settings from the LTI session
      const deepLinkingSettings = ltiSession.deepLinkingSettings;
      if (!deepLinkingSettings) {
        throw new BadRequestException('Deep Linking settings not found');
      }

      // Generate Deep Linking response JWT
      const { jwt, formHtml } = await this.deepLinkingService.createDeepLinkingResponse(
        ltiSession,
        contentItems,
        'Content selected successfully',
      );

      // Return auto-submitting form
      return res.send(formHtml);
    } catch (error) {
      return res
        .status(error.status || 500)
        .send(`Deep Linking submission error: ${error.message}`);
    }
  }
}