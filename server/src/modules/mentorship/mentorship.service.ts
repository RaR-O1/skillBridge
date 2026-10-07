import mongoose from 'mongoose';
import {
  MentorProfile,
  MentorshipSession,
  LearningResource,
  AlumniReferral,
  IMentorProfile,
  IMentorshipSession,
  ILearningResource,
  IAlumniReferral,
  ResourceCategory,
  ReferralStatus,
} from './mentorship.model.js';
import { User } from '../users/users.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { NotificationService } from '../notifications/notifications.service.js';

export class MentorshipService {
  // Mentor Profiles
  static async upsertMentorProfile(
    userId: string,
    data: {
      currentCompany: string;
      jobTitle: string;
      yearsExperience: number;
      bio: string;
      areasOfExpertise: string[];
      hourlyAvailability?: string[];
      maxMentees?: number;
    }
  ): Promise<IMentorProfile> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const profile = await MentorProfile.findOneAndUpdate(
      { mentorId: new mongoose.Types.ObjectId(userId) },
      {
        mentorId: new mongoose.Types.ObjectId(userId),
        currentCompany: data.currentCompany,
        jobTitle: data.jobTitle,
        yearsExperience: data.yearsExperience,
        bio: data.bio,
        college: user.college,
        collegeVerified: user.collegeVerified,
        areasOfExpertise: data.areasOfExpertise,
        hourlyAvailability: data.hourlyAvailability || [],
        maxMentees: data.maxMentees || 10,
      },
      { upsert: true, new: true, runValidators: true }
    ).populate('mentorId', 'name avatarUrl email college collegeVerified trustScore');

    await User.findByIdAndUpdate(userId, { role: 'mentor' });

