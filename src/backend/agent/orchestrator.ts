import { 
  AgentState, 
  AgentExecutionStep, 
  AgentStateContext, 
  JobPosting, 
  CandidateProfile, 
  TransparentJobMatchResult, 
  TailoredResume, 
  ApplicationPlan, 
  FormFillAction 
} from '@/shared/types';

import { db } from '../db/database';
import { jobIntelligence } from '../services/job-intelligence';
import { matchingEngine } from '../services/matching-engine';
import { resumeCustomization } from '../services/resume-customization';
import { formAutomationEngine } from '../services/form-automation';
import { applicationTracker } from '../services/application-tracker';

/**
 * Bounded Agent Orchestrator & State Machine
 * Executes restricted typed tools through a deterministic Bounded Execution Cycle:
 * OBSERVE -> REASON -> PLAN -> VALIDATE PLAN -> REQUEST APPROVAL -> ACT -> VERIFY -> UPDATE STATE
 */

export class AgentOrchestrator {
  private context: AgentStateContext = {
    currentState: 'IDLE',
    activeJob: null,
    matchResult: null,
    tailoredResume: null,
    applicationPlan: null,
    executionHistory: [],
  };

  public getContext(): AgentStateContext {
    return this.context;
  }

  public resetState(): void {
    this.context = {
      currentState: 'IDLE',
      activeJob: null,
      matchResult: null,
      tailoredResume: null,
      applicationPlan: null,
      executionHistory: [],
    };
  }

  private logStep(
    state: AgentState,
    actionName: string,
    toolCalled?: string,
    inputArgs?: any,
    outputResult?: any,
    logMessage: string = '',
    status: AgentExecutionStep['status'] = 'success'
  ): AgentExecutionStep {
    const step: AgentExecutionStep = {
      stepId: `step-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      state,
      actionName,
      toolCalled,
      inputArgs,
      outputResult,
      logMessage,
      status,
    };
    this.context.currentState = state;
    this.context.executionHistory.push(step);
    return step;
  }

  /**
   * Typed Tool 1: extract_job_description
   */
  public async tool_extractJobDescription(rawJob: Partial<JobPosting>): Promise<JobPosting> {
    const job = jobIntelligence.processJobListing(rawJob);
    this.context.activeJob = job;
    this.logStep('JOB_DETECTED', 'Observe Job Page', 'extract_job_description', { url: job.url }, { jobId: job.id, title: job.title }, `Extracted job "${job.title}" at ${job.company}`);
    return job;
  }

  /**
   * Typed Tool 2: analyze_job_match
   */
  public async tool_analyzeJobMatch(jobId?: string): Promise<TransparentJobMatchResult> {
    const job = this.context.activeJob;
    if (!job) throw new Error('No active job detected in agent context.');

    const profile = db.getProfile();
    const match = matchingEngine.evaluateMatch(job, profile);
    this.context.matchResult = match;

    this.logStep('MATCH_READY', 'Evaluate Candidate Match', 'analyze_job_match', { jobId: job.id }, { matchScore: match.matchScore }, `Match score calculated: ${match.matchScore}%`);
    return match;
  }

  /**
   * Typed Tool 3: generate_tailored_resume
   */
  public async tool_generateTailoredResume(selectedModel?: string): Promise<TailoredResume> {
    const job = this.context.activeJob;
    if (!job) throw new Error('No active job detected in agent context.');

    const profile = db.getProfile();
    const tailored = await resumeCustomization.generateTailoredResume(job, profile, selectedModel);
    this.context.tailoredResume = tailored;

    this.logStep('DOCUMENTS_READY', 'Generate Tailored Documents', 'generate_tailored_resume', { jobId: job.id }, { tailoredId: tailored.id }, `Generated tailored resume & cover letter for ${job.company}`);
    return tailored;
  }

  /**
   * Typed Tool 4: map_application_fields
   */
  public async tool_mapApplicationFields(fields: any[]): Promise<ApplicationPlan> {
    const job = this.context.activeJob || {
      id: `job-${Date.now()}`,
      url: 'https://localhost/job',
      title: 'Software Engineer',
      company: 'Target Company',
      location: 'San Francisco, CA',
      workType: 'Remote',
      employmentType: 'Full-time',
      salary: 'Not disclosed',
      description: 'Engineering role.',
      responsibilities: [],
      requiredSkills: ['TypeScript', 'React'],
      preferredSkills: [],
      educationalQualifications: [],
      experienceRequirements: 'Not specified',
      eligibilityNotes: [],
      otherRequirements: [],
      boardType: 'generic',
      extractedAt: new Date().toISOString(),
      untrustedContentSanitized: true,
    };

    const profile = db.getProfile();
    const mappedActions = formAutomationEngine.mapFormFields(fields, profile, job.url);

    const plan: ApplicationPlan = {
      id: `plan-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      boardType: job.boardType,
      actions: mappedActions,
      screeningQuestions: [],
      overallConfidence: 90,
      readyToFillCount: mappedActions.filter(a => a.proposedValue).length,
      requiresReviewCount: mappedActions.length,
      highRiskCount: mappedActions.filter(a => a.riskClassification === 'high' || a.riskClassification === 'sensitive').length,
      createdAt: new Date().toISOString(),
    };

    this.context.applicationPlan = plan;
    this.logStep('AWAITING_APPROVAL', 'Map Fields & Request Approval', 'map_application_fields', { fieldsCount: fields.length }, { planId: plan.id }, `Mapped ${mappedActions.length} fields. Awaiting user approval.`, 'awaiting_user');
    return plan;
  }

  /**
   * Typed Tool 5: save_application_record
   */
  public async tool_saveApplicationRecord(): Promise<void> {
    const job = this.context.activeJob;
    if (!job) return;

    applicationTracker.saveRecord({
      id: `app-${Date.now()}`,
      company: job.company,
      jobTitle: job.title,
      jobUrl: job.url,
      jobDescriptionSnapshot: job.description.slice(0, 300),
      matchScore: this.context.matchResult?.matchScore || 85,
      boardType: job.boardType,
      tailoredResumeId: this.context.tailoredResume?.id,
      coverLetterText: this.context.tailoredResume?.coverLetterText,
      status: 'prepared',
      dateAnalyzed: new Date().toISOString(),
      filledActionsCount: this.context.applicationPlan?.actions.length || 0,
    });

    this.logStep('AWAITING_FINAL_SUBMISSION', 'Save Tracker Record', 'save_application_record', { jobId: job.id }, { status: 'prepared' }, `Application saved to tracker. Pausing for final manual user submission.`);
  }
}

export const agentOrchestrator = new AgentOrchestrator();
