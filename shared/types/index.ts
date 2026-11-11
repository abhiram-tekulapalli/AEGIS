/**
 * Shared Type Definitions for RolePilot (Phase 2 Architecture)
 * Chrome Extension <-> Local Agent Backend <-> SQLite Storage
 */

export type ModelProvider = 'gemini' | 'ollama' | 'mock';

export interface OllamaModelInfo {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
}

export type AIProviderName = 'gemini' | 'mock';

export interface AIProviderInfo {
  provider: AIProviderName;
  model: string;
  configured: boolean;
  cloudConsentGranted: boolean;
  mockFallbackEnabled: boolean;
  apiKeyPresent: boolean;
  apiKeyMasked: string | null;
}

export interface AIUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitErrors: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedDailyUsage: number;
  agentUsage: Record<string, { requests: number; inputTokens: number; outputTokens: number }>;
  lastUsedAt?: string;
}

export interface CloudConsentState {
  granted: boolean;
  grantedAt?: string;
}

export interface SystemHealth {
  status: 'ok' | 'degraded' | 'offline';
  backendVersion: string;
  aiProvider: AIProviderName;
  geminiConnected: boolean;
  geminiModel: string;
  cloudConsentGranted: boolean;
  apiKeyPresent: boolean;
  apiKeyMasked: string | null;
  ollamaConnected: boolean;
  ollamaUrl: string;
  activeModel: string | null;
  availableModels: string[];
  databaseStatus: 'connected' | 'error';
  usageStats: AIUsageStats;
  timestamp: string;
}

export type EvidenceSource = 'resume_upload' | 'user_verified' | 'manual_entry' | 'system_default';

export interface ProfileExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  location?: string;
  highlights: string[];
  technologiesUsed: string[];
  evidenceSource: EvidenceSource;
}

export interface ProfileProjectItem {
  id: string;
  title: string;
  description: string;
  role?: string;
  technologies: string[];
  url?: string;
  outcomes?: string[];
  evidenceSource: EvidenceSource;
}

export interface ProfileEducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
  gpaOrHonors?: string;
  evidenceSource: EvidenceSource;
}

export interface ProfileCertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  evidenceSource: EvidenceSource;
}

export interface ResumeDocumentRecord {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt';
  fileSize: number;
  uploadedAt: string;
  extractedText: string;
  extractionStatus: 'success' | 'partial' | 'scanned_unsupported' | 'failed';
  extractionWarning?: string;
}

export interface CandidateProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  website: string;
  linkedIn: string;
  github: string;
  portfolio: string;
  
  // Sensitive / Legal & Preferences
  workAuthorization: 'US Citizen' | 'Green Card' | 'H1B Visa' | 'Need Sponsorship' | 'Other' | '';
  requiresSponsorship: boolean;
  desiredSalary: string;
  noticePeriod: string;
  desiredJobTitles: string[];
  preferredWorkType: 'Remote' | 'Hybrid' | 'On-site' | 'Any';
  openToRelocation: boolean;
  yearsOfExperience: number;

  // Factual evidence arrays
  skills: string[];
  programmingLanguages: string[];
  toolsAndFrameworks: string[];
  workHistory: ProfileExperienceItem[];
  internships: ProfileExperienceItem[];
  projects: ProfileProjectItem[];
  education: ProfileEducationItem[];
  certifications: ProfileCertificationItem[];
  achievements: string[];

  // Uploaded original resumes
  resumeDocuments: ResumeDocumentRecord[];

  customAnswers: Record<string, string>;
  updatedAt: string;
}

export interface JobPosting {
  id: string;
  url: string;
  title: string;
  company: string;
  location: string;
  workType: 'Remote' | 'Hybrid' | 'On-site' | 'Unknown';
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Unknown';
  salary: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  educationalQualifications: string[];
  experienceRequirements: string;
  eligibilityNotes: string[];
  otherRequirements: string[];
  boardType: 'greenhouse' | 'lever' | 'workday' | 'linkedin' | 'generic';
  extractedAt: string;
  untrustedContentSanitized: boolean;
}

export interface SkillMatchBreakdown {
  matchedRequired: string[];
  matchedPreferred: string[];
  missingSkills: string[]; // Explicitly required but missing from profile
  unmentionedSkills: string[]; // Skills not mentioned in resume
}

export interface ProjectRelevanceMatch {
  title: string;
  relevanceScore: number; // 0 - 100
  reason: string;
}

export interface ExperienceRelevanceMatch {
  company: string;
  role: string;
  relevanceScore: number; // 0 - 100
  reason: string;
}

