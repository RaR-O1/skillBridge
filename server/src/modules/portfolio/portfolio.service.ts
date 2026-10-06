import mongoose from 'mongoose';
import { PortfolioItem, Review, IPortfolioItem, IReview } from './portfolio.model.js';
import { User } from '../users/users.model.js';
import { Project } from '../projects/projects.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class PortfolioService {
  static async addItem(userId: string, data: Partial<IPortfolioItem>): Promise<IPortfolioItem> {
    const item = new PortfolioItem({
      ...data,
      userId: new mongoose.Types.ObjectId(userId),
    });
    return await item.save();
  }

  static async updateItem(userId: string, itemId: string, data: Partial<IPortfolioItem>): Promise<IPortfolioItem> {
    const item = await PortfolioItem.findById(itemId);
    if (!item) {
      throw new AppError('Portfolio item not found', 404, 'NOT_FOUND');
    }
    if (item.userId.toString() !== userId) {
      throw new AppError('Forbidden: You can only edit your own portfolio items', 403, 'FORBIDDEN');
    }
    Object.assign(item, data);
    return await item.save();
  }

  static async deleteItem(userId: string, itemId: string): Promise<void> {
    const item = await PortfolioItem.findById(itemId);
    if (!item) {
      throw new AppError('Portfolio item not found', 404, 'NOT_FOUND');
    }
    if (item.userId.toString() !== userId) {
      throw new AppError('Forbidden: You can only delete your own portfolio items', 403, 'FORBIDDEN');
    }
    await PortfolioItem.findByIdAndDelete(itemId);
  }

  static async getUserPortfolio(userId: string): Promise<IPortfolioItem[]> {
    return await PortfolioItem.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ featured: -1, createdAt: -1 });
  }

  static async createReview(
    authorId: string,
    data: { targetUserId: string; projectId?: string; rating: number; comment: string }
  ): Promise<IReview> {
    if (authorId === data.targetUserId) {
      throw new AppError('Cannot write a review for yourself', 400, 'SELF_REVIEW_NOT_ALLOWED');
    }

    // If linked to a project, enforce the rule:
    // "reviews unlock after student taps 'Payment received'"
    if (data.projectId) {
      const project = await Project.findById(data.projectId);
      if (!project) {
        throw new AppError('Project not found', 404, 'NOT_FOUND');
      }

      if (project.status !== 'completed' || !project.paymentReceivedAt) {
        throw new AppError(
          'Reviews only unlock after project completion and payment confirmation has been recorded by the student.',
          400,
          'REVIEWS_LOCKED'
        );
      }

      // Check that author and target were participants
      const isOwner = project.ownerId.toString() === authorId;
      const isAssigned = project.assignedStudentId?.toString() === authorId;
      if (!isOwner && !isAssigned) {
        throw new AppError('Only verified project participants can submit a review for this project', 403, 'FORBIDDEN');
      }

      // Check if already reviewed for this project
      const existing = await Review.findOne({
        projectId: new mongoose.Types.ObjectId(data.projectId),
        authorId: new mongoose.Types.ObjectId(authorId),
      });
      if (existing) {
        throw new AppError('You have already submitted a review for this project', 400, 'ALREADY_REVIEWED');
      }
    }

    const review = new Review({
      targetUserId: new mongoose.Types.ObjectId(data.targetUserId),
      authorId: new mongoose.Types.ObjectId(authorId),
      projectId: data.projectId ? new mongoose.Types.ObjectId(data.projectId) : undefined,
      rating: data.rating,
      comment: data.comment,
    });

    await review.save();

    // Update target user's trust score
    const allUserReviews = await Review.find({ targetUserId: new mongoose.Types.ObjectId(data.targetUserId) });
    const avgRating = allUserReviews.reduce((sum, r) => sum + r.rating, 0) / allUserReviews.length;
    
    // Scale trustScore based on reviews (e.g. 5 stars maintains/boosts, <3 decreases)
    await User.findByIdAndUpdate(data.targetUserId, {
      trustScore: Math.min(100, Math.max(20, Math.round(avgRating * 20))),
    });

    return review;
  }

  static async getUserReviews(targetUserId: string): Promise<{ reviews: IReview[]; averageRating: number; count: number }> {
    const reviews = await Review.find({ targetUserId: new mongoose.Types.ObjectId(targetUserId) })
      .populate('authorId', 'name avatarUrl role college')
      .sort({ createdAt: -1 });

    const count = reviews.length;
    const averageRating = count > 0 ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)) : 5.0;

    return { reviews, averageRating, count };
  }
}
