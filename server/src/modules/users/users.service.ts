import { User, IUser } from './users.model.js';
import { PortfolioService } from '../portfolio/portfolio.service.js';
import { AppError } from '../../middleware/errorHandler.js';

export class UsersService {
  static async updateProfile(userId: string, data: Partial<IUser>): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    if (data.name) user.name = data.name;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.college !== undefined) user.college = data.college;
    if (data.businessName !== undefined) user.businessName = data.businessName;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;
    if (data.skills) user.skills = data.skills;
    if (data.visibility !== undefined) user.visibility = data.visibility;
    if (data.optInChatSummary !== undefined) user.optInChatSummary = data.optInChatSummary;

    await user.save();
    return user;
  }

  static async getPublicProfile(identifier: string) {
    let query: any = { _id: identifier };
    if (!identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query = { uid: identifier };
    }

    const user = await User.findOne(query);
    if (!user || user.status === 'banned') {
      throw new AppError('User profile not found', 404, 'NOT_FOUND');
    }

    const portfolio = await PortfolioService.getUserPortfolio(user._id.toString());
    const { reviews, averageRating, count: reviewCount } = await PortfolioService.getUserReviews(user._id.toString());

    // Never return private email, collegeEmail or internal tokens
    return {
      _id: user._id,
      uid: user.uid,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      bio: user.bio,
      college: user.college,
      collegeVerified: user.collegeVerified,
      businessName: user.businessName,
      businessVerified: user.businessVerified,
      skills: user.skills,
      trustScore: user.trustScore,
      portfolio,
      reviews,
      averageRating,
      reviewCount,
      createdAt: user.createdAt,
    };
  }

  static async searchTalent(query: { skill?: string; college?: string; minTrust?: number }) {
    const filter: any = {
      role: 'student',
      status: 'active',
      visibility: true, // Only students who opted in to recruiter visibility
    };

    if (query.skill) {
      filter['skills.name'] = { $regex: new RegExp(query.skill, 'i') };
    }
    if (query.college) {
      filter.college = { $regex: new RegExp(query.college, 'i') };
    }
    if (query.minTrust) {
      filter.trustScore = { $gte: Number(query.minTrust) };
    }

    const students = await User.find(filter)
      .select('-collegeEmail -collegeVerificationToken -collegeVerificationExpires')
      .limit(30)
      .sort({ collegeVerified: -1, trustScore: -1 });

    return students;
  }
}