    return profile;
  }

  static async listMentors(filters: {
    expertise?: string;
    search?: string;
  }): Promise<IMentorProfile[]> {
    const query: any = {};
    const isValidStr = (v?: string) => v && v.trim() !== '' && v !== 'undefined' && v !== 'null';

    if (isValidStr(filters.expertise)) {
      query.areasOfExpertise = { $regex: new RegExp(filters.expertise!.trim(), 'i') };
    }

    if (isValidStr(filters.search)) {
      query.$or = [
        { currentCompany: { $regex: new RegExp(filters.search!.trim(), 'i') } },
        { jobTitle: { $regex: new RegExp(filters.search!.trim(), 'i') } },
        { bio: { $regex: new RegExp(filters.search!.trim(), 'i') } },
      ];
    }

    return await MentorProfile.find(query)
      .populate('mentorId', 'name avatarUrl email college collegeVerified trustScore')
      .sort({ rating: -1, sessionsCount: -1 });
  }

  static async getMentorById(mentorIdOrUserId: string): Promise<IMentorProfile> {
    let profile = await MentorProfile.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(mentorIdOrUserId) ? new mongoose.Types.ObjectId(mentorIdOrUserId) : null },
        { mentorId: mongoose.isValidObjectId(mentorIdOrUserId) ? new mongoose.Types.ObjectId(mentorIdOrUserId) : null },
      ].filter(Boolean) as any,
    }).populate('mentorId', 'name avatarUrl email college collegeVerified trustScore');

    if (!profile) {
      throw new AppError('Mentor profile not found', 404, 'NOT_FOUND');
    }
    return profile;
  }

  // Sessions Lifecycle
  static async requestSession(
    studentId: string,
    mentorId: string,
    data: {
      topic: string;
      notes?: string;
      proposedTimes: string[];
    }
  ): Promise<IMentorshipSession> {
    if (studentId === mentorId) {
      throw new AppError('Cannot request mentorship session with yourself', 400, 'SELF_MENTORSHIP');
    }

    const mentor = await User.findById(mentorId);
    if (!mentor) {
      throw new AppError('Mentor not found', 404, 'NOT_FOUND');
    }

    const sessionId = new mongoose.Types.ObjectId();
    const chatRoomId = `session_${sessionId.toString()}`;

    const session = new MentorshipSession({
      _id: sessionId,
      studentId: new mongoose.Types.ObjectId(studentId),
      mentorId: new mongoose.Types.ObjectId(mentorId),
      topic: data.topic,
      notes: data.notes || '',
      status: 'requested',
      proposedTimes: data.proposedTimes.map((t) => new Date(t)),
      chatRoomId,
    });

    const saved = await session.save();

    await NotificationService.send({
      userId: mentorId,
      title: 'New Mentorship Request',
      message: `A student requested a mentorship session on "${data.topic}".`,
      type: 'session_request',
      entityId: saved._id.toString(),
    });

    return saved;
  }

  static async proposeTimes(
    mentorId: string,
    sessionId: string,
    proposedTimes: string[]
  ): Promise<IMentorshipSession> {
    const session = await MentorshipSession.findById(sessionId);
    if (!session) {
      throw new AppError('Session not found', 404, 'NOT_FOUND');
    }

    if (session.mentorId.toString() !== mentorId) {
      throw new AppError('Only the assigned mentor can propose meeting times', 403, 'FORBIDDEN');
    }

    session.proposedTimes = proposedTimes.map((t) => new Date(t));
    session.status = 'proposed';
    await session.save();

    await NotificationService.send({
      userId: session.studentId.toString(),
      title: 'Mentor Proposed Times',
      message: `Your mentor proposed new time slots for "${session.topic}". Select one to confirm.`,
      type: 'session_proposed',
      entityId: session._id.toString(),
    });

    return session;
  }

  static async confirmSession(
    userId: string,
    sessionId: string,
    confirmedTime: string,
    meetingLink?: string
  ): Promise<IMentorshipSession> {
    const session = await MentorshipSession.findById(sessionId);
    if (!session) {
      throw new AppError('Session not found', 404, 'NOT_FOUND');
    }

    const isStudent = session.studentId.toString() === userId;
    const isMentor = session.mentorId.toString() === userId;
    if (!isStudent && !isMentor) {
      throw new AppError('Unauthorized to confirm this session', 403, 'FORBIDDEN');
    }

    session.confirmedTime = new Date(confirmedTime);
    session.status = 'confirmed';
    if (meetingLink) {
      session.meetingLink = meetingLink;
    } else if (!session.meetingLink) {
      session.meetingLink = `https://meet.skillbridge.edu/session-${session._id}`;
    }

    await session.save();

    // Increment mentor session count
    await MentorProfile.findOneAndUpdate(
      { mentorId: session.mentorId },
      { $inc: { sessionsCount: 1 } }
    );

    // Notify other party
    const recipientId = isStudent ? session.mentorId.toString() : session.studentId.toString();
    await NotificationService.send({
      userId: recipientId,
      title: 'Mentorship Session Confirmed!',
      message: `The session for "${session.topic}" is confirmed for ${new Date(confirmedTime).toLocaleString()}.`,
      type: 'session_confirmed',
      entityId: session._id.toString(),
    });

    return session;
  }

  static async submitFeedback(
    studentId: string,
    sessionId: string,
    rating: number,
    review: string
  ): Promise<IMentorshipSession> {
    const session = await MentorshipSession.findById(sessionId);
    if (!session) {
      throw new AppError('Session not found', 404, 'NOT_FOUND');
    }

    if (session.studentId.toString() !== studentId) {
      throw new AppError('Only the mentee student can submit session feedback', 403, 'FORBIDDEN');
    }

    session.studentFeedback = {
      rating,
      review,
      submittedAt: new Date(),
    };
    session.status = 'completed';
    await session.save();

    // Update mentor's overall rating
    const mentorProfile = await MentorProfile.findOne({ mentorId: session.mentorId });
    if (mentorProfile) {
      const currentRating = mentorProfile.rating || 5.0;
      const count = mentorProfile.reviewCount || 0;
      const newRating = Number(((currentRating * count + rating) / (count + 1)).toFixed(1));
      mentorProfile.rating = newRating;
      mentorProfile.reviewCount = count + 1;
      await mentorProfile.save();
    }

    return session;
  }

  static async listSessions(userId: string): Promise<IMentorshipSession[]> {
    return await MentorshipSession.find({
      $or: [
        { studentId: new mongoose.Types.ObjectId(userId) },
        { mentorId: new mongoose.Types.ObjectId(userId) },
      ],
    })
      .populate('studentId', 'name avatarUrl college collegeVerified trustScore')
      .populate('mentorId', 'name avatarUrl college collegeVerified trustScore')
      .sort({ createdAt: -1 });
  }

  // Learning Resources Library
  static async listResources(category?: string, tag?: string): Promise<ILearningResource[]> {
    const query: any = {};
    const isValidStr = (v?: string) => v && v.trim() !== '' && v !== 'undefined' && v !== 'null';

    if (isValidStr(category)) {
      query.category = category;
    }
    if (isValidStr(tag)) {
      query.tags = { $regex: new RegExp(tag!.trim(), 'i') };
    }

    return await LearningResource.find(query)
      .populate('addedById', 'name avatarUrl role')
      .sort({ createdAt: -1 });
  }

  static async createResource(
    userId: string,
    data: {
      title: string;
      category: ResourceCategory;
      url: string;
      description: string;
      tags?: string[];
    }
  ): Promise<ILearningResource> {
    const resource = new LearningResource({
      ...data,
      addedById: new mongoose.Types.ObjectId(userId),
    });
    return await resource.save();
  }

  // Alumni Referrals
  static async requestReferral(
    studentId: string,
    data: {
      mentorId: string;
      companyName: string;
      role: string;
      resumeUrl: string;
      note?: string;
    }
  ): Promise<IAlumniReferral> {
    const mentor = await User.findById(data.mentorId);
    if (!mentor) {
      throw new AppError('Mentor / Alumni not found', 404, 'NOT_FOUND');
    }

    const referral = new AlumniReferral({
      mentorId: new mongoose.Types.ObjectId(data.mentorId),
      studentId: new mongoose.Types.ObjectId(studentId),
      companyName: data.companyName,
      role: data.role,
      resumeUrl: data.resumeUrl,
      note: data.note || '',
      status: 'pending',
    });

    const saved = await referral.save();

    await NotificationService.send({
      userId: data.mentorId,
      title: 'New Alumni Referral Request',
      message: `A student requested an internal referral for ${data.role} at ${data.companyName}.`,
      type: 'referral_request',
      entityId: saved._id.toString(),
    });

    return saved;
  }

  static async listReferrals(userId: string): Promise<IAlumniReferral[]> {
    return await AlumniReferral.find({
      $or: [
        { studentId: new mongoose.Types.ObjectId(userId) },
        { mentorId: new mongoose.Types.ObjectId(userId) },
      ],
    })
      .populate('studentId', 'name avatarUrl college collegeVerified trustScore')
      .populate('mentorId', 'name avatarUrl college collegeVerified')
      .sort({ createdAt: -1 });
  }

  static async updateReferral(
    mentorId: string,
    referralId: string,
    status: ReferralStatus,
    feedback?: string
  ): Promise<IAlumniReferral> {
    const referral = await AlumniReferral.findById(referralId);
    if (!referral) {
      throw new AppError('Referral not found', 404, 'NOT_FOUND');
    }

    if (referral.mentorId.toString() !== mentorId) {
      throw new AppError('Only the assigned alumni can update referral status', 403, 'FORBIDDEN');
    }

    referral.status = status;
    if (feedback) {
      referral.feedback = feedback;
    }
    await referral.save();

    await NotificationService.send({
      userId: referral.studentId.toString(),
      title: `Referral Request ${status.toUpperCase()}`,
      message: `Your referral request for ${referral.companyName} was updated to: ${status}.`,
      type: 'referral_update',
      entityId: referral._id.toString(),
    });

    return referral;
  }
}
