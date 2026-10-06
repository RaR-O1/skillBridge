import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolioItem extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  projectUrl?: string;
  repoUrl?: string;
  skills: string[];
  imageUrl?: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioItemSchema = new Schema<IPortfolioItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    projectUrl: { type: String, trim: true },
    repoUrl: { type: String, trim: true },
    skills: { type: [String], default: [] },
    imageUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export interface IReview extends Document {
  targetUserId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const PortfolioItem = mongoose.model<IPortfolioItem>('PortfolioItem', PortfolioItemSchema);
export const Review = mongoose.model<IReview>('Review', ReviewSchema);
