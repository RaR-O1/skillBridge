export type UserRole = 'student' | 'local_business' | 'company' | 'startup' | 'mentor' | 'admin';

export interface ISkill {
  name: string;
  level: number;
  verified?: boolean;
}

export interface IUser {
  _id: string;
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  college?: string;
  collegeEmail?: string;
  collegeVerified: boolean;
  businessName?: string;
  businessVerified: boolean;
  skills: ISkill[];
  visibility: boolean;
  trustScore: number;
  status: 'active' | 'warned' | 'suspended' | 'banned';
  optInChatSummary: boolean;
  createdAt: string;
}

export interface IPortfolioItem {
  _id: string;
  userId: string;
  title: string;
  description: string;
  projectUrl?: string;
  repoUrl?: string;
  skills: string[];
  imageUrl?: string;
  featured: boolean;
  createdAt: string;
}

export interface IReview {
  _id: string;
  targetUserId: string;
  authorId: {
    _id: string;
    name: string;
    avatarUrl?: string;
    role: string;
    college?: string;
  };
  projectId?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ITeam {
  _id: string;
  title: string;
  description: string;
  hackathonName: string;
  ownerId: IUser;
  skillsNeeded: string[];
  teamSize: number;
  members: IUser[];
  deadline: string;
  status: 'open' | 'closed';
  chatRoomId: string;
  createdAt: string;
}

export interface ITeamApplication {
  _id: string;
  teamId: string;
  applicantId: IUser;
  note: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export type ProjectStatus = 'open' | 'agreement_pending' | 'assigned' | 'in_review' | 'completed' | 'cancelled';

export interface ISubmission {
  workUrl: string;
  notes: string;
  submittedAt: string;
}

export interface IAgreement {
  _id: string;
  projectId: string;
  ownerId: IUser;
  studentId: IUser;
  amountINR: number;
  paymentMethodNote: string;
  businessConfirmed: boolean;
  businessConfirmedAt?: string;
  studentConfirmed: boolean;
  studentConfirmedAt?: string;
  paymentReceived: boolean;
  paymentReceivedAt?: string;
}

export interface IProject {
  _id: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  budgetINR: number;
  deadline: string;
  ownerId: IUser;
  assignedStudentId?: IUser;
  agreementId?: string;
  submission?: ISubmission;
  paymentReceivedAt?: string;
  status: ProjectStatus;
  chatRoomId: string;
  createdAt: string;
}

export interface IProjectApplication {
  _id: string;
  projectId: string;
  studentId: IUser;
  proposedBudgetINR: number;
  coverNote: string;
  status: 'pending' | 'selected' | 'rejected';
  createdAt: string;
}

export interface IMessage {
  _id: string;
  roomId: string;
  senderId: {
    _id: string;
    name: string;
    avatarUrl?: string;
    role: string;
    college?: string;
  };
  content: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  entityId?: string;
  read: boolean;
  createdAt: string;
}

export interface IReport {
  _id: string;
  reporterId: IUser;
  targetUserId?: IUser;
  projectId?: {
    _id: string;
    title: string;
    budgetINR: number;
    status: string;
  };
  chatRoomId?: string;
  category: 'payment_not_received' | 'spam' | 'harassment' | 'fraud' | 'other';
  description: string;
  evidenceUrl?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  resolutionNotes?: string;
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, any>;
  createdAt: string;
}
