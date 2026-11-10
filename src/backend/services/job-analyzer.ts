import { JobPosting, TransparentJobMatchResult, CandidateProfile } from '@/shared/types';
import { matchingEngine } from './matching-engine';

/**
 * Job Analyzer Service
 * Delegates to transparent matching engine
 */

export class JobAnalyzer {
  public async analyzeJob(job: JobPosting, profile: CandidateProfile, modelOverride?: string): Promise<TransparentJobMatchResult> {
    return matchingEngine.evaluateMatch(job, profile);
  }
}

export const jobAnalyzer = new JobAnalyzer();
