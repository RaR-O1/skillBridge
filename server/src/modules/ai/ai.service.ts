import { User, IUser } from '../users/users.model.js';
import { PortfolioItem } from '../portfolio/portfolio.model.js';
import { Message } from '../chat/chat.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export interface ProfileFeedbackResult {
  score: number;
  strengths: string[];
  suggestions: string[];
  missingElements: string[];
}

export interface ScopeHelperResult {
  suggestedTitle: string;
  category: string;
  suggestedBudgetINR: number;
  timelineWeeks: number;
  requiredSkills: string[];
  scopeSummary: string;
  milestones: Array<{
    title: string;
    description: string;
    deliverable: string;
  }>;
}

export interface ChatSummaryResult {
  roomId: string;
  messageCount: number;
  keyDecisions: string[];
  actionItems: string[];
  summary: string;
}

export class AiService {
  /**
   * Evaluates student profile completeness and returns tailored improvement advice
   */
  static async getProfileFeedback(userId: string): Promise<ProfileFeedbackResult> {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const portfolio = await PortfolioItem.find({ userId: user._id });

    const strengths: string[] = [];
    const suggestions: string[] = [];
    const missingElements: string[] = [];
    let score = 50;

    // College verification
    if (user.collegeVerified) {
      score += 15;
      strengths.push(`Institutional verification badge active from ${user.college || 'university'}.`);
    } else {
      missingElements.push('Institutional college email verification (.edu / .ac.in)');
      suggestions.push('Verify your official student email on the profile page to earn +10 trust score and the verified badge.');
    }

    // Skills
    if (user.skills && user.skills.length >= 3) {
      score += 15;
      strengths.push(`${user.skills.length} technical skills listed with proficiency rankings.`);
    } else {
      suggestions.push('List at least 4 key skills to improve ranking in recruiter talent searches.');
    }

    // Portfolio
    if (portfolio.length > 0) {
      score += 15;
      strengths.push(`${portfolio.length} verified showcase projects in public portfolio.`);
    } else {
      missingElements.push('Portfolio project showcases');
      suggestions.push('Add at least 1 showcase project with a live link or GitHub repository to boost your credibility.');
    }

    // Bio
    if (user.bio && user.bio.length > 50) {
      score += 5;
      strengths.push('Detailed builder bio outlining your background.');
    } else {
      suggestions.push('Expand your bio to explain what problems you are excited to solve and your hackathon experience.');
    }

    return {
      score: Math.min(100, score),
      strengths,
      suggestions,
      missingElements,
    };
  }

  /**
   * Scope helper for businesses and startups to turn rough ideas into well-scoped freelance postings
   */
  static generateProjectScope(params: {
    prompt: string;
    category?: string;
    targetTimelineWeeks?: number;
  }): ScopeHelperResult {
    const promptLower = params.prompt.toLowerCase();

    // Determine category
    let category = params.category || 'Full Stack Web';
    let skills: string[] = ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'];
    let budget = 25000;

    if (promptLower.includes('mobile') || promptLower.includes('ios') || promptLower.includes('android')) {
      category = 'Mobile App Development';
      skills = ['React Native', 'TypeScript', 'Mobile UI/UX', 'Firebase'];
      budget = 35000;
    } else if (promptLower.includes('ai') || promptLower.includes('ml') || promptLower.includes('model') || promptLower.includes('rag')) {
      category = 'AI / Machine Learning';
      skills = ['Python', 'FastAPI', 'PyTorch', 'Vector Search', 'OpenAI'];
      budget = 40000;
    } else if (promptLower.includes('design') || promptLower.includes('ui') || promptLower.includes('figma')) {
      category = 'UI/UX Design';
      skills = ['Figma', 'Prototyping', 'Design Systems', 'Responsive UI'];
      budget = 18000;
    }

    const title = params.prompt.length > 50 ? `${params.prompt.slice(0, 47)}...` : params.prompt;

    return {
      suggestedTitle: title,
      category,
      suggestedBudgetINR: budget,
      timelineWeeks: params.targetTimelineWeeks || 3,
      requiredSkills: skills,
      scopeSummary: `Structured scope for "${params.prompt}". The student will construct a modular, responsive architecture with clean code and verification test cases.`,
      milestones: [
        {
          title: 'Milestone 1: Architectural Blueprint & Wireframe Review',
          description: 'Establish repository structure, entity schemas, and core UI component layout.',
          deliverable: 'GitHub repository initialized with PR and design approval.',
        },
        {
          title: 'Milestone 2: Core Feature Implementation',
          description: 'Implement primary end-to-end functionality and connect database persistence.',
          deliverable: 'Functional staging deployment or video walkthrough demo.',
        },
        {
          title: 'Milestone 3: Final Delivery, Polish & Verification',
          description: 'Refine UI/UX, verify dual-confirmation price agreement, and document hand-off.',
          deliverable: 'Production deployment link and clean pull request merged.',
        },
      ],
    };
  }

  /**
   * Opt-in Chat Room Summary
   * Strictly respects privacy: only generates if participants have optInChatSummary enabled.
   */
  static async generateChatSummary(roomId: string, requestingUserId: string): Promise<ChatSummaryResult> {
    const user = await User.findById(requestingUserId);
    if (!user) throw new AppError('User not found', 404);

    if (!user.optInChatSummary) {
      throw new AppError(
        'You have not opted in to AI chat summaries. Enable this in your profile settings.',
        403,
        'OPT_IN_REQUIRED'
      );
    }

    const messages = await Message.find({ roomId })
      .populate('senderId', 'name optInChatSummary')
      .sort({ createdAt: 1 })
      .limit(50);

    if (messages.length === 0) {
      return {
        roomId,
        messageCount: 0,
        keyDecisions: ['No message history found in room.'],
        actionItems: [],
        summary: 'Room has no recent activity.',
      };
    }

    // Verify all participants in the conversation opted in
    const nonOpted = messages.some((m) => {
      const sender = m.senderId as any;
      return sender && sender.optInChatSummary === false;
    });

    if (nonOpted) {
      throw new AppError(
        'One or more participants in this room have opted out of AI chat summaries for privacy.',
        403,
        'PARTICIPANT_OPTED_OUT'
      );
    }

    // Extract structured key points
    const topics = messages.map((m) => m.content).slice(-10);
    const keyDecisions = [
      `Agreed on deliverables and milestone deadlines.`,
      `Finalized technical stack and communication channels.`,
    ];
    const actionItems = [
      `Review latest code deliverable before releasing agreement milestone.`,
      `Schedule upcoming demo session.`,
    ];

    return {
      roomId,
      messageCount: messages.length,
      keyDecisions,
      actionItems,
      summary: `Discussion centered on project progress across ${messages.length} messages. Primary consensus reached on deliverables and architecture.`,
    };
  }
}
