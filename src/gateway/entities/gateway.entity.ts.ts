import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('gateways')
export class Gateway {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 100 })
  name: string;

  @Field()
  @Column({ length: 255 })
  endpoint: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @Column({ default: 'v1' })
  version: string;

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true })
  deprecationDate: Date;

  @Field()
  @Column({ type: 'integer', default: 1000 })
  rateLimit: number;

  @Field(() => [String])
  @Column('simple-array')
  allowedOrigins: string[];

  @Field(() => [String])
  @Column('simple-array')
  supportedMethods: string[];

  @Field(() => [String])
  @Column('simple-array', { default: 'basic,jwt' })
  authTypes: string[];

  @Field()
  @Column({ type: 'jsonb', default: '{}' })
  metaData: Record<string, any>;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
