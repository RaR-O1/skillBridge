import mongoose, { Schema, Document } from 'mongoose';

export type JobType = 'internship' | 'full_time' | 'contract';
export type JobStatus = 'open' | 'closed';
export type PipelineStage = 'new' | 'shortlisted' | 'interview' | 'offer' | 'rejected';

export interface ICompany extends Document {
  name: string;
  domain: string;
  description: string;
  logoUrl?: string;
  verified: boolean;
  verifiedAt?: Date;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    domain: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, required: true, maxlength: 2000 },
    logoUrl: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

export interface IJob extends Document {
  companyId: mongoose.Types.ObjectId;
  postedById: mongoose.Types.ObjectId;
  title: string;
  type: JobType;
  location: string;
  isRemote: boolean;
  stipendINR: number;
  requiredSkills: string[];
  description: string;
  deadline: Date;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    postedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    type: { type: String, enum: ['internship', 'full_time', 'contract'], required: true },
    location: { type: String, required: true, trim: true },
    isRemote: { type: Boolean, default: false },
    stipendINR: { type: Number, required: true, min: 0 },
    requiredSkills: { type: [String], required: true, index: true },
    description: { type: String, required: true, maxlength: 5000 },
    deadline: { type: Date, required: true, index: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
  },
  {
    timestamps: true,
  }
);

JobSchema.index({ status: 1, deadline: 1 });
JobSchema.index({ type: 1, status: 1 });

export interface IJobApplicationNote {
  authorId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IJobApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  note: string;
  stage: PipelineStage;
  notes: IJobApplicationNote[];
  referralFrom?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationNoteSchema = new Schema<IJobApplicationNote>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    note: { type: String, default: '', maxlength: 2000 },
    stage: {
      type: String,
      enum: ['new', 'shortlisted', 'interview', 'offer', 'rejected'],
      default: 'new',
      index: true,
    },
    notes: { type: [JobApplicationNoteSchema], default: [] },
    referralFrom: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// One application per student per job
JobApplicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
export const Job = mongoose.model<IJob>('Job', JobSchema);
export const JobApplication = mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
