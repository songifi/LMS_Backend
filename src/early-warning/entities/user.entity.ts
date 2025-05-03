import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  COUNSELOR = 'counselor',
  PRINCIPAL = 'principal',
  CASE_MANAGER = 'case_manager',
  SOCIAL_WORKER = 'social_worker',
  PARENT = 'parent',
  DATA_ANALYST = 'data_analyst',
  SYSTEM = 'system',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ type: [String], enum: Object.values(UserRole), default: [UserRole.TEACHER] })
  roles: UserRole[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object, default: {} })
  permissions: {
    viewSensitiveData: boolean;
    viewRestrictedData: boolean;
    manageRiskIndicators: boolean;
    manageInterventions: boolean;
    manageCases: boolean;
    manageUsers: boolean;
    generateReports: boolean;
    [key: string]: boolean;
  };

  @Prop({ type: [String], default: [] })
  classGroups: string[];

  @Prop({ type: Date })
  lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);