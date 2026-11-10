import { BaseAgent } from '../contracts';
import { CandidateProfile, ScreeningQuestionAnswer } from '@/shared/types';
import { questionIntelligence } from '../../services/question-intelligence';

export interface ScreeningQuestionInput {
  questions: Array<{ id: string; text: string }>;
  profile: CandidateProfile;
}

export class ScreeningAnswerAgent implements BaseAgent<ScreeningQuestionInput, ScreeningQuestionAnswer[]> {
  public readonly id = 'screening-answer-agent';
  public readonly name = 'Screening Answer Agent';
  public readonly description = 'Generates accurate answers for application screening questions based on verified candidate facts and flags high-risk questions for user confirmation.';
  public readonly systemInstruction = `You are the Screening Answer Agent for AEGIS. Answer application screening questions accurately using verified candidate data. Classify questions about salary, visa sponsorship, or relocation as high risk requiring explicit user approval.`;
  public readonly permittedTools = ['classify_question_risk', 'generate_factual_answer'];

  public async execute(input: ScreeningQuestionInput): Promise<ScreeningQuestionAnswer[]> {
    return questionIntelligence.answerQuestions(input.questions, input.profile);
  }
}

export const screeningAnswerAgent = new ScreeningAnswerAgent();
