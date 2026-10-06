import mongoose, { Schema, Document } from 'mongoose';

export type ReportCategory = 'payment_not_received' | 'spam' | 'harassment' | 'fraud' | 'other';
export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  targetUserId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  chatRoomId?: string;
  category: ReportCategory;
  description: string;
  evidenceUrl?: string;
  status: ReportStatus;
  resolutionNotes?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    chatRoomId: { type: String },
    category: {
      type: String,
      required: true,
      enum: ['payment_not_received', 'spam', 'harassment', 'fraud', 'other'],
      index: true,
    },
    description: { type: String, required: true, maxlength: 3000 },
    evidenceUrl: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    resolutionNotes: { type: String, maxlength: 2000 },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.model<IReport>('Report', ReportSchema);
