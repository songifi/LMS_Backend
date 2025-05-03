import { Module, DynamicModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { AuthGuard } from './guards/auth.guard';
import { SchemaValidationService } from './services/schema-validation.service';
import { TracingPlugin } from './plugins/tracing.plugin';
import { FederationConfigService } from './services/federation-config.service';
import { APP_GUARD } from '@nestjs/core';

export interface FederationModuleOptions {
  serviceList: Array<{ name: string; url: string }>;
  enableTracing?: boolean;
  enableSchemaValidation?: boolean;
  authenticationRequired?: boolean;
}

@Module({})
export class FederationModule {
  static forRoot(options: FederationModuleOptions): DynamicModule {
    const providers = [
      FederationConfigService,
      {
        provide: 'FEDERATION_OPTIONS',
        useValue: options,
      },
    ];

    if (options.enableSchemaValidation) {
      providers.push(SchemaValidationService);
    }

    if (options.authenticationRequired) {
      providers.push({
        provide: APP_GUARD,
        useClass: AuthGuard,
      });
    }

    return {
      module: FederationModule,
      imports: [
        GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
          driver: ApolloGatewayDriver,
          useFactory: async (configService: FederationConfigService) => {
            return {
              server: {
                context: ({ req }) => ({ req }),
                plugins: options.enableTracing ? [new TracingPlugin()] : [],
              },
              gateway: {
                supergraphSdl: new IntrospectAndCompose({
                  subgraphs: options.serviceList,
                }),
                buildService({ url }) {
                  return new AuthenticatedDataSource({ url });
                },
              },
            };
          },
          inject: [FederationConfigService],
        }),
      ],
      providers,
      exports: [GraphQLModule],
    };
  }
}

// Custom DataSource that passes authentication headers to services
class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  async willSendRequest({ request, context }) {
    // Pass authentication headers to the services
    if (context?.req?.headers?.authorization) {
      request.http.headers.set('authorization', context.req.headers.authorization);
    }
    
    // Pass user context if available
    if (context?.req?.user) {
      request.http.headers.set('x-user-id', context.req.user.id);
      request.http.headers.set('x-user-roles', JSON.stringify(context.req.user.roles || []));
    }
  }
}
