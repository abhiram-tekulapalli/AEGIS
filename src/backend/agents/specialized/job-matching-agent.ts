import { BaseAgent } from '../contracts';
import { CandidateProfile, JobPosting, TransparentJobMatchResult } from '@/shared/types';
import { aiModelGateway } from '../../ai-gateway/ai-model-gateway';
import { matchingEngine } from '../../services/matching-engine';

export interface JobMatchingInput {
  job: JobPosting;
  profile: CandidateProfile;
}

export class JobMatchingAgent implements BaseAgent<JobMatchingInput, TransparentJobMatchResult> {
  public readonly id = 'job-matching-agent';
  public readonly name = 'Job Matching Agent';
  public readonly description = 'Compares job requirements against candidate evidence to calculate transparent, mathematical fit scores and skill gaps.';
  public readonly systemInstruction = `You are the Job Matching Agent for AEGIS. Analyze the match between candidate factual evidence and job requirements. Provide transparent explanations for strengths, missing skills, and eligibility concerns.`;
  public readonly permittedTools = ['evaluate_mathematical_fit', 'calculate_skill_breakdown'];

  public async execute(input: JobMatchingInput, modelOverride?: string): Promise<TransparentJobMatchResult> {
    const baseMatch = matchingEngine.evaluateMatch(input.job, input.profile);

    const userPrompt = `
JOB: ${input.job.title} at ${input.job.company}
Required Skills: ${input.job.requiredSkills.join(', ')}
Preferred Skills: ${input.job.preferredSkills.join(', ')}

CANDIDATE SKILLS: ${input.profile.skills.join(', ')}
CALCULATED MATCH SCORE: ${baseMatch.matchScore}%

Explain:
- strengths: array of 2-3 key technical alignment strengths
- improvementOpportunities: array of 2-3 key missing skills or gaps to address
- eligibilityConcerns: array of any visa or relocation warnings if present
`;

    const fallbackGenerator = (): TransparentJobMatchResult => baseMatch;

    const insights = await aiModelGateway.generateStructuredJSON<{
      strengths: string[];
      improvementOpportunities: string[];
      eligibilityConcerns: string[];
    }>({
      prompt: userPrompt,
      systemInstruction: this.systemInstruction,
      agentId: this.id,
      modelOverride,
      fallbackGenerator: () => ({
        strengths: baseMatch.strengths,
        improvementOpportunities: baseMatch.improvementOpportunities,
        eligibilityConcerns: baseMatch.eligibilityConcerns,
      }),
    });

    return {
      ...baseMatch,
      strengths: Array.isArray(insights.strengths) && insights.strengths.length > 0 ? insights.strengths : baseMatch.strengths,
      improvementOpportunities: Array.isArray(insights.improvementOpportunities) && insights.improvementOpportunities.length > 0 ? insights.improvementOpportunities : baseMatch.improvementOpportunities,
      eligibilityConcerns: Array.isArray(insights.eligibilityConcerns) ? insights.eligibilityConcerns : baseMatch.eligibilityConcerns,
    };
  }
}

export const jobMatchingAgent = new JobMatchingAgent();