export interface TransparentJobMatchResult {
  jobId: string;
  matchScore: number; // 0 - 100
  scoreBreakdown: {
    requiredSkillScore: number; // Max 40
    preferredSkillScore: number; // Max 15
    experienceFitScore: number; // Max 25
    eligibilityEducationScore: number; // Max 20
  };
  skillsBreakdown: SkillMatchBreakdown;
  relevantProjects: ProjectRelevanceMatch[];
  relevantExperience: ExperienceRelevanceMatch[];
  eligibilityConcerns: string[];
  strengths: string[];
  improvementOpportunities: string[];
  scoreFormulaExplanation: string;
  disclaimerNotice: string;
}

export interface TailoredResume {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  summary: string;
  highlightedSkills: string[];
  tailoredExperienceHighlights: Array<{
    company: string;
    role: string;
    tailoredBullets: string[];
    originalBullets: string[];
  }>;
  tailoredProjects: Array<{
    title: string;
    tailoredDescription: string;
  }>;
  coverLetterText: string;
  generatedAt: string;
  docxDownloadUrl?: string;
}

export type RiskClassification = 'low' | 'medium' | 'high' | 'sensitive';

export interface ScreeningQuestionAnswer {
  questionId: string;
  questionText: string;
  category: 'personal' | 'education' | 'skills' | 'projects' | 'experience' | 'motivation' | 'sensitivity' | 'other';
  proposedAnswer: string;
  evidenceSource: string;
  confidence: number; // 0.0 to 1.0
  riskClassification: RiskClassification;
  requiresUserConfirmation: boolean;
  userApproved: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
}

export interface DetectedFormField {
  id: string;
  selector: string;
  name: string;
  label: string;
  placeholder: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file' | 'unknown';
  required: boolean;
  options?: string[];
  currentValue?: string;
  ariaLabel?: string;
  sectionTitle?: string;
  isPasswordOrCaptcha?: boolean;
}

export interface FormFillAction {
  fieldId: string;
  selector: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: DetectedFormField['type'];
  proposedValue: string;
  evidenceSource: string;
  confidence: number; // 0.0 to 1.0
  riskClassification: RiskClassification;
  reasoning: string;
  requiresUserApproval: boolean;
  userApproved: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'filled' | 'verified_failed' | 'verified_success';
  verifiedValue?: string;
}

export interface ApplicationPlan {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  boardType: string;
  actions: FormFillAction[];
  screeningQuestions: ScreeningQuestionAnswer[];
  overallConfidence: number;
  readyToFillCount: number;
  requiresReviewCount: number;
  highRiskCount: number;
  createdAt: string;
}

export type AgentState =
  | 'IDLE'
  | 'JOB_DETECTED'
  | 'JOB_ANALYZED'
  | 'MATCH_READY'
  | 'DOCUMENTS_READY'
  | 'FORM_DETECTED'
  | 'FIELD_MAPPING_READY'
  | 'AWAITING_APPROVAL'
  | 'FORM_FILLED'
  | 'VERIFIED'
  | 'AWAITING_FINAL_SUBMISSION'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface AgentExecutionStep {
  stepId: string;
  timestamp: string;
  state: AgentState;
  actionName: string;
  toolCalled?: string;
  inputArgs?: Record<string, any>;
  outputResult?: Record<string, any>;
  logMessage: string;
  status: 'success' | 'warning' | 'error' | 'awaiting_user';
}

export interface AgentStateContext {
  currentState: AgentState;
  activeJob: JobPosting | null;
  matchResult: TransparentJobMatchResult | null;
  tailoredResume: TailoredResume | null;
  applicationPlan: ApplicationPlan | null;
  executionHistory: AgentExecutionStep[];
  error?: string;
}

export interface ApplicationHistoryEntry {
  id: string;
  jobTitle: string;
  company: string;
  url: string;
  boardType: string;
  status: 'draft' | 'fields_filled' | 'saved';
  actionsCount: number;
  appliedAt: string;
  notes?: string;
}

export type ApplicationTrackerStatus = 'prepared' | 'pending' | 'submitted' | 'rejected';

export interface ApplicationTrackerRecord {
  id: string;
  company: string;
  jobTitle: string;
  jobUrl: string;
  jobDescriptionSnapshot: string;
  matchScore: number;
  boardType: string;
  tailoredResumeId?: string;
  coverLetterText?: string;
  status: ApplicationTrackerStatus;
  dateAnalyzed: string;
  submissionDate?: string;
  notes?: string;
  filledActionsCount: number;
}

export interface ApplicationTrackerFilter {
  status?: ApplicationTrackerStatus | 'all';
  searchQuery?: string;
  minMatchScore?: number;
}
