import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'student' | 'local_business' | 'company' | 'startup' | 'mentor' | 'admin';
export type UserStatus = 'active' | 'warned' | 'suspended' | 'banned';

export interface ISkill {
  name: string;
  level: number; // 1 to 5 stars
  verified?: boolean;
}

export interface IUser extends Document {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  avatarUrl?: string;
  bio?: string;
  college?: string;
  collegeEmail?: string;
  collegeVerified: boolean;
  collegeVerificationToken?: string;
  collegeVerificationExpires?: Date;
  businessName?: string;
  businessVerified: boolean;
  skills: ISkill[];
  visibility: boolean; // For students: visible to recruiters/talent search
  trustScore: number;
  status: UserStatus;
  optInChatSummary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, trim: true },
    level: { type: Number, required: true, min: 1, max: 5, default: 3 },
    verified: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ['student', 'local_business', 'company', 'startup', 'mentor', 'admin'],
      default: 'student',
    },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 1000 },
    college: { type: String, default: '', trim: true },
    collegeEmail: { type: String, lowercase: true, trim: true },
    collegeVerified: { type: Boolean, default: false },
    collegeVerificationToken: { type: String },
    collegeVerificationExpires: { type: Date },
    businessName: { type: String, default: '', trim: true },
    businessVerified: { type: Boolean, default: false },
    skills: { type: [SkillSchema], default: [] },
    visibility: { type: Boolean, default: true },
    trustScore: { type: Number, default: 100, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['active', 'warned', 'suspended', 'banned'],
      default: 'active',
    },
    optInChatSummary: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups and searches
UserSchema.index({ role: 1, collegeVerified: 1 });
UserSchema.index({ 'skills.name': 1 });
UserSchema.index({ visibility: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
