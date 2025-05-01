import { Test, TestingModule } from '@nestjs/testing';
import { GraphQlFederationController } from './graph-ql-federation.controller';
import { GraphQlFederationService } from './graph-ql-federation.service';

describe('GraphQlFederationController', () => {
  let controller: GraphQlFederationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GraphQlFederationController],
      providers: [GraphQlFederationService],
    }).compile();

    controller = module.get<GraphQlFederationController>(GraphQlFederationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
