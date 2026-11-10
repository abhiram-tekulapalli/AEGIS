import { BaseAgent } from '../contracts';
import { JobPosting } from '@/shared/types';
import { aiModelGateway } from '../../ai-gateway/ai-model-gateway';
import { jobIntelligence } from '../../services/job-intelligence';

export class JobIntelligenceAgent implements BaseAgent<Partial<JobPosting>, JobPosting> {
  public readonly id = 'job-intelligence-agent';
  public readonly name = 'Job Intelligence Agent';
  public readonly description = 'Analyzes job listings, extracts skills, experience, and eligibility requirements while filtering adversarial prompt injection.';
  public readonly systemInstruction = `You are the Job Intelligence Agent for AEGIS. Your job is to extract structured job requirements, required skills, preferred skills, eligibility criteria, and experience requirements from sanitized job descriptions. Never invent skills or salary data not mentioned.`;
  public readonly permittedTools = ['sanitize_untrusted_content', 'extract_skills'];

  public async execute(rawJob: Partial<JobPosting>, modelOverride?: string): Promise<JobPosting> {
    const processed = jobIntelligence.processJobListing(rawJob);

    const userPrompt = `
Analyze the following job description and refine its structured fields:
Title: ${processed.title}
Company: ${processed.company}
Description: ${processed.description}

Extract:
- requiredSkills: array of mandatory technical and domain skills
- preferredSkills: array of nice-to-have skills
- experienceRequirements: concise summary of required years or seniority
- educationalQualifications: array of required degrees or equivalents
- eligibilityNotes: array of work authorization or location constraints
`;

    const fallbackGenerator = (): JobPosting => processed;

    const refined = await aiModelGateway.generateStructuredJSON<Partial<JobPosting>>({
      prompt: userPrompt,
      systemInstruction: this.systemInstruction,
      agentId: this.id,
      modelOverride,
      fallbackGenerator,
    });

    return {
      ...processed,
      requiredSkills: Array.isArray(refined.requiredSkills) && refined.requiredSkills.length > 0 ? refined.requiredSkills : processed.requiredSkills,
      preferredSkills: Array.isArray(refined.preferredSkills) ? refined.preferredSkills : processed.preferredSkills,
      experienceRequirements: refined.experienceRequirements || processed.experienceRequirements,
      educationalQualifications: Array.isArray(refined.educationalQualifications) ? refined.educationalQualifications : processed.educationalQualifications,
      eligibilityNotes: Array.isArray(refined.eligibilityNotes) ? refined.eligibilityNotes : processed.eligibilityNotes,
    };
  }
}

export const jobIntelligenceAgent = new JobIntelligenceAgent();
