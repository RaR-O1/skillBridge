import mongoose from 'mongoose';
import { Project, ProjectApplication, IProject, IProjectApplication } from './projects.model.js';
import { Agreement } from '../agreements/agreements.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { NotificationService } from '../notifications/notifications.service.js';

export class ProjectsService {
  static async createProject(
    ownerId: string,
    data: {
      title: string;
      description: string;
      category: string;
      requiredSkills: string[];
      budgetINR: number;
      deadline: string;
    }
  ): Promise<IProject> {
    const deadlineDate = new Date(data.deadline);
    if (deadlineDate <= new Date()) {
      throw new AppError('Deadline must be in the future', 400, 'INVALID_DEADLINE');
    }

    const projectObjectId = new mongoose.Types.ObjectId();
    const chatRoomId = `project_${projectObjectId.toString()}`;

    const project = new Project({
      _id: projectObjectId,
      title: data.title,
      description: data.description,
      category: data.category,
      requiredSkills: data.requiredSkills,
      budgetINR: data.budgetINR,
      deadline: deadlineDate,
      ownerId: new mongoose.Types.ObjectId(ownerId),
      status: 'open',
      chatRoomId,
    });

    return await project.save();
  }

  static async listProjects(filters: {
    category?: string;
    skill?: string;
    search?: string;
    status?: string;
    minBudget?: number;
    maxBudget?: number;
  }): Promise<IProject[]> {
    const query: any = {};

    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    } else if (!filters.status) {
      query.status = { $in: ['open', 'agreement_pending', 'assigned', 'in_review'] };
    }

    if (filters.category) {
      query.category = { $regex: new RegExp(filters.category, 'i') };
    }

    if (filters.skill) {
      query.requiredSkills = { $regex: new RegExp(filters.skill, 'i') };
    }

    if (filters.minBudget || filters.maxBudget) {
      query.budgetINR = {};
      if (filters.minBudget) query.budgetINR.$gte = Number(filters.minBudget);
      if (filters.maxBudget) query.budgetINR.$lte = Number(filters.maxBudget);
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: new RegExp(filters.search, 'i') } },
        { description: { $regex: new RegExp(filters.search, 'i') } },
      ];
    }

    return await Project.find(query)
      .populate('ownerId', 'name avatarUrl businessName businessVerified trustScore')
      .populate('assignedStudentId', 'name avatarUrl college collegeVerified')
      .sort({ createdAt: -1 });
  }

  static async getProjectById(projectId: string): Promise<{ project: IProject; agreement?: any }> {
    const project = await Project.findById(projectId)
      .populate('ownerId', 'name avatarUrl businessName businessVerified trustScore email')
      .populate('assignedStudentId', 'name avatarUrl college collegeVerified trustScore email');

    if (!project) {
      throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    const agreement = await Agreement.findOne({ projectId: project._id })
      .populate('ownerId', 'name avatarUrl')
      .populate('studentId', 'name avatarUrl');

    return { project, agreement };
  }

  static async applyToProject(
    studentId: string,
    projectId: string,
    proposedBudgetINR: number,
    coverNote: string
  ): Promise<IProjectApplication> {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    if (project.ownerId.toString() === studentId) {
      throw new AppError('Cannot apply to your own project', 400, 'OWN_PROJECT');
    }

    if (project.status !== 'open') {
      throw new AppError('This project is no longer accepting new proposals', 400, 'PROJECT_NOT_OPEN');
    }

    const existing = await ProjectApplication.findOne({
      projectId: project._id,
      studentId: new mongoose.Types.ObjectId(studentId),
    });

    if (existing) {
      if (existing.status === 'pending') {
        throw new AppError('You have already applied to this project', 400, 'APPLICATION_EXISTS');
      }
      existing.proposedBudgetINR = proposedBudgetINR;
      existing.coverNote = coverNote;
      existing.status = 'pending';
      return await existing.save();
    }

    const application = new ProjectApplication({
      projectId: project._id,
      studentId: new mongoose.Types.ObjectId(studentId),
      proposedBudgetINR,
      coverNote,
      status: 'pending',
    });

    const saved = await application.save();

    // Notify project owner
    await NotificationService.send({
      userId: project.ownerId.toString(),
      title: 'New Project Proposal',
      message: `A student submitted a proposal for "${project.title}" with quote ₹${proposedBudgetINR}.`,
      type: 'project_proposal',
      entityId: project._id.toString(),
    });

    return saved;
  }

  static async getProjectApplications(ownerId: string, projectId: string): Promise<IProjectApplication[]> {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    if (project.ownerId.toString() !== ownerId) {
      throw new AppError('Only the project owner can view proposals', 403, 'FORBIDDEN');
    }

    return await ProjectApplication.find({ projectId: project._id })
      .populate('studentId', 'name avatarUrl college collegeVerified skills trustScore')
      .sort({ createdAt: -1 });
  }

  static async submitDeliverable(
    studentId: string,
    projectId: string,
    workUrl: string,
    notes: string
  ): Promise<IProject> {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    if (project.assignedStudentId?.toString() !== studentId) {
      throw new AppError('Only the assigned student can submit project deliverables', 403, 'FORBIDDEN');
    }

    if (project.status !== 'assigned') {
      throw new AppError(`Cannot submit deliverable when project is in '${project.status}' status`, 400, 'INVALID_STATUS');
    }

    project.submission = {
      workUrl,
      notes,
      submittedAt: new Date(),
    };
    project.status = 'in_review';
    await project.save();

    // Notify owner to review deliverable
    await NotificationService.send({
      userId: project.ownerId.toString(),
      title: 'Work Submitted for Review',
      message: `The student submitted deliverable for "${project.title}". Please inspect and approve.`,
      type: 'submission_received',
      entityId: project._id.toString(),
    });

    return project;
  }

  static async approveDeliverable(ownerId: string, projectId: string): Promise<IProject> {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    if (project.ownerId.toString() !== ownerId) {
      throw new AppError('Only the project owner can approve deliverables', 403, 'FORBIDDEN');
    }

    if (project.status !== 'in_review') {
      throw new AppError('Project must be in review before it can be approved', 400, 'INVALID_STATUS');
    }

    project.status = 'completed';
    await project.save();

    // Notify student to confirm payment once settled
    if (project.assignedStudentId) {
      await NotificationService.send({
        userId: project.assignedStudentId.toString(),
        title: 'Work Approved! Settle Payment',
        message: `Your work for "${project.title}" has been approved! Once you receive direct settlement, tap "Payment received" to unlock reviews.`,
        type: 'project_completed',
        entityId: project._id.toString(),
      });
    }

    return project;
  }

  static async cancelProject(userId: string, projectId: string, reason?: string): Promise<IProject> {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    const isOwner = project.ownerId.toString() === userId;
    const isAssigned = project.assignedStudentId?.toString() === userId;

    if (!isOwner && !isAssigned) {
      throw new AppError('Only the owner or assigned student can cancel the project', 403, 'FORBIDDEN');
    }

    if (project.status === 'completed') {
      throw new AppError('Cannot cancel a completed project', 400, 'ALREADY_COMPLETED');
    }

    project.status = 'cancelled';
    await project.save();

    const notifyId = isOwner ? project.assignedStudentId?.toString() : project.ownerId.toString();
    if (notifyId) {
      await NotificationService.send({
        userId: notifyId,
        title: 'Project Cancelled',
        message: `Project "${project.title}" was cancelled. ${reason ? `Reason: ${reason}` : ''}`,
        type: 'project_cancelled',
        entityId: project._id.toString(),
      });
    }

    return project;
  }
}
