import mongoose from 'mongoose';
import { Agreement, IAgreement } from './agreements.model.js';
import { Project, ProjectApplication } from '../projects/projects.model.js';
import { User } from '../users/users.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { NotificationService } from '../notifications/notifications.service.js';

export class AgreementsService {
  static async initiateAgreement(
    ownerId: string,
    projectId: string,
    studentId: string,
    amountINR?: number,
    paymentMethodNote?: string
  ): Promise<IAgreement> {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    if (project.ownerId.toString() !== ownerId) {
      throw new AppError('Only the project owner can select a student and initiate the price agreement', 403, 'FORBIDDEN');
    }

    if (project.status !== 'open' && project.status !== 'agreement_pending') {
      throw new AppError(`Cannot select student for project in '${project.status}' state`, 400, 'INVALID_STATUS');
    }

    const student = await User.findById(studentId);
    if (!student) {
      throw new AppError('Student profile not found', 404, 'NOT_FOUND');
    }

    const finalAmount = amountINR || project.budgetINR;

    // Check if an agreement already exists
    let agreement = await Agreement.findOne({ projectId: project._id });
    if (!agreement) {
      agreement = new Agreement({
        projectId: project._id,
        ownerId: project.ownerId,
        studentId: student._id,
        amountINR: finalAmount,
        paymentMethodNote: paymentMethodNote || 'Direct peer-to-peer settlement (UPI / IMPS / Cash) upon approval',
        businessConfirmed: true, // Owner implicitly confirmed by selecting
        businessConfirmedAt: new Date(),
        studentConfirmed: false,
      });
    } else {
      agreement.studentId = student._id;
      agreement.amountINR = finalAmount;
      agreement.businessConfirmed = true;
      agreement.businessConfirmedAt = new Date();
      agreement.studentConfirmed = false;
      agreement.studentConfirmedAt = undefined;
      if (paymentMethodNote) agreement.paymentMethodNote = paymentMethodNote;
    }

    await agreement.save();

    // Mark application as selected
    await ProjectApplication.findOneAndUpdate(
      { projectId: project._id, studentId: student._id },
      { $set: { status: 'selected' } }
    );

    // Update project state to agreement_pending until student confirms
    project.status = 'agreement_pending';
    project.assignedStudentId = student._id;
    project.agreementId = agreement._id;
    await project.save();

    // Notify student
    await NotificationService.send({
      userId: student._id.toString(),
      title: 'Price Agreement Received',
      message: `You were selected for "${project.title}" at ₹${finalAmount}. Please review and confirm the Price Agreement card to start the project.`,
      type: 'agreement_pending',
      entityId: project._id.toString(),
    });

    return agreement;
  }

  static async confirmAgreement(userId: string, agreementId: string): Promise<{ agreement: IAgreement; projectStatus: string }> {
    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      throw new AppError('Agreement record not found', 404, 'NOT_FOUND');
    }

    const project = await Project.findById(agreement.projectId);
    if (!project) {
      throw new AppError('Associated project not found', 404, 'NOT_FOUND');
    }

    const isBusiness = agreement.ownerId.toString() === userId;
    const isStudent = agreement.studentId.toString() === userId;

    if (!isBusiness && !isStudent) {
      throw new AppError('You are not a participant in this agreement', 403, 'FORBIDDEN');
    }

    if (isBusiness) {
      agreement.businessConfirmed = true;
      agreement.businessConfirmedAt = new Date();
    }

    if (isStudent) {
      agreement.studentConfirmed = true;
      agreement.studentConfirmedAt = new Date();
    }

    // Check if BOTH confirmed
    if (agreement.businessConfirmed && agreement.studentConfirmed) {
      project.status = 'assigned';
      await project.save();

      // Notify both parties
      await NotificationService.send({
        userId: agreement.ownerId.toString(),
        title: 'Project Assigned',
        message: `Both parties confirmed the price agreement of ₹${agreement.amountINR} for "${project.title}". Project is now assigned!`,
        type: 'project_assigned',
        entityId: project._id.toString(),
      });

      await NotificationService.send({
        userId: agreement.studentId.toString(),
        title: 'Project Assigned',
        message: `Both parties confirmed the price agreement of ₹${agreement.amountINR} for "${project.title}". You can begin work now!`,
        type: 'project_assigned',
        entityId: project._id.toString(),
      });
    }

    await agreement.save();

    return { agreement, projectStatus: project.status };
  }

  static async confirmPaymentReceived(studentId: string, projectId: string): Promise<{ project: any; agreement: IAgreement }> {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404, 'NOT_FOUND');
    }

    if (project.assignedStudentId?.toString() !== studentId) {
      throw new AppError('Only the assigned student can confirm receipt of payment', 403, 'FORBIDDEN');
    }

    if (project.status !== 'completed') {
      throw new AppError('Deliverable must be approved by the client before payment can be recorded', 400, 'NOT_COMPLETED');
    }

    const agreement = await Agreement.findOne({ projectId: project._id });
    if (!agreement) {
      throw new AppError('Agreement not found for this project', 404, 'NOT_FOUND');
    }

    project.paymentReceivedAt = new Date();
    await project.save();

    agreement.paymentReceived = true;
    agreement.paymentReceivedAt = new Date();
    await agreement.save();

    // Reward trust scores
    await User.findByIdAndUpdate(project.ownerId, { $inc: { trustScore: 3 } });
    await User.findByIdAndUpdate(project.assignedStudentId, { $inc: { trustScore: 3 } });

    // Notify client that student confirmed payment
    await NotificationService.send({
      userId: project.ownerId.toString(),
      title: 'Payment Confirmation Received',
      message: `The student confirmed receipt of payment for "${project.title}". Reviews are now unlocked!`,
      type: 'payment_confirmed',
      entityId: project._id.toString(),
    });

    return { project, agreement };
  }

  static async getByProjectId(projectId: string): Promise<IAgreement | null> {
    return await Agreement.findOne({ projectId: new mongoose.Types.ObjectId(projectId) })
      .populate('ownerId', 'name avatarUrl businessName')
      .populate('studentId', 'name avatarUrl college collegeVerified');
  }
}
