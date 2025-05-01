import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { FederationModuleOptions } from '../federation.module';

@Injectable()
export class FederationConfigService {
  private readonly logger = new Logger(FederationConfigService.name);

  constructor(
    @Inject('FEDERATION_OPTIONS')
    private readonly options: FederationModuleOptions,
  ) {
    this.logger.log(`Initializing Federation Gateway with ${options.serviceList.length} services`);
    options.serviceList.forEach(service => {
      this.logger.log(`Registered service: ${service.name} at ${service.url}`);
    });
  }

  getServiceList() {
    return this.options.serviceList;
  }

  isTracingEnabled() {
    return this.options.enableTracing || false;
  }

  isSchemaValidationEnabled() {
    return this.options.enableSchemaValidation || false;
  }
}
