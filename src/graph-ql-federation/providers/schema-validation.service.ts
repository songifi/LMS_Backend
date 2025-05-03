import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { FederationModuleOptions } from '../federation.module';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { buildSchema, GraphQLError, validateSchema } from 'graphql';
import { gql } from 'apollo-server-express';
import fetch from 'node-fetch';

@Injectable()
export class SchemaValidationService implements OnModuleInit {
  private readonly logger = new Logger(SchemaValidationService.name);

  constructor(
    @Inject('FEDERATION_OPTIONS')
    private readonly options: FederationModuleOptions,
  ) {}

  async onModuleInit() {
    await this.validateServices();
  }

  async validateServices() {
    this.logger.log('Validating federated service schemas...');
    
    for (const service of this.options.serviceList) {
      try {
        // Fetch the service schema
        const response = await fetch(service.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: gql`
              {
                _service {
                  sdl
                }
              }
            `,
          }),
        });

        const { data } = await response.json();
        
        if (!data || !data._service || !data._service.sdl) {
          this.logger.error(`Service ${service.name} does not expose _service.sdl`);
          continue;
        }

        // Validate the schema
        const sdl = data._service.sdl;
        const schema = buildSchema(sdl);
        const validationErrors = validateSchema(schema);
        
        if (validationErrors.length > 0) {
          this.logger.error(`Schema validation errors for service ${service.name}:`, validationErrors);
        } else {
          this.logger.log(`Schema for service ${service.name} is valid`);
        }
        
        // Check for federation directives
        if (!sdl.includes('@key') && !sdl.includes('@extends')) {
          this.logger.warn(`Service ${service.name} may not be properly configured for federation (missing @key or @extends directives)`);
        }
      } catch (error) {
        this.logger.error(`Failed to validate schema for service ${service.name}:`, error);
      }
    }
  }
}
