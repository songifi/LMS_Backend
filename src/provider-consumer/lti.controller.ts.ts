import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Redirect,
  Req,
  Res,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LtiService } from '../services/lti.service';
import { LtiAuthService } from '../services/lti-auth.service';
import { LtiLaunchDto } from '../dto/lti-launch.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { randomBytes } from 'crypto';

@Controller('lti')
export class LtiController {
  constructor(
    private readonly ltiService: LtiService,
    private readonly ltiAuthService: LtiAuthService,
  ) {}

  /**
   * OIDC Login initiation endpoint - Step 1 of the LTI 1.3 launch flow
   */
  @Get('login')
  async login(
    @Query('iss') issuer: string,
    @Query('client_id') clientId: string,
    @Query('lti_deployment_id') deploymentId: string,
    @Query('target_link_uri') targetLinkUri: string,
    @Query('login_hint') loginHint: string,
    @Res() res: Response,
  ) {
    try {
      if (!issuer || !clientId || !targetLinkUri) {
        throw new BadRequestException('Missing required parameters');
      }

      // Generate state and nonce for OIDC flow
      const state = randomBytes(32).toString('hex');
      const nonce = randomBytes(32).toString('hex');

      // Find platform configuration
      const platform = await this.ltiService.findPlatformByIssuerAndClientId(issuer, clientId);
      if (!platform) {
        throw new NotFoundException('LTI platform not found');
      }

      // Store state and nonce in session
      await this.ltiService.storeOidcState({
        state,
        nonce,
        issuer,
        clientId,
        deploymentId,
        targetLinkUri,
      });

      // Redirect to platform's authentication endpoint
      const authParams = new URLSearchParams({
        scope: 'openid',
        response_type: 'id_token',
        client_id: clientId,
        redirect_uri: targetLinkUri,
        login_hint: loginHint,
        state,
        nonce,
        prompt: 'none',
        response_mode: 'form_post',
      });

      res.redirect(`${platform.authenticationEndpoint}?${authParams.toString()}`);
    } catch (error) {
      return res
        .status(error.status || 500)
        .send(`LTI login error: ${error.message}`);
    }
  }

  /**
   * LTI Launch endpoint - Step 2 of the LTI 1.3 launch flow
   */
  @Post('launch')
  async launch(
    @Body('id_token') idToken: string,
    @Body('state') state: string,
    @Res() res: Response,
  ) {
    try {
      if (!idToken || !state) {
        throw new BadRequestException('Missing id_token or state');
      }

      // Retrieve state from database
      const storedState = await this.ltiService.retrieveOidcState(state);
      if (!storedState) {
        throw new UnauthorizedException('Invalid state parameter');
      }

      // Validate JWT token
      const ltiClaims = await this.ltiAuthService.validateLtiJwt(
        idToken,
        storedState.issuer,
        storedState.clientId,
        storedState.nonce,
      );

      // Process the LTI launch
      const launchSession = await this.ltiService.processLtiLaunch(
        ltiClaims,
        storedState,
      );

      // Generate a session token for the user
      const sessionToken = await this.ltiAuthService.createSessionToken(launchSession);

      // Determine which view to render based on message type
      let redirectUrl;
      switch (ltiClaims['https://purl.imsglobal.org/spec/lti/claim/message_type']) {
        case 'LtiDeepLinkingRequest':
          redirectUrl = `/lti/deep-linking?session=${sessionToken}`;
          break;
        case 'LtiResourceLinkRequest':
        default:
          redirectUrl = `/lti/resource?session=${sessionToken}`;
          break;
      }

      return res.redirect(redirectUrl);
    } catch (error) {
      return res
        .status(error.status || 500)
        .send(`LTI launch error: ${error.message}`);
    }
  }

  /**
   * Resource display endpoint - used after successful launch
   */
  @Get('resource')
  @UseGuards(JwtAuthGuard)
  async resourceView(
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

      // Return a view with the LTI session data
      return res.send(`
        <h1>LTI Resource Launch Successful</h1>
        <p>User: ${ltiSession.user?.name || 'Unknown'}</p>
        <p>Context: ${ltiSession.resourceLink?.context?.title || 'Unknown'}</p>
        <p>Resource: ${ltiSession.resourceLink?.title || 'Unknown'}</p>
        <pre>${JSON.stringify(ltiSession.ltiMessage, null, 2)}</pre>
      `);
    } catch (error) {
      return res
        .status(error.status || 500)
        .send(`LTI resource view error: ${error.message}`);
    }
  }

  /**
   * JWKS endpoint - provides public keys for JWT verification
   */
  @Get('jwks')
  async getJwks() {
    return this.ltiAuthService.getJwks();
  }

  /**
   * Tool configuration endpoint - provides LTI tool configuration
   */
  @Get('config/:toolId')
  async getToolConfig(@Param('toolId') toolId: string) {
    const toolConfig = await this.ltiService.getToolConfiguration(toolId);
    if (!toolConfig) {
      throw new NotFoundException('Tool configuration not found');
    }
    return toolConfig;
  }
}