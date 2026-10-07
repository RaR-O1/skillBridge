import mongoose from 'mongoose';
import {
  Startup,
  StartupApplication,
  CoFounderProfile,
  IStartup,
  IStartupApplication,
  ICoFounderProfile,
  RoleType,
} from './startups.model.js';
import { User } from '../users/users.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { NotificationService } from '../notifications/notifications.service.js';

export class StartupsService {
  // Startups management
  static async createStartup(
    founderId: string,
    data: {
      name: string;
      pitch: string;
      description: string;
      stage: 'ideation' | 'mvp' | 'early_traction' | 'scaling';
      website?: string;
    }
  ): Promise<IStartup> {
    const existing = await Startup.findOne({ name: data.name });
    if (existing) {
      throw new AppError('A startup with this name already exists', 409, 'STARTUP_EXISTS');
    }

    const startup = new Startup({
      ...data,
      founders: [new mongoose.Types.ObjectId(founderId)],
      verified: false,
    });

    const saved = await startup.save();

    await User.findByIdAndUpdate(founderId, {
      businessName: data.name,
      role: 'startup',
    });

    return saved;
  }

  static async listStartups(filters: {
    stage?: string;
    roleType?: string;
    skill?: string;
    search?: string;
  }): Promise<IStartup[]> {
    const query: any = {};
    const isValidStr = (v?: string) => v && v.trim() !== '' && v !== 'undefined' && v !== 'null';

    if (isValidStr(filters.stage)) {
      query.stage = filters.stage;
    }

    if (isValidStr(filters.roleType)) {
      query.openRoles = {
        $elemMatch: { roleType: filters.roleType, status: 'open' },
      };
    }

    if (isValidStr(filters.skill)) {
      query['openRoles.requiredSkills'] = { $regex: new RegExp(filters.skill!.trim(), 'i') };
    }

    if (isValidStr(filters.search)) {
      query.$or = [
        { name: { $regex: new RegExp(filters.search!.trim(), 'i') } },
        { pitch: { $regex: new RegExp(filters.search!.trim(), 'i') } },
        { description: { $regex: new RegExp(filters.search!.trim(), 'i') } },
      ];
    }

    return await Startup.find(query)
      .populate('founders', 'name email avatarUrl college collegeVerified trustScore')
      .sort({ createdAt: -1 });
  }

  static async getStartupById(id: string): Promise<IStartup> {
    const startup = await Startup.findById(id).populate(
      'founders',
      'name email avatarUrl college collegeVerified trustScore'
    );
    if (!startup) {
      throw new AppError('Startup profile not found', 404, 'NOT_FOUND');
    }
    return startup;
  }

  static async addRole(
    founderId: string,
    startupId: string,
    data: {
      roleTitle: string;
      roleType: RoleType;
      requiredSkills: string[];
      equityOrStipend: string;
      description: string;
    }
  ): Promise<IStartup> {
    const startup = await Startup.findById(startupId);
    if (!startup) {
      throw new AppError('Startup not found', 404, 'NOT_FOUND');
    }

    const isFounder = startup.founders.some((f) => f.toString() === founderId);
    if (!isFounder) {
      throw new AppError('Only registered startup founders can add open roles', 403, 'FORBIDDEN');
    }

    const newRole = {
      _id: new mongoose.Types.ObjectId(),
      ...data,
      status: 'open' as const,
      createdAt: new Date(),
    };

    startup.openRoles.push(newRole as any);
    return await startup.save();
  }

  static async updateRoleStatus(
    founderId: string,
    startupId: string,
    roleId: string,
    status: 'open' | 'closed'
  ): Promise<IStartup> {
    const startup = await Startup.findById(startupId);
    if (!startup) {
      throw new AppError('Startup not found', 404, 'NOT_FOUND');
    }

    const isFounder = startup.founders.some((f) => f.toString() === founderId);
    if (!isFounder) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }

    const role = startup.openRoles.find((r) => r._id.toString() === roleId);
    if (!role) {
      throw new AppError('Role not found', 404, 'NOT_FOUND');
    }

