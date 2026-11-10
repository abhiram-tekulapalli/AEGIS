import { JobPosting, CandidateProfile, TailoredResume } from '@/shared/types';
import { resumeCustomization } from './resume-customization';

/**
 * Resume & Cover Letter Tailor Service
 * Delegates to resumeCustomization engine
 */

export class ResumeTailor {
  public async tailorResume(job: JobPosting, profile: CandidateProfile, modelOverride?: string): Promise<TailoredResume> {
    return resumeCustomization.generateTailoredResume(job, profile, modelOverride);
  }
}

export const resumeTailor = new ResumeTailor();
