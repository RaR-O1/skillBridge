import mongoose, { Schema, Document } from 'mongoose';

export type SessionStatus = 'requested' | 'proposed' | 'confirmed' | 'completed' | 'cancelled';
export type ResourceCategory = 'frontend' | 'backend' | 'system_design' | 'ai_ml' | 'career' | 'hackathons';
export type ReferralStatus = 'pending' | 'referred' | 'declined';

export interface IMentorProfile extends Document {
  mentorId: mongoose.Types.ObjectId; // ref: User
  currentCompany: string;
  jobTitle: string;
  yearsExperience: number;
  bio: string;
  college?: string;
  collegeVerified: boolean;
  areasOfExpertise: string[];
  hourlyAvailability: string[]; // e.g. ['Mon 6-8 PM IST', 'Sat 10-12 AM IST']
  rating: number;
  reviewCount: number;
  sessionsCount: number;
  maxMentees: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMentorshipSession extends Document {
  studentId: mongoose.Types.ObjectId; // ref: User
  mentorId: mongoose.Types.ObjectId; // ref: User
  topic: string;
  notes?: string;
  status: SessionStatus;
  proposedTimes: Date[];
  confirmedTime?: Date;
  meetingLink?: string;
  chatRoomId: string;
  studentFeedback?: {
    rating: number; // 1-5
    review: string;
    submittedAt: Date;
  };
  mentorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILearningResource extends Document {
  title: string;
  category: ResourceCategory;
  url: string;
  description: string;
  tags: string[];
  addedById: mongoose.Types.ObjectId; // ref: User
  createdAt: Date;
  updatedAt: Date;
}

export interface IAlumniReferral extends Document {
  mentorId: mongoose.Types.ObjectId; // ref: User (Alumni)
  studentId: mongoose.Types.ObjectId; // ref: User (Student)
  companyName: string;
  role: string;
  resumeUrl: string;
  note: string;
  status: ReferralStatus;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MentorProfileSchema = new Schema<IMentorProfile>(
  {
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    currentCompany: { type: String, required: true, trim: true },
    jobTitle: { type: String, required: true, trim: true },
    yearsExperience: { type: Number, required: true, min: 0 },
    bio: { type: String, required: true, maxlength: 2000 },
    college: { type: String, default: '' },
    collegeVerified: { type: Boolean, default: false },
    areasOfExpertise: { type: [String], required: true },
    hourlyAvailability: { type: [String], default: [] },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    sessionsCount: { type: Number, default: 0 },
    maxMentees: { type: Number, default: 10 },
  },
  { timestamps: true }
);

const MentorshipSessionSchema = new Schema<IMentorshipSession>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topic: { type: String, required: true, maxlength: 300 },
    notes: { type: String, default: '', maxlength: 2000 },
    status: {
      type: String,
      enum: ['requested', 'proposed', 'confirmed', 'completed', 'cancelled'],
      default: 'requested',
      index: true,
    },
    proposedTimes: { type: [Date], default: [] },
    confirmedTime: { type: Date },
    meetingLink: { type: String, default: '' },
    chatRoomId: { type: String, required: true },
    studentFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      review: { type: String, maxlength: 1000 },
      submittedAt: { type: Date },
    },
    mentorNotes: { type: String, default: '', maxlength: 2000 },
  },
  { timestamps: true }
);

const LearningResourceSchema = new Schema<ILearningResource>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['frontend', 'backend', 'system_design', 'ai_ml', 'career', 'hackathons'],
      required: true,
      index: true,
    },
    url: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 1000 },
    tags: { type: [String], default: [] },
    addedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const AlumniReferralSchema = new Schema<IAlumniReferral>(
  {
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyName: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    resumeUrl: { type: String, required: true, trim: true },
    note: { type: String, default: '', maxlength: 1500 },
    status: {
      type: String,
      enum: ['pending', 'referred', 'declined'],
      default: 'pending',
      index: true,
    },
    feedback: { type: String, default: '', maxlength: 1000 },
  },
  { timestamps: true }
);

export const MentorProfile = mongoose.model<IMentorProfile>('MentorProfile', MentorProfileSchema);
export const MentorshipSession = mongoose.model<IMentorshipSession>(
  'MentorshipSession',
  MentorshipSessionSchema
);
export const LearningResource = mongoose.model<ILearningResource>(
  'LearningResource',
  LearningResourceSchema
);
export const AlumniReferral = mongoose.model<IAlumniReferral>(
  'AlumniReferral',
  AlumniReferralSchema
);
