import { z } from 'zod';

/**
 * Zod Validation Schemas for RolePilot AI Outputs, API Payloads & Agent Tools
 */

export const EvidenceSourceSchema = z.enum(['resume_upload', 'user_verified', 'manual_entry', 'system_default']);

export const RiskClassificationSchema = z.enum(['low', 'medium', 'high', 'sensitive']);

export const ProfileExperienceItemSchema = z.object({
  id: z.string(),
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  isCurrent: z.boolean().default(false),
  location: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  technologiesUsed: z.array(z.string()).default([]),
  evidenceSource: EvidenceSourceSchema.default('manual_entry'),
});

export const ProfileProjectItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  role: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  url: z.string().optional(),
  outcomes: z.array(z.string()).optional(),
  evidenceSource: EvidenceSourceSchema.default('manual_entry'),
});

export const ProfileEducationItemSchema = z.object({
  id: z.string(),
  institution: z.string().min(1),
  degree: z.string().min(1),
  fieldOfStudy: z.string(),
  graduationYear: z.string(),
  gpaOrHonors: z.string().optional(),
  evidenceSource: EvidenceSourceSchema.default('manual_entry'),
});

export const ProfileCertificationItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  issuer: z.string(),
  issueDate: z.string(),
  credentialUrl: z.string().optional(),
  evidenceSource: EvidenceSourceSchema.default('manual_entry'),
});

export const ResumeDocumentRecordSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileType: z.enum(['pdf', 'docx', 'txt']),
  fileSize: z.number(),
  uploadedAt: z.string(),
  extractedText: z.string(),
  extractionStatus: z.enum(['success', 'partial', 'scanned_unsupported', 'failed']),
  extractionWarning: z.string().optional(),
});

export const CandidateProfileSchema = z.object({
  id: z.string().default('c-default'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  location: z.string().default(''),
  headline: z.string().default(''),
  summary: z.string().default(''),
  website: z.string().default(''),
  linkedIn: z.string().default(''),
  github: z.string().default(''),
  portfolio: z.string().default(''),
  
  workAuthorization: z.enum(['US Citizen', 'Green Card', 'H1B Visa', 'Need Sponsorship', 'Other']).default('US Citizen'),
  requiresSponsorship: z.boolean().default(false),
  desiredSalary: z.string().default(''),
  noticePeriod: z.string().default('2 Weeks'),
  desiredJobTitles: z.array(z.string()).default([]),
  preferredWorkType: z.enum(['Remote', 'Hybrid', 'On-site', 'Any']).default('Any'),
  openToRelocation: z.boolean().default(false),
  yearsOfExperience: z.number().nonnegative().default(0),

  skills: z.array(z.string()).default([]),
  programmingLanguages: z.array(z.string()).default([]),
  toolsAndFrameworks: z.array(z.string()).default([]),
  workHistory: z.array(ProfileExperienceItemSchema).default([]),
  internships: z.array(ProfileExperienceItemSchema).default([]),
  projects: z.array(ProfileProjectItemSchema).default([]),
  education: z.array(ProfileEducationItemSchema).default([]),
  certifications: z.array(ProfileCertificationItemSchema).default([]),
  achievements: z.array(z.string()).default([]),
  resumeDocuments: z.array(ResumeDocumentRecordSchema).default([]),

  customAnswers: z.record(z.string(), z.string()).default({}),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export const JobPostingSchema = z.object({
  id: z.string(),
  url: z.string().url().or(z.string().min(1)),
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().default('Not specified'),
  workType: z.enum(['Remote', 'Hybrid', 'On-site', 'Unknown']).default('Unknown'),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship', 'Unknown']).default('Unknown'),
  salary: z.string().default('Not disclosed'),
  description: z.string().min(10),
  responsibilities: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  educationalQualifications: z.array(z.string()).default([]),
  experienceRequirements: z.string().default('Not specified'),
  eligibilityNotes: z.array(z.string()).default([]),
  otherRequirements: z.array(z.string()).default([]),
  boardType: z.enum(['greenhouse', 'lever', 'workday', 'linkedin', 'generic']).default('generic'),
  extractedAt: z.string().default(() => new Date().toISOString()),
  untrustedContentSanitized: z.boolean().default(true),
});

export const TransparentJobMatchResultSchema = z.object({
  jobId: z.string(),
  matchScore: z.number().min(0).max(100),
  scoreBreakdown: z.object({
    requiredSkillScore: z.number(),
    preferredSkillScore: z.number(),
    experienceFitScore: z.number(),
    eligibilityEducationScore: z.number(),
  }),
  skillsBreakdown: z.object({
    matchedRequired: z.array(z.string()),
    matchedPreferred: z.array(z.string()),
    missingSkills: z.array(z.string()),
    unmentionedSkills: z.array(z.string()),
  }),
  relevantProjects: z.array(z.object({
    title: z.string(),
    relevanceScore: z.number(),
    reason: z.string(),
  })),
  relevantExperience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    relevanceScore: z.number(),
    reason: z.string(),
  })),
  eligibilityConcerns: z.array(z.string()),
  strengths: z.array(z.string()),
  improvementOpportunities: z.array(z.string()),
  scoreFormulaExplanation: z.string(),
  disclaimerNotice: z.string(),
});

