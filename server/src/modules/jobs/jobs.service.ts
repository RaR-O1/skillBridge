import mongoose from 'mongoose';
import { Company, Job, JobApplication, ICompany, IJob, IJobApplication, PipelineStage } from './jobs.model.js';
import { User } from '../users/users.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { NotificationService } from '../notifications/notifications.service.js';

export class JobsService {
  // Company management
  static async createCompany(
    userId: string,
    data: { name: string; domain: string; description: string; logoUrl?: string }
  ): Promise<ICompany> {
    const existing = await Company.findOne({ name: data.name });
    if (existing) {
      throw new AppError('A company with this name already exists', 409, 'COMPANY_EXISTS');
    }

    const company = new Company({
      name: data.name,
      domain: data.domain,
      description: data.description,
      logoUrl: data.logoUrl,
      verified: false,
      members: [new mongoose.Types.ObjectId(userId)],
    });

    const saved = await company.save();

    // Update user's businessName and role if appropriate
    await User.findByIdAndUpdate(userId, {
      businessName: data.name,
    });

    return saved;
  }

  static async getCompanyById(companyId: string) {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }
    const jobs = await Job.find({ companyId: company._id, status: 'open' }).sort({ createdAt: -1 });
    return { company, jobs };
  }

  static async listCompanies(): Promise<ICompany[]> {
    return await Company.find().sort({ verified: -1, createdAt: -1 });
  }

  // Job postings
  static async createJob(
    userId: string,
    data: {
      companyId: string;
      title: string;
      type: 'internship' | 'full_time' | 'contract';
      location: string;
      isRemote: boolean;
      stipendINR: number;
      requiredSkills: string[];
      description: string;
      deadline: string;
    }
  ): Promise<IJob> {
    const company = await Company.findById(data.companyId);
    if (!company) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }

    const isMember = company.members.some((m) => m.toString() === userId);
    if (!isMember) {
      throw new AppError('You are not authorized to post jobs on behalf of this company', 403, 'FORBIDDEN');
    }

    const deadlineDate = new Date(data.deadline);
    if (deadlineDate <= new Date()) {
      throw new AppError('Deadline must be in the future', 400, 'INVALID_DEADLINE');
    }

    const job = new Job({
      companyId: company._id,
      postedById: new mongoose.Types.ObjectId(userId),
      title: data.title,
      type: data.type,
      location: data.location,
      isRemote: data.isRemote,
      stipendINR: data.stipendINR,
      requiredSkills: data.requiredSkills,
      description: data.description,
      deadline: deadlineDate,
      status: 'open',
    });

    return await job.save();
  }

  static async listJobs(filters: {
    type?: string;
    skill?: string;
    search?: string;
    isRemote?: string;
    status?: string;
  }): Promise<IJob[]> {
    const query: any = {};
    const isValidStr = (v?: string) => v && v.trim() !== '' && v !== 'undefined' && v !== 'null';

    if (isValidStr(filters.status) && filters.status !== 'all') {
      query.status = filters.status;
    } else if (!isValidStr(filters.status)) {
      query.status = 'open';
    }

    if (isValidStr(filters.type)) {
      query.type = filters.type;
    }

    if (filters.isRemote === 'true') {
      query.isRemote = true;
    }

    if (isValidStr(filters.skill)) {
      query.requiredSkills = { $regex: new RegExp(filters.skill!.trim(), 'i') };
    }

    if (isValidStr(filters.search)) {
      query.$or = [
        { title: { $regex: new RegExp(filters.search!.trim(), 'i') } },
        { description: { $regex: new RegExp(filters.search!.trim(), 'i') } },
      ];
    }

    return await Job.find(query)
      .populate('companyId', 'name domain logoUrl verified')
      .populate('postedById', 'name email')
      .sort({ createdAt: -1 });
  }

  static async getJobById(jobId: string): Promise<IJob> {
    const job = await Job.findById(jobId)
      .populate('companyId', 'name domain logoUrl description verified')
      .populate('postedById', 'name email');

    if (!job) {
      throw new AppError('Job posting not found', 404, 'NOT_FOUND');
    }
    return job;
  }

  // Applications & Pipeline
  static async applyToJob(studentId: string, jobId: string, note = ''): Promise<IJobApplication> {
    const job = await Job.findById(jobId);
    if (!job) {
      throw new AppError('Job posting not found', 404, 'NOT_FOUND');
    }

    if (job.status === 'closed' || new Date() > job.deadline) {
      throw new AppError('Applications for this posting are closed', 400, 'JOB_CLOSED');
    }

    const existing = await JobApplication.findOne({
      jobId: job._id,
      studentId: new mongoose.Types.ObjectId(studentId),
    });

    if (existing) {
      throw new AppError('You have already submitted an application for this position', 400, 'APPLICATION_EXISTS');
    }

    const application = new JobApplication({
      jobId: job._id,
      studentId: new mongoose.Types.ObjectId(studentId),
      note,
      stage: 'new',
    });

    const saved = await application.save();

    // Notify recruiter
    await NotificationService.send({
      userId: job.postedById.toString(),
      title: 'New Candidate Applied',
      message: `A candidate submitted an application for "${job.title}".`,
      type: 'job_application',
      entityId: job._id.toString(),
    });

    return saved;
  }

  static async getJobApplications(recruiterId: string, jobId: string): Promise<IJobApplication[]> {
    const job = await Job.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', 404, 'NOT_FOUND');
    }

    const company = await Company.findById(job.companyId);
    if (!company || !company.members.some((m) => m.toString() === recruiterId)) {
      throw new AppError('Only verified company recruiters can access this pipeline', 403, 'FORBIDDEN');
    }

    return await JobApplication.find({ jobId: job._id })
      .populate('studentId', 'name avatarUrl college collegeVerified skills trustScore visibility')
      .sort({ createdAt: -1 });
  }

  static async getMyApplications(studentId: string): Promise<IJobApplication[]> {
    return await JobApplication.find({ studentId: new mongoose.Types.ObjectId(studentId) })
      .populate({
        path: 'jobId',
        select: 'title type location stipendINR deadline status companyId',
        populate: { path: 'companyId', select: 'name logoUrl verified' },
      })
      .sort({ createdAt: -1 });
  }

  static async updateApplicationStage(
    recruiterId: string,
    applicationId: string,
    stage: PipelineStage
  ): Promise<IJobApplication> {
    const application = await JobApplication.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
      throw new AppError('Associated job not found', 404, 'NOT_FOUND');
    }

    const company = await Company.findById(job.companyId);
    if (!company || !company.members.some((m) => m.toString() === recruiterId)) {
      throw new AppError('Forbidden: Recruiter access required', 403, 'FORBIDDEN');
    }

    application.stage = stage;
    await application.save();

    // Send stage update notification to student
    await NotificationService.send({
      userId: application.studentId.toString(),
      title: `Application Update: ${stage.toUpperCase()}`,
      message: `Your application status for "${job.title}" at ${company.name} was moved to stage: ${stage}.`,
      type: 'pipeline_update',
      entityId: job._id.toString(),
    });

    return application;
  }

  static async addApplicationNote(
    recruiterId: string,
    applicationId: string,
    text: string
  ): Promise<IJobApplication> {
    const application = await JobApplication.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }

    application.notes.push({
      authorId: new mongoose.Types.ObjectId(recruiterId),
      text,
      createdAt: new Date(),
    });

    return await application.save();
  }

  static async bulkUpdateStage(
    recruiterId: string,
    applicationIds: string[],
    stage: PipelineStage
  ): Promise<{ updatedCount: number }> {
    const applications = await JobApplication.find({
      _id: { $in: applicationIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    let count = 0;
    for (const app of applications) {
      app.stage = stage;
      await app.save();
      count++;
    }

    return { updatedCount: count };
  }
}
