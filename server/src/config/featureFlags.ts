import { env } from './env.js';

export interface FeatureFlags {
  jobsAndInternships: boolean;
  startupsAndRoles: boolean;
  mentorship: boolean;
  aiMatching: boolean;
}

export const featureFlags: FeatureFlags = {
  jobsAndInternships: env.FEATURE_PHASE_2_JOBS,
  startupsAndRoles: env.FEATURE_PHASE_2_STARTUPS,
  mentorship: env.FEATURE_PHASE_2_MENTORSHIP,
  aiMatching: env.FEATURE_AI_MATCHING,
};

export const requireFeature = (flagName: keyof FeatureFlags) => {
  return (_req: any, res: any, next: any) => {
    if (!featureFlags[flagName]) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FEATURE_DISABLED',
          message: `The feature '${flagName}' is disabled in this stage/environment.`,
        },
      });
    }
    next();
  };
};