export const TailoredResumeSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  jobTitle: z.string(),
  company: z.string(),
  summary: z.string(),
  highlightedSkills: z.array(z.string()),
  tailoredExperienceHighlights: z.array(z.object({
    company: z.string(),
    role: z.string(),
    tailoredBullets: z.array(z.string()),
    originalBullets: z.array(z.string()),
  })),
  tailoredProjects: z.array(z.object({
    title: z.string(),
    tailoredDescription: z.string(),
  })),
  coverLetterText: z.string(),
  generatedAt: z.string(),
  docxDownloadUrl: z.string().optional(),
});

export const ScreeningQuestionAnswerSchema = z.object({
  questionId: z.string(),
  questionText: z.string(),
  category: z.enum(['personal', 'education', 'skills', 'projects', 'experience', 'motivation', 'sensitivity', 'other']),
  proposedAnswer: z.string(),
  evidenceSource: z.string(),
  confidence: z.number().min(0).max(1),
  riskClassification: RiskClassificationSchema,
  requiresUserConfirmation: z.boolean().default(true),
  userApproved: z.boolean().default(false),
  status: z.enum(['pending', 'approved', 'rejected', 'modified']).default('pending'),
});

export const FormFieldSchema = z.object({
  id: z.string(),
  selector: z.string(),
  name: z.string(),
  label: z.string(),
  placeholder: z.string().default(''),
  type: z.enum(['text', 'email', 'tel', 'textarea', 'select', 'radio', 'checkbox', 'file', 'unknown']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  currentValue: z.string().optional(),
  ariaLabel: z.string().optional(),
  sectionTitle: z.string().optional(),
  isPasswordOrCaptcha: z.boolean().default(false),
});

export const FormFillActionSchema = z.object({
  fieldId: z.string(),
  selector: z.string(),
  fieldName: z.string(),
  fieldLabel: z.string(),
  fieldType: FormFieldSchema.shape.type,
  proposedValue: z.string(),
  evidenceSource: z.string(),
  confidence: z.number().min(0).max(1),
  riskClassification: RiskClassificationSchema,
  reasoning: z.string(),
  requiresUserApproval: z.literal(true), // Always true by design!
  userApproved: z.boolean().default(false),
  status: z.enum(['pending', 'approved', 'rejected', 'filled', 'verified_failed', 'verified_success']).default('pending'),
  verifiedValue: z.string().optional(),
});

export const ApplicationPlanSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  jobTitle: z.string(),
  company: z.string(),
  boardType: z.string(),
  actions: z.array(FormFillActionSchema),
  screeningQuestions: z.array(ScreeningQuestionAnswerSchema),
  overallConfidence: z.number(),
  readyToFillCount: z.number(),
  requiresReviewCount: z.number(),
  highRiskCount: z.number(),
  createdAt: z.string(),
});

export const AgentStateSchema = z.enum([
  'IDLE',
  'JOB_DETECTED',
  'JOB_ANALYZED',
  'MATCH_READY',
  'DOCUMENTS_READY',
  'FORM_DETECTED',
  'FIELD_MAPPING_READY',
  'AWAITING_APPROVAL',
  'FORM_FILLED',
  'VERIFIED',
  'AWAITING_FINAL_SUBMISSION',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

export const AgentExecutionStepSchema = z.object({
  stepId: z.string(),
  timestamp: z.string(),
  state: AgentStateSchema,
  actionName: z.string(),
  toolCalled: z.string().optional(),
  inputArgs: z.record(z.string(), z.any()).optional(),
  outputResult: z.record(z.string(), z.any()).optional(),
  logMessage: z.string(),
  status: z.enum(['success', 'warning', 'error', 'awaiting_user']),
});

export const ApplicationTrackerRecordSchema = z.object({
  id: z.string(),
  company: z.string(),
  jobTitle: z.string(),
  jobUrl: z.string(),
  jobDescriptionSnapshot: z.string(),
  matchScore: z.number(),
  boardType: z.string(),
  tailoredResumeId: z.string().optional(),
  coverLetterText: z.string().optional(),
  status: z.enum(['prepared', 'pending', 'submitted', 'rejected']),
  dateAnalyzed: z.string(),
  submissionDate: z.string().optional(),
  notes: z.string().optional(),
  filledActionsCount: z.number().default(0),
});

export const AnalyzeJobRequestSchema = z.object({
  job: JobPostingSchema,
  selectedModel: z.string().optional(),
});

export const GeneratePlanRequestSchema = z.object({
  job: JobPostingSchema,
  fields: z.array(FormFieldSchema),
  selectedModel: z.string().optional(),
});

export const TailorResumeRequestSchema = z.object({
  job: JobPostingSchema,
  selectedModel: z.string().optional(),
});
