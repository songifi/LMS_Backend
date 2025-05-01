import { Test, TestingModule } from '@nestjs/testing';
import { GraphQlFederationService } from './graph-ql-federation.service';

describe('GraphQlFederationService', () => {
  let service: GraphQlFederationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphQlFederationService],
    }).compile();

    service = module.get<GraphQlFederationService>(GraphQlFederationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
