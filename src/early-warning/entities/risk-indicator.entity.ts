import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum DataSourceType {
  ATTENDANCE = 'attendance',
  ASSIGNMENT = 'assignment',
  GRADE = 'grade',
  ENGAGEMENT = 'engagement',
  BEHAVIOR = 'behavior',
  CUSTOM = 'custom',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ThresholdType {
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  EQUAL_TO = 'equal_to',
  BETWEEN = 'between',
  CUSTOM = 'custom',
}

@Schema({ timestamps: true })
export class RiskIndicator extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, type: String, enum: Object.values(DataSourceType) })
  dataSource: DataSourceType;

  @Prop({ required: true, type: String, enum: Object.values(ThresholdType) })
  thresholdType: ThresholdType;

  @Prop({ required: true })
  thresholdValue: any;

  @Prop()
  thresholdUpperValue: any; // For BETWEEN threshold type

  @Prop({ required: true, type: String, enum: Object.values(RiskLevel) })
  riskLevel: RiskLevel;

  @Prop({ default: 1 })
  weight: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isSystemDefined: boolean;

  @Prop({ type: Object })
  customLogic: Record<string, any>;

  @Prop()
  category: string;

  @Prop({ default: [] })
  tags: string[];
}

export const RiskIndicatorSchema = SchemaFactory.createForClass(RiskIndicator);