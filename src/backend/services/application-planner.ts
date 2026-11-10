import { JobPosting, DetectedFormField, ApplicationPlan, CandidateProfile } from '@/shared/types';
import { formAutomationEngine } from './form-automation';
import { db } from '../db/database';

/**
 * Application Planner Service
 */

export class ApplicationPlanner {
  public generatePlan(job: JobPosting, fields: DetectedFormField[], profile: CandidateProfile): ApplicationPlan {
    const actions = formAutomationEngine.mapFormFields(fields, profile, job.url);

    const filledCount = actions.filter(a => a.proposedValue.trim().length > 0).length;
    const totalCount = actions.length || 1;
    const overallConfidence = Math.round((filledCount / totalCount) * 100);

    const plan: ApplicationPlan = {
      id: `plan-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      boardType: job.boardType,
      actions,
      screeningQuestions: [],
      overallConfidence,
      readyToFillCount: filledCount,
      requiresReviewCount: totalCount - filledCount,
      highRiskCount: actions.filter(a => a.riskClassification === 'high' || a.riskClassification === 'sensitive').length,
      createdAt: new Date().toISOString(),
    };

    db.saveJob(job);
    return plan;
  }
}

export const applicationPlanner = new ApplicationPlanner();
