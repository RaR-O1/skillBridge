import mongoose, { Schema, Document } from 'mongoose';

export type StartupStage = 'ideation' | 'mvp' | 'early_traction' | 'scaling';
export type RoleType = 'co_founder' | 'intern' | 'contributor';
export type RoleStatus = 'open' | 'closed';

export interface IStartupRole {
  _id: mongoose.Types.ObjectId;
  roleTitle: string;
  roleType: RoleType;
  requiredSkills: string[];
  equityOrStipend: string;
  description: string;
  status: RoleStatus;
  createdAt: Date;
}

export interface IStartup extends Document {
  name: string;
  pitch: string;
  description: string;
  stage: StartupStage;
  website?: string;
  founders: mongoose.Types.ObjectId[];
  openRoles: IStartupRole[];
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStartupApplication extends Document {
  startupId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  coverLetter: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface ICoFounderProfile extends Document {
  userId: mongoose.Types.ObjectId;
  college?: string;
  bio: string;
  skills: string[];
  idealCoFounderRole: string; // e.g. "Technical Co-Founder (AI/Cloud)" or "Growth / Business Co-Founder"
  targetIndustry: string; // e.g. "Fintech", "HealthTech", "EdTech", "Developer Tools"
  hoursPerWeek: number;
  lookingFor: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StartupRoleSchema = new Schema<IStartupRole>(
  {
    roleTitle: { type: String, required: true, trim: true },
    roleType: { type: String, enum: ['co_founder', 'intern', 'contributor'], required: true },
    requiredSkills: { type: [String], required: true },
    equityOrStipend: { type: String, required: true },
    description: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    createdAt: { type: Date, default: Date.now },
  }
);

const StartupSchema = new Schema<IStartup>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    pitch: { type: String, required: true, maxlength: 300 },
    description: { type: String, required: true, maxlength: 5000 },
    stage: {
      type: String,
      enum: ['ideation', 'mvp', 'early_traction', 'scaling'],
      default: 'ideation',
    },
    website: { type: String, default: '' },
    founders: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    openRoles: { type: [StartupRoleSchema], default: [] },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const StartupApplicationSchema = new Schema<IStartupApplication>(
  {
    startupId: { type: Schema.Types.ObjectId, ref: 'Startup', required: true, index: true },
    roleId: { type: Schema.Types.ObjectId, required: true, index: true },
    applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    coverLetter: { type: String, default: '', maxlength: 2000 },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'accepted', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

StartupApplicationSchema.index({ roleId: 1, applicantId: 1 }, { unique: true });

const CoFounderProfileSchema = new Schema<ICoFounderProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    college: { type: String, default: '' },
    bio: { type: String, required: true, maxlength: 1000 },
    skills: { type: [String], required: true },
    idealCoFounderRole: { type: String, required: true, trim: true },
    targetIndustry: { type: String, required: true, trim: true },
    hoursPerWeek: { type: Number, required: true, min: 5, max: 80, default: 20 },
    lookingFor: { type: String, required: true, maxlength: 1000 },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Startup = mongoose.model<IStartup>('Startup', StartupSchema);
export const StartupApplication = mongoose.model<IStartupApplication>(
  'StartupApplication',
  StartupApplicationSchema
);
export const CoFounderProfile = mongoose.model<ICoFounderProfile>(
  'CoFounderProfile',
  CoFounderProfileSchema
);
