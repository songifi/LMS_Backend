import { Resolver, Query, Mutation, Args, ID, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { GatewayService } from './gateway.service';
import { Gateway } from './entities/gateway.entity';
import { CreateGatewayDto, UpdateGatewayDto, GatewayFilterDto } from './dto/gateway.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { GqlRolesGuard } from '../auth/guards/gql-roles.guard';
import { Roles } from '../auth/decorators/roles