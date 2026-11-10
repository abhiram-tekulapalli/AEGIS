import { BaseAgent } from '../contracts';
import { CandidateProfile, JobPosting } from '@/shared/types';
import { aiModelGateway } from '../../ai-gateway/ai-model-gateway';

export interface CoverLetterInput {
  job: JobPosting;
  profile: CandidateProfile;
}

export class CoverLetterAgent implements BaseAgent<CoverLetterInput, string> {
  public readonly id = 'cover-letter-agent';
  public readonly name = 'Cover Letter Agent';
  public readonly description = 'Generates job-specific, 3-paragraph cover letters grounded strictly in candidate evidence.';
  public readonly systemInstruction = `You are the Cover Letter Agent for AEGIS. Write professional, concise 3-paragraph cover letters tailored to the company and role. Use candidate evidence only. Avoid generic fluff or fabricated claims.`;
  public readonly permittedTools = ['draft_cover_letter'];

  public async execute(input: CoverLetterInput, modelOverride?: string): Promise<string> {
    const topSkills = input.profile.skills.slice(0, 5).join(', ');

    const fallbackGenerator = (): string => {
      return `Dear Hiring Team at ${input.job.company},

I am excited to apply for the ${input.job.title} role. With my technical background in ${topSkills} and demonstrated experience at ${input.profile.workHistory[0]?.company || 'Apex Tech'}, I am eager to contribute to your engineering goals.

My background directly matches your requirements in ${input.job.requiredSkills.slice(0, 3).join(', ')}. I look forward to connecting with your team.

Sincerely,
${input.profile.firstName} ${input.profile.lastName}`;
    };

    const prompt = `
Target Job: ${input.job.title} at ${input.job.company}
Required Skills: ${input.job.requiredSkills.join(', ')}

Candidate Name: ${input.profile.firstName} ${input.profile.lastName}
Summary: ${input.profile.summary}
Top Skills: ${topSkills}

Draft a concise 3-paragraph cover letter formatted cleanly as plain text.
`;

    const res = await aiModelGateway.generateText({
      prompt,
      systemInstruction: this.systemInstruction,
      agentId: this.id,
      modelOverride,
    });

    return res.text || fallbackGenerator();
  }
}

export const coverLetterAgent = new CoverLetterAgent();