    role.status = status;
    return await startup.save();
  }

  static async applyToRole(
    applicantId: string,
    startupId: string,
    roleId: string,
    coverLetter = ''
  ): Promise<IStartupApplication> {
    const startup = await Startup.findById(startupId);
    if (!startup) {
      throw new AppError('Startup not found', 404, 'NOT_FOUND');
    }

    const role = startup.openRoles.find((r) => r._id.toString() === roleId);
    if (!role || role.status === 'closed') {
      throw new AppError('This role is closed or unavailable', 400, 'ROLE_CLOSED');
    }

    const existing = await StartupApplication.findOne({
      roleId: new mongoose.Types.ObjectId(roleId),
      applicantId: new mongoose.Types.ObjectId(applicantId),
    });

    if (existing) {
      throw new AppError('You have already applied for this role', 400, 'ALREADY_APPLIED');
    }

    const app = new StartupApplication({
      startupId: startup._id,
      roleId: new mongoose.Types.ObjectId(roleId),
      applicantId: new mongoose.Types.ObjectId(applicantId),
      coverLetter,
      status: 'pending',
    });

    const saved = await app.save();

    // Notify founders
    for (const fId of startup.founders) {
      await NotificationService.send({
        userId: fId.toString(),
        title: 'New Startup Role Applicant',
        message: `A candidate submitted an application for "${role.roleTitle}" at ${startup.name}.`,
        type: 'startup_application',
        entityId: startup._id.toString(),
      });
    }

    return saved;
  }

  static async getStartupApplications(founderId: string, startupId: string): Promise<IStartupApplication[]> {
    const startup = await Startup.findById(startupId);
    if (!startup) {
      throw new AppError('Startup not found', 404, 'NOT_FOUND');
    }

    const isFounder = startup.founders.some((f) => f.toString() === founderId);
    if (!isFounder) {
      throw new AppError('Only startup founders can view role applications', 403, 'FORBIDDEN');
    }

    return await StartupApplication.find({ startupId: startup._id })
      .populate('applicantId', 'name avatarUrl college collegeVerified skills trustScore')
      .sort({ createdAt: -1 });
  }

  static async updateApplicationStatus(
    founderId: string,
    applicationId: string,
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  ): Promise<IStartupApplication> {
    const application = await StartupApplication.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }

    const startup = await Startup.findById(application.startupId);
    if (!startup || !startup.founders.some((f) => f.toString() === founderId)) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }

    application.status = status;
    await application.save();

    await NotificationService.send({
      userId: application.applicantId.toString(),
      title: `Startup Application ${status.toUpperCase()}`,
      message: `Your application status at ${startup.name} was updated to: ${status}.`,
      type: 'startup_application_update',
      entityId: startup._id.toString(),
    });

    return application;
  }

  // Co-Founder Matching
  static async upsertCoFounderProfile(
    userId: string,
    data: {
      college?: string;
      bio: string;
      skills: string[];
      idealCoFounderRole: string;
      targetIndustry: string;
      hoursPerWeek: number;
      lookingFor: string;
      active?: boolean;
    }
  ): Promise<ICoFounderProfile> {
    const profile = await CoFounderProfile.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        userId: new mongoose.Types.ObjectId(userId),
        ...data,
      },
      { upsert: true, new: true, runValidators: true }
    ).populate('userId', 'name avatarUrl email college collegeVerified trustScore');

    return profile;
  }

  static async listCoFounders(filters: {
    skill?: string;
    industry?: string;
    minHours?: number;
  }): Promise<ICoFounderProfile[]> {
    const query: any = { active: true };
    const isValidStr = (v?: string) => v && v.trim() !== '' && v !== 'undefined' && v !== 'null';

    if (isValidStr(filters.skill)) {
      query.skills = { $regex: new RegExp(filters.skill!.trim(), 'i') };
    }

    if (isValidStr(filters.industry)) {
      query.targetIndustry = { $regex: new RegExp(filters.industry!.trim(), 'i') };
    }

    if (filters.minHours) {
      query.hoursPerWeek = { $gte: Number(filters.minHours) };
    }

    return await CoFounderProfile.find(query)
      .populate('userId', 'name avatarUrl college collegeVerified trustScore')
      .sort({ updatedAt: -1 });
  }

  static async getCoFounderProfile(userId: string): Promise<ICoFounderProfile | null> {
    return await CoFounderProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) }).populate(
      'userId',
      'name avatarUrl college collegeVerified trustScore'
    );
  }
}
