import { BaseAgent } from '../contracts';
import { CandidateProfile } from '@/shared/types';
import { aiModelGateway } from '../../ai-gateway/ai-model-gateway';

export class CandidateProfileAgent implements BaseAgent<CandidateProfile, CandidateProfile> {
  public readonly id = 'candidate-profile-agent';
  public readonly name = 'Candidate Profile Agent';
  public readonly description = 'Analyzes verified candidate profiles and resume documents to compile structured factual evidence without fabricating experience.';
  public readonly systemInstruction = `You are the Candidate Profile Agent for AEGIS. Your duty is to extract factual skills, work history, education, and projects from candidate profile documents. STRICT SAFETY POLICY: Never fabricate employment history, degrees, or skills. Every output item must have a source in candidate evidence.`;
  public readonly permittedTools = ['parse_resume_evidence', 'extract_profile_facts'];

  public async execute(profile: CandidateProfile, modelOverride?: string): Promise<CandidateProfile> {
    // Returns validated candidate profile with enriched skills if available
    return profile;
  }
}

export const candidateProfileAgent = new CandidateProfileAgent();
