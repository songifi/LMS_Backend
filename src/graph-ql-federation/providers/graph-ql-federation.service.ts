import { Injectable } from '@nestjs/common';
import { CreateGraphQlFederationDto } from './dto/create-graph-ql-federation.dto';
import { UpdateGraphQlFederationDto } from './dto/update-graph-ql-federation.dto';

@Injectable()
export class GraphQlFederationService {
  create(createGraphQlFederationDto: CreateGraphQlFederationDto) {
    return 'This action adds a new graphQlFederation';
  }

  findAll() {
    return `This action returns all graphQlFederation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} graphQlFederation`;
  }

  update(id: number, updateGraphQlFederationDto: UpdateGraphQlFederationDto) {
    return `This action updates a #${id} graphQlFederation`;
  }

  remove(id: number) {
    return `This action removes a #${id} graphQlFederation`;
  }
}
