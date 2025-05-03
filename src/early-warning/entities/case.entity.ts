import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum CaseStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  MONITORING = 'monitoring',
  CLOSED_SUCCESSFUL = 'closed_successful',
  CLOSED_UNSUCCESSFUL = 'closed_unsuccessful',
  CLOSED_NO_ACTION = 'closed_no_action',
}

export enum CasePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TriggerType {
  AUTOMATED = 'automated',
  MANUAL = 'manual',
}

@Schema({ timestamps: true })
export class Case extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Student', required: true })
  student: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: String, enum: Object.values(CaseStatus), default: CaseStatus.OPEN })
  status: CaseStatus;

  @Prop({ type: String, enum: Object.values(CasePriority), default: CasePriority.MEDIUM })
  priority: CasePriority;

  @Prop({ type: String, enum: Object.values(TriggerType), required: true })
  triggerType: TriggerType;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'RiskIndicator' }] })
  triggeringIndicators: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Intervention' }] })
  recommendedInterventions: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Intervention' }] })
  appliedInterventions: MongooseSchema.Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  assignedTo: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  notes: {
    content: string;
    createdAt: Date;
    createdBy: MongooseSchema.Types.ObjectId;
  }[];

  @Prop({ type: [Object], default: [] })
  timeline: {
    action: string;
    description: string;
    timestamp: Date;
    user: MongooseSchema.Types.ObjectId;
  }[];

  @Prop({ type: Date })
  dueDate: Date;

  @Prop({ type: Date })
  followUpDate: Date;

  @Prop({ type: Date })
  closedDate: Date;

  @Prop()
  closureReason: string;

  @Prop({ type: Object, default: {} })
  outcomes: {
    successful: boolean;
    improvements: Record<string, number>;
    notes: string;
  };

  @Prop({ default: [] })
  tags: string[];

  @Prop({ type: Boolean, default: false })
  requiresParentalConsent: boolean;

  @Prop({ type: Boolean })
  parentalConsentObtained: boolean;
}

export const CaseSchema = SchemaFactory.createForClass(Case);