import mongoose, { Schema, Document } from 'mongoose';

export type FeedbackAction = 'thumbs_up' | 'thumbs_down' | 'dismiss';
export type EntityType = 'job' | 'project' | 'student' | 'mentor' | 'team' | 'startup_role';

export interface IRecommendationFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  entityId: string;
  entityType: EntityType;
  action: FeedbackAction;
  createdAt: Date;
}

export interface IWhyMatchCache extends Document {
  cacheKey: string;
  whyThisMatch: string;
  rankingScore: number;
  similarity: number;
  skillOverlap: number;
  trustScore: number;
  freshness: number;
  createdAt: Date;
}

const RecommendationFeedbackSchema = new Schema<IRecommendationFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    entityId: { type: String, required: true, index: true },
    entityType: {
      type: String,
      enum: ['job', 'project', 'student', 'mentor', 'team', 'startup_role'],
      required: true,
    },
    action: {
      type: String,
      enum: ['thumbs_up', 'thumbs_down', 'dismiss'],
      required: true,
    },
  },
  { timestamps: true }
);

RecommendationFeedbackSchema.index({ userId: 1, entityId: 1 }, { unique: true });

const WhyMatchCacheSchema = new Schema<IWhyMatchCache>(
  {
    cacheKey: { type: String, required: true, unique: true, index: true },
    whyThisMatch: { type: String, required: true },
    rankingScore: { type: Number, required: true },
    similarity: { type: Number, required: true },
    skillOverlap: { type: Number, required: true },
    trustScore: { type: Number, required: true },
    freshness: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, expires: 86400 }, // 24hr TTL cache
  }
);

export const RecommendationFeedback = mongoose.model<IRecommendationFeedback>(
  'RecommendationFeedback',
  RecommendationFeedbackSchema
);
export const WhyMatchCache = mongoose.model<IWhyMatchCache>(
  'WhyMatchCache',
  WhyMatchCacheSchema
);
