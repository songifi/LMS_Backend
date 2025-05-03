import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { RiskLevel } from './risk-indicator.entity';

export enum InterventionType {
  ACADEMIC = 'academic',
  BEHAVIORAL = 'behavioral',
  ATTENDANCE = 'attendance',
  SOCIAL = 'social',
  EMOTIONAL = 'emotional',
  FAMILY = 'family',
  CUSTOM = 'custom',
}

export enum InterventionMethod {
  ONE_ON_ONE = 'one_on_one',
  GROUP_SESSION = 'group_session',
  WORKSHOP = 'workshop',
  REFERRAL = 'referral',
  RESOURCE_PROVISION = 'resource_provision',
  PARENT_MEETING = 'parent_meeting',
  DIGITAL = 'digital',
  CUSTOM = 'custom',
}

@Schema({ timestamps: true })
export class Intervention extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, type: String, enum: Object.values(InterventionType) })
  type: InterventionType;

  @Prop({ required: true, type: String, enum: Object.values(InterventionMethod) })
  method: InterventionMethod;

  @Prop({ type: [String], enum: Object.values(RiskLevel), default: [RiskLevel.HIGH, RiskLevel.CRITICAL] })
  targetRiskLevels: RiskLevel[];

  @Prop({ type: [String], default: [] })
  targetIndicators: string[];

  @Prop({ default: 0 })
  estimatedDurationDays: number;

  @Prop({ type: Object, default: {} })
  resources: Record<string, any>;

  @Prop({ default: 0 })
  costEstimate: number;

  @Prop({ default: 0 })
  successRate: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  requiresConsent: boolean;

  @Prop({ default: [] })
  requiredRoles: string[];

  @Prop({ type: Object, default: {} })
  customFields: Record<string, any>;
}

export const InterventionSchema = SchemaFactory.createForClass(Intervention);