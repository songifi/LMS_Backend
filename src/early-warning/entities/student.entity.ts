import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum PrivacyLevel {
  PUBLIC = 'public',
  STAFF_ONLY = 'staff_only',
  RESTRICTED = 'restricted',
}

@Schema({ timestamps: true })
export class Student extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  studentId: string;

  @Prop()
  email: string;

  @Prop({ type: String, enum: Object.values(PrivacyLevel), default: PrivacyLevel.STAFF_ONLY })
  privacyLevel: PrivacyLevel;

  @Prop({ default: false })
  optedOutOfAutomatedInterventions: boolean;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'RiskProfile' }] })
  riskProfiles: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Case' }] })
  cases: MongooseSchema.Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  demographics: Record<string, any>;

  @Prop({ type: Object, default: {} })
  academicHistory: Record<string, any>;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const StudentSchema = SchemaFactory.createForClass(Student);