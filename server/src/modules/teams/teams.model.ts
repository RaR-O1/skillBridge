import mongoose, { Schema, Document } from 'mongoose';

export type TeamStatus = 'open' | 'closed';
export type TeamAppStatus = 'pending' | 'accepted' | 'rejected';

export interface ITeam extends Document {
  title: string;
  description: string;
  hackathonName: string;
  ownerId: mongoose.Types.ObjectId;
  skillsNeeded: string[];
  teamSize: number;
  members: mongoose.Types.ObjectId[];
  deadline: Date;
  status: TeamStatus;
  chatRoomId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeamApplication extends Document {
  teamId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  note: string;
  status: TeamAppStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 3000 },
    hackathonName: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    skillsNeeded: { type: [String], required: true, index: true },
    teamSize: { type: Number, required: true, min: 2, max: 20, default: 4 },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deadline: { type: Date, required: true, index: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
    chatRoomId: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

TeamSchema.index({ status: 1, deadline: 1 });

const TeamApplicationSchema = new Schema<ITeamApplication>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    note: { type: String, default: '', maxlength: 1000 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// One pending or accepted application per user per team
TeamApplicationSchema.index({ teamId: 1, applicantId: 1 }, { unique: true });

export const Team = mongoose.model<ITeam>('Team', TeamSchema);
export const TeamApplication = mongoose.model<ITeamApplication>('TeamApplication', TeamApplicationSchema);
