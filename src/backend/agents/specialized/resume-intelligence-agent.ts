import { BaseAgent } from '../contracts';
import { CandidateProfile, JobPosting, TailoredResume } from '@/shared/types';
import { aiModelGateway } from '../../ai-gateway/ai-model-gateway';
import { resumeCustomization } from '../../services/resume-customization';

export interface ResumeTailorInput {
  job: JobPosting;
  profile: CandidateProfile;
}

export class ResumeIntelligenceAgent implements BaseAgent<ResumeTailorInput, TailoredResume> {
  public readonly id = 'resume-intelligence-agent';
  public readonly name = 'Resume Intelligence Agent';
  public readonly description = 'Tailors executive summaries and experience highlights for ATS optimization while maintaining 100% factual accuracy.';
  public readonly systemInstruction = `You are the Resume Intelligence Agent for AEGIS. Tailor executive summaries and project descriptions to align with the target job's key technical requirements. STRICT POLICY: Maintain 100% factual accuracy. Never fabricate employment, titles, dates, or degrees.`;
  public readonly permittedTools = ['tailor_summary', 'optimize_ats_bullets'];

  public async execute(input: ResumeTailorInput, modelOverride?: string): Promise<TailoredResume> {
    return await resumeCustomization.generateTailoredResume(input.job, input.profile, modelOverride);
  }
}

export const resumeIntelligenceAgent = new ResumeIntelligenceAgent();
