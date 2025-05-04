import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LtiController } from './controllers/lti.controller';
import { LtiDeepLinkingController } from './controllers/lti-deep-linking.controller';
import { LtiGradeServiceController } from './controllers/lti-grade-service.controller';
import { LtiNamesRolesController } from './controllers/lti-names-roles.controller';
import { LtiToolConfigController } from './controllers/lti-tool-config.controller';
import { LtiEntity } from './entities/lti.entity';
import { LtiPlatformEntity } from './entities/lti-platform.entity';
import { LtiToolEntity } from './entities/lti-tool.entity';
import { LtiDeploymentEntity } from './entities/lti-deployment.entity';
import { LtiContextEntity } from './entities/lti-context.entity';
import { LtiUserEntity } from './entities/lti-user.entity';
import { LtiResourceLinkEntity } from './entities/lti-resource-link.entity';
import { LtiService } from './services/lti.service';
import { LtiPlatformService } from './services/lti-platform.service';
import { LtiToolService } from './services/lti-tool.service';
import { LtiAuthService } from './services/lti-auth.service';
import { LtiDeepLinkingService } from './services/lti-deep-linking.service';
import { LtiGradeService } from './services/lti-grade-service.service';
import { LtiNamesRolesService } from './services/lti-names-roles.service';
import { LtiJwtService } from './services/lti-jwt.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LtiEntity,
      LtiPlatformEntity,
      LtiToolEntity,
      LtiDeploymentEntity,
      LtiContextEntity,
      LtiUserEntity,
      LtiResourceLinkEntity,
    ]),
  ],
  controllers: [
    LtiController,
    LtiDeepLinkingController,
    LtiGradeServiceController,
    LtiNamesRolesController,
    LtiToolConfigController,
  ],
  providers: [
    LtiService,
    LtiPlatformService,
    LtiToolService,
    LtiAuthService,
    LtiDeepLinkingService,
    LtiGradeService,
    LtiNamesRolesService,
    LtiJwtService,
  ],
  exports: [
    LtiService,
    LtiPlatformService,
    LtiToolService,
    LtiAuthService,
    LtiGradeService,
    LtiNamesRolesService,
  ],
})
export class LtiModule {}