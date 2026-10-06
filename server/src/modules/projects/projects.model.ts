import mongoose, { Schema, Document } from 'mongoose';

export type ProjectStatus = 'open' | 'agreement_pending' | 'assigned' | 'in_review' | 'completed' | 'cancelled';
export type ProjectApplicationStatus = 'pending' | 'selected' | 'rejected';

export interface ISubmission {
  workUrl: string;
  notes: string;
  submittedAt: Date;
}

export interface IProject extends Document {
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  budgetINR: number;
  deadline: Date;
  ownerId: mongoose.Types.ObjectId;
  assignedStudentId?: mongoose.Types.ObjectId;
  agreementId?: mongoose.Types.ObjectId;
  submission?: ISubmission;
  paymentReceivedAt?: Date;
  status: ProjectStatus;
  chatRoomId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectApplication extends Document {
  projectId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  proposedBudgetINR: number;
  coverNote: string;
  status: ProjectApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    workUrl: { type: String, required: true, trim: true },
    notes: { type: String, default: '', trim: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 4000 },
    category: { type: String, required: true, trim: true },
    requiredSkills: { type: [String], required: true, index: true },
    budgetINR: { type: Number, required: true, min: 500 },
    deadline: { type: Date, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedStudentId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    agreementId: { type: Schema.Types.ObjectId, ref: 'Agreement' },
    submission: { type: SubmissionSchema },
    paymentReceivedAt: { type: Date },
    status: {
      type: String,
      enum: ['open', 'agreement_pending', 'assigned', 'in_review', 'completed', 'cancelled'],
      default: 'open',
      index: true,
    },
    chatRoomId: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ status: 1, createdAt: -1 });

const ProjectApplicationSchema = new Schema<IProjectApplication>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    proposedBudgetINR: { type: Number, required: true, min: 100 },
    coverNote: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['pending', 'selected', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// One application per student per project
ProjectApplicationSchema.index({ projectId: 1, studentId: 1 }, { unique: true });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
export const ProjectApplication = mongoose.model<IProjectApplication>('ProjectApplication', ProjectApplicationSchema);
