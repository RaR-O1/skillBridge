import mongoose from 'mongoose';
import { Team, TeamApplication, ITeam, ITeamApplication } from './teams.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { NotificationService } from '../notifications/notifications.service.js';

export class TeamsService {
  static async createTeam(
    ownerId: string,
    data: {
      title: string;
      description: string;
      hackathonName: string;
      skillsNeeded: string[];
      teamSize: number;
      deadline: string;
    }
  ): Promise<ITeam> {
    const deadlineDate = new Date(data.deadline);
    if (deadlineDate <= new Date()) {
      throw new AppError('Deadline must be in the future', 400, 'INVALID_DEADLINE');
    }

    const teamObjectId = new mongoose.Types.ObjectId();
    const chatRoomId = `team_${teamObjectId.toString()}`;

    const team = new Team({
      _id: teamObjectId,
      title: data.title,
      description: data.description,
      hackathonName: data.hackathonName,
      ownerId: new mongoose.Types.ObjectId(ownerId),
      skillsNeeded: data.skillsNeeded,
      teamSize: data.teamSize,
      members: [new mongoose.Types.ObjectId(ownerId)], // Owner is the first member
      deadline: deadlineDate,
      status: 'open',
      chatRoomId,
    });

    return await team.save();
  }

  static async listTeams(filters: { skill?: string; search?: string; status?: string }): Promise<ITeam[]> {
    // First, auto-close any teams whose deadline has passed
    await Team.updateMany(
      { status: 'open', deadline: { $lte: new Date() } },
      { $set: { status: 'closed' } }
    );

    const query: any = {};
    const isValidStr = (val?: string) => val && val.trim() !== '' && val !== 'undefined' && val !== 'null';

    if (isValidStr(filters.status) && filters.status !== 'all') {
      query.status = filters.status;
    } else if (!isValidStr(filters.status)) {
      query.status = 'open';
    }

    if (isValidStr(filters.skill)) {
      query.skillsNeeded = { $regex: new RegExp(filters.skill!.trim(), 'i') };
    }

    if (isValidStr(filters.search)) {
      query.$or = [
        { title: { $regex: new RegExp(filters.search!.trim(), 'i') } },
        { description: { $regex: new RegExp(filters.search!.trim(), 'i') } },
        { hackathonName: { $regex: new RegExp(filters.search!.trim(), 'i') } },
      ];
    }

    return await Team.find(query)
      .populate('ownerId', 'name avatarUrl college collegeVerified trustScore')
      .populate('members', 'name avatarUrl college collegeVerified')
      .sort({ createdAt: -1 });
  }

  static async getTeamById(teamId: string): Promise<ITeam> {
    const team = await Team.findById(teamId)
      .populate('ownerId', 'name avatarUrl college collegeVerified trustScore')
      .populate('members', 'name avatarUrl college collegeVerified skills');

    if (!team) {
      throw new AppError('Team not found', 404, 'NOT_FOUND');
    }

    // Auto-close check
    if (team.status === 'open' && new Date() > team.deadline) {
      team.status = 'closed';
      await team.save();
    }

    return team;
  }

  static async applyToTeam(applicantId: string, teamId: string, note = ''): Promise<ITeamApplication> {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new AppError('Team not found', 404, 'NOT_FOUND');
    }

    if (team.status === 'closed' || new Date() > team.deadline) {
      throw new AppError('Applications for this team are closed', 400, 'TEAM_CLOSED');
    }

    if (team.members.some((m) => m.toString() === applicantId)) {
      throw new AppError('You are already a member of this team', 400, 'ALREADY_MEMBER');
    }

    const existingApp = await TeamApplication.findOne({
      teamId: team._id,
      applicantId: new mongoose.Types.ObjectId(applicantId),
    });

    if (existingApp) {
      if (existingApp.status === 'pending') {
        throw new AppError('You already have a pending application for this team', 400, 'APPLICATION_EXISTS');
      }
      if (existingApp.status === 'accepted') {
        throw new AppError('You have already been accepted to this team', 400, 'ALREADY_ACCEPTED');
      }
      // If rejected earlier, allow re-application by updating
      existingApp.status = 'pending';
      existingApp.note = note;
      return await existingApp.save();
    }

    const application = new TeamApplication({
      teamId: team._id,
      applicantId: new mongoose.Types.ObjectId(applicantId),
      note,
      status: 'pending',
    });

    const saved = await application.save();

    // Notify team owner
    await NotificationService.send({
      userId: team.ownerId.toString(),
      title: 'New Team Application',
      message: `A student applied to join your hackathon team "${team.title}".`,
      type: 'team_application',
      entityId: team._id.toString(),
    });

    return saved;
  }

  static async getTeamApplications(userId: string, teamId: string): Promise<ITeamApplication[]> {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new AppError('Team not found', 404, 'NOT_FOUND');
    }

    if (team.ownerId.toString() !== userId) {
      throw new AppError('Only the team creator can view applications', 403, 'FORBIDDEN');
    }

    return await TeamApplication.find({ teamId: team._id })
      .populate('applicantId', 'name avatarUrl college collegeVerified skills trustScore')
      .sort({ createdAt: -1 });
  }

  static async updateApplicationStatus(
    ownerId: string,
    applicationId: string,
    status: 'accepted' | 'rejected'
  ): Promise<ITeamApplication> {
    const application = await TeamApplication.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }

    const team = await Team.findById(application.teamId);
    if (!team) {
      throw new AppError('Team not found', 404, 'NOT_FOUND');
    }

    if (team.ownerId.toString() !== ownerId) {
      throw new AppError('Only the team creator can accept or reject applications', 403, 'FORBIDDEN');
    }

    if (application.status !== 'pending') {
      throw new AppError(`Application has already been ${application.status}`, 400, 'APPLICATION_RESOLVED');
    }

    if (status === 'accepted') {
      if (team.members.length >= team.teamSize) {
        throw new AppError('Team is already at maximum capacity', 400, 'TEAM_FULL');
      }

      application.status = 'accepted';
      await application.save();

      // Add member to team
      team.members.push(application.applicantId);

      // Auto-close if full
      if (team.members.length >= team.teamSize) {
        team.status = 'closed';
      }

      await team.save();

      // Notify applicant
      await NotificationService.send({
        userId: application.applicantId.toString(),
        title: 'Team Application Accepted!',
        message: `Congratulations! You were accepted into "${team.title}". You now have access to the team chat.`,
        type: 'team_accepted',
        entityId: team._id.toString(),
      });
    } else {
      application.status = 'rejected';
      await application.save();

      await NotificationService.send({
        userId: application.applicantId.toString(),
        title: 'Team Application Update',
        message: `Your application to "${team.title}" was not accepted this time.`,
        type: 'team_rejected',
        entityId: team._id.toString(),
      });
    }

    return application;
  }
}
