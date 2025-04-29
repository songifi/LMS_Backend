import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from './entities/credential.entity';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CredentialService {
  constructor(
    @InjectRepository(Credential)
    private credentialRepo: Repository<Credential>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async issueCredential(dto: CreateCredentialDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new Error('User not found');

    const credential = this.credentialRepo.create({
      user,
      achievementType: dto.achievementType,
      referenceId: dto.referenceId,
      issuedDate: new Date(),
    });

    return this.credentialRepo.save(credential);
  }

  async findUserCredentials(userId: number) {
    return this.credentialRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
}
