import { BaseAgent } from '../contracts';
import { AgentStateContext, JobPosting, CandidateProfile, TransparentJobMatchResult, TailoredResume, ApplicationPlan } from '@/shared/types';
import { jobIntelligenceAgent } from './job-intelligence-agent';
import { jobMatchingAgent } from './job-matching-agent';
import { resumeIntelligenceAgent } from './resume-intelligence-agent';
import { applicationIntelligenceAgent } from './application-intelligence-agent';
import { screeningAnswerAgent } from './screening-answer-agent';
import { db } from '../../db/database';

export class AgentCoordinator implements BaseAgent<AgentStateContext, AgentStateContext> {
  public readonly id = 'agent-coordinator';
  public readonly name = 'Agent Coordinator';
  public readonly description = 'Selects appropriate specialized agents for tasks, sequences execution dependencies, and maintains state machine integrity.';
  public readonly systemInstruction = `You are the Agent Coordinator for AEGIS. Route requests to specialized agents with minimum required context and validate workflow state transitions.`;
  public readonly permittedTools = ['route_agent_task', 'validate_workflow_state'];

  public async execute(context: AgentStateContext): Promise<AgentStateContext> {
    return context;
  }

  public async extractAndAnalyzeJob(rawJob: Partial<JobPosting>, modelOverride?: string): Promise<{ job: JobPosting; match: TransparentJobMatchResult }> {
    const job = await jobIntelligenceAgent.execute(rawJob, modelOverride);
    const profile = db.getProfile();
    const match = await jobMatchingAgent.execute({ job, profile }, modelOverride);

    db.saveJob(job, match);
    return { job, match };
  }

  public async generateTailoredResume(job: JobPosting, profile: CandidateProfile, modelOverride?: string): Promise<TailoredResume> {
    return await resumeIntelligenceAgent.execute({ job, profile }, modelOverride);
  }

  public async generateApplicationPlan(job: JobPosting, profile: CandidateProfile, fields: any[]): Promise<ApplicationPlan> {
    const mappedActions = await applicationIntelligenceAgent.execute({ fields, profile, jobUrl: job.url });

    const sampleQuestions = fields
      .filter((f: any) => f.type === 'textarea' || (f.label && (f.label.toLowerCase().includes('why') || f.label.toLowerCase().includes('salary'))))
      .map((f: any) => ({ id: f.id, text: f.label }));

    const screeningAnswers = await screeningAnswerAgent.execute({ questions: sampleQuestions, profile });

    return {
      id: `plan-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      boardType: job.boardType,
      actions: mappedActions,
      screeningQuestions: screeningAnswers,
      overallConfidence: 90,
      readyToFillCount: mappedActions.filter(a => a.proposedValue).length,
      requiresReviewCount: mappedActions.length,
      highRiskCount: mappedActions.filter(a => a.riskClassification === 'high' || a.riskClassification === 'sensitive').length,
      createdAt: new Date().toISOString(),
    };
  }
}

export const agentCoordinator = new AgentCoordinator();
