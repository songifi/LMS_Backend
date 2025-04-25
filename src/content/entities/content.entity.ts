import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { ContentModule } from './content-module.entity';
import { ContentVersion } from './content-version.entity';
import { ContentMetadata } from './content-metadata.entity';
import { ContentAccess } from './content-access.entity';

export enum ContentType {
  VIDEO = 'video',
  DOCUMENT = 'document',
  PRESENTATION = 'presentation',
  OTHER = 'other',
}

@Entity()
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ContentType,
    default: ContentType.OTHER,
  })
  contentType: ContentType;

  @Column({ nullable: true })
  filePath: string;

  @Column({ nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ default: 0 })
  orderIndex: number;

  @Column({ default: false })
  isPublished: boolean;

  @ManyToOne(() => User, { eager: false, nullable: false })
  creator: User;
  
  @ManyToOne(() => ContentModule, module => module.contents, { nullable: true })
  module: ContentModule;

  @OneToMany(() => ContentVersion, version => version.content)
  versions: ContentVersion[];

  @OneToMany(() => ContentMetadata, metadata => metadata.content)
  metadata: ContentMetadata[];

  @OneToMany(() => ContentAccess, access => access.content)
  accessRules: ContentAccess[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ default: 0 })
  viewCount: number;

  @Column('simple-array', { nullable: true })
  prerequisites: string[];
  
}