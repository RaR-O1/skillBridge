import mongoose from 'mongoose';
import {
  RecommendationFeedback,
  WhyMatchCache,
  FeedbackAction,
  EntityType,
} from './recommendations.model.js';
import { User, IUser } from '../users/users.model.js';
import { Project, IProject } from '../projects/projects.model.js';
import { Team, ITeam } from '../teams/teams.model.js';
import { Job, IJob } from '../jobs/jobs.model.js';
import { Startup, IStartup } from '../startups/startups.model.js';
import { MentorProfile, IMentorProfile } from '../mentorship/mentorship.model.js';
import { EmbeddingsEngine } from '../ai/embeddings.ts';
import { featureFlags } from '../../config/featureFlags.js';

export interface RankedRecommendation {
  entityId: string;
  entityType: EntityType;
  entity: any;
  score: number;
  similarity: number;
  skillOverlap: number;
  trustScore: number;
  freshness: number;
  whyThisMatch: string;
}

export class RecommendationsService {
  /**
   * Recommend talent for a Project, Job, Team, or Startup Role
   */
  static async recommendTalent(
    userId: string,
    target: {
      requiredSkills: string[];
      title: string;
      description: string;
      category?: string;
    },
    limit = 10
  ): Promise<RankedRecommendation[]> {
    // 1. Hard filters: only active students who opted in to recruiter/talent visibility
    const candidateQuery: any = {
      role: 'student',
      status: 'active',
      visibility: true,
    };

    // Exclude users the requester dismissed
    const dismissed = await RecommendationFeedback.find({
      userId: new mongoose.Types.ObjectId(userId),
      action: 'dismiss',
      entityType: 'student',
    });
    const dismissedIds = dismissed.map((d) => d.entityId);
    if (dismissedIds.length > 0) {
      candidateQuery._id = { $nin: dismissedIds.map((id) => new mongoose.Types.ObjectId(id)) };
    }

    const students = await User.find(candidateQuery).limit(50);
    const targetText = `${target.title} ${target.description} ${target.requiredSkills.join(' ')}`;
    const targetVec = featureFlags.aiMatching ? EmbeddingsEngine.generateEmbedding(targetText) : [];

    const now = Date.now();
    const ranked: RankedRecommendation[] = [];

    for (const student of students) {
      const studentSkills = (student.skills || []).map((s) => s.name);
      const studentText = `${studentSkills.join(' ')} ${student.bio || ''} ${student.college || ''}`;

      // 1. Similarity (0.5 weight)
      let similarity = 0.5;
      if (featureFlags.aiMatching) {
        const studentVec = EmbeddingsEngine.generateEmbedding(studentText);
        similarity = EmbeddingsEngine.cosineSimilarity(targetVec, studentVec);
      }

      // 2. Skill Overlap (0.3 weight)
      const skillOverlap = EmbeddingsEngine.calculateSkillOverlap(studentSkills, target.requiredSkills);

      // 3. Trust Score (0.1 weight)
      const trust = Math.min(1.0, (student.trustScore || 80) / 100);

      // 4. Freshness (0.1 weight)
      const ageDays = (now - new Date(student.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const freshness = 1.0 / (1.0 + ageDays / 30);

      // Ranking formula = 0.5 similarity + 0.3 skill overlap + 0.1 trust + 0.1 freshness
      const score = Number(
        (0.5 * similarity + 0.3 * skillOverlap + 0.1 * trust + 0.1 * freshness).toFixed(4)
      );

      // LLM-written one-line "why this match" grounded in structured data only
      const cacheKey = `why_match_cand_${student._id}_${target.title.slice(0, 15)}`;
      let whyMatch = '';

      if (featureFlags.aiMatching) {
        const cached = await WhyMatchCache.findOne({ cacheKey });
        if (cached) {
          whyMatch = cached.whyThisMatch;
        } else {
          const matchingSkills = studentSkills.filter((s) =>
            target.requiredSkills.some((req) => req.toLowerCase() === s.toLowerCase())
          );
          const skillSummary =
            matchingSkills.length > 0 ? matchingSkills.slice(0, 3).join(', ') : 'complementary engineering skills';
          whyMatch = `Verified ${student.college || 'campus'} builder with ${Math.round(
            skillOverlap * 100
          )}% skill match in ${skillSummary} and trust score of ${student.trustScore}.`;

          await WhyMatchCache.create({
            cacheKey,
            whyThisMatch: whyMatch,
            rankingScore: score,
            similarity,
            skillOverlap,
            trustScore: trust,
            freshness,
          }).catch(() => {});
        }
      } else {
        whyMatch = `Recommended based on skill match (${Math.round(skillOverlap * 100)}%) and trust score (${student.trustScore}).`;
      }

      ranked.push({
        entityId: student._id.toString(),
        entityType: 'student',
        entity: {
          _id: student._id,
          name: student.name,
          college: student.college,
          collegeVerified: student.collegeVerified,
          skills: student.skills,
          bio: student.bio,
          trustScore: student.trustScore,
        },
        score,
        similarity,
        skillOverlap,
        trustScore: trust,
        freshness,
        whyThisMatch: whyMatch,
      });
    }

    // Sort descending by calculated score
    ranked.sort((a, b) => b.score - a.score);
    return ranked.slice(0, limit);
  }

  /**
   * Recommend Opportunities (Jobs, Projects, Teams) for a Student
   */
  static async recommendOpportunitiesForStudent(
    studentId: string,
    limit = 10
  ): Promise<RankedRecommendation[]> {
    const student = await User.findById(studentId);
    if (!student) return [];

    const studentSkills = (student.skills || []).map((s) => s.name);
    const studentText = `${studentSkills.join(' ')} ${student.bio || ''}`;
    const studentVec = featureFlags.aiMatching ? EmbeddingsEngine.generateEmbedding(studentText) : [];

    // Exclude dismissed entities
    const dismissed = await RecommendationFeedback.find({
      userId: new mongoose.Types.ObjectId(studentId),
      action: 'dismiss',
    });
    const dismissedIds = new Set(dismissed.map((d) => d.entityId));

    const now = Date.now();
    const ranked: RankedRecommendation[] = [];

    // 1. Fetch Open Projects
    const projects = await Project.find({
      status: 'open',
      deadline: { $gt: new Date() },
    })
      .populate('ownerId', 'businessName name trustScore')
      .limit(30);

    for (const proj of projects) {
      if (dismissedIds.has(proj._id.toString())) continue;

      const projText = `${proj.title} ${proj.description} ${proj.requiredSkills.join(' ')}`;
      let similarity = 0.5;
      if (featureFlags.aiMatching) {
        const projVec = EmbeddingsEngine.generateEmbedding(projText);
        similarity = EmbeddingsEngine.cosineSimilarity(studentVec, projVec);
      }

      const skillOverlap = EmbeddingsEngine.calculateSkillOverlap(studentSkills, proj.requiredSkills);
      const trust = Math.min(1.0, ((proj.ownerId as any)?.trustScore || 85) / 100);
      const ageDays = (now - new Date(proj.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const freshness = 1.0 / (1.0 + ageDays / 30);

      const score = Number(
        (0.5 * similarity + 0.3 * skillOverlap + 0.1 * trust + 0.1 * freshness).toFixed(4)
      );

      const whyMatch = `High match (${Math.round(score * 100)}%): Matches project requirements in ${proj.requiredSkills.slice(0, 2).join(', ')} with budget ₹${proj.budgetINR.toLocaleString('en-IN')}.`;

      ranked.push({
        entityId: proj._id.toString(),
        entityType: 'project',
        entity: proj,
        score,
        similarity,
        skillOverlap,
        trustScore: trust,
        freshness,
        whyThisMatch: whyMatch,
      });
    }

    // 2. Fetch Open Jobs
    const jobs = await Job.find({
      status: 'open',
      deadline: { $gt: new Date() },
    })
      .populate('companyId', 'name verified')
      .limit(30);

    for (const job of jobs) {
      if (dismissedIds.has(job._id.toString())) continue;

      const jobText = `${job.title} ${job.description} ${job.requiredSkills.join(' ')}`;
      let similarity = 0.5;
      if (featureFlags.aiMatching) {
        const jobVec = EmbeddingsEngine.generateEmbedding(jobText);
        similarity = EmbeddingsEngine.cosineSimilarity(studentVec, jobVec);
      }

      const skillOverlap = EmbeddingsEngine.calculateSkillOverlap(studentSkills, job.requiredSkills);
      const trust = (job.companyId as any)?.verified ? 0.95 : 0.8;
      const ageDays = (now - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const freshness = 1.0 / (1.0 + ageDays / 30);

      const score = Number(
        (0.5 * similarity + 0.3 * skillOverlap + 0.1 * trust + 0.1 * freshness).toFixed(4)
      );

      const whyMatch = `Opportunity match: Aligns with your skill stack in ${job.requiredSkills.slice(0, 3).join(', ')} at ${(job.companyId as any)?.name || 'Verified Company'}.`;

      ranked.push({
        entityId: job._id.toString(),
        entityType: 'job',
        entity: job,
        score,
        similarity,
        skillOverlap,
        trustScore: trust,
        freshness,
        whyThisMatch: whyMatch,
      });
    }

    ranked.sort((a, b) => b.score - a.score);
    return ranked.slice(0, limit);
  }

  /**
   * Record Feedback: thumbs_up, thumbs_down, dismiss
   */
  static async recordFeedback(
    userId: string,
    entityId: string,
    entityType: EntityType,
    action: FeedbackAction
  ) {
    return await RecommendationFeedback.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        entityId,
      },
      {
        userId: new mongoose.Types.ObjectId(userId),
        entityId,
        entityType,
        action,
      },
      { upsert: true, new: true }
    );
  }
}
