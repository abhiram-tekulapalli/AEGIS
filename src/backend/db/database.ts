import fs from 'fs';
import path from 'path';
import { 
  CandidateProfile, 
  JobPosting, 
  TransparentJobMatchResult, 
  TailoredResume,
  ApplicationTrackerRecord,
  ApplicationHistoryEntry,
  AIUsageStats
} from '@/shared/types';

/**
 * AEGIS SQLite Local Persistent Database
 */

interface DBData {
  profile: CandidateProfile;
  jobs: Record<string, { posting: JobPosting; match?: TransparentJobMatchResult }>;
  resumes: Record<string, TailoredResume>;
  applications: ApplicationHistoryEntry[];
  trackerRecords: ApplicationTrackerRecord[];
  fieldRules: Record<string, string>;
  cloudConsent?: { granted: boolean; grantedAt?: string };
  aiUsageStats?: AIUsageStats;
  apiKey?: string;
  geminiModel?: string;
}

const DEFAULT_PROFILE: CandidateProfile = {
  id: 'c-default',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  headline: '',
  summary: '',
  website: '',
  linkedIn: '',
  github: '',
  portfolio: '',
  workAuthorization: '',
  requiresSponsorship: false,
  desiredSalary: '',
  noticePeriod: '',
  desiredJobTitles: [],
  preferredWorkType: 'Remote',
  openToRelocation: false,
  yearsOfExperience: 0,
  skills: [],
  programmingLanguages: [],
  toolsAndFrameworks: [],
  education: [],
  workHistory: [],
  internships: [],
  projects: [],
  certifications: [],
  achievements: [],
  resumeDocuments: [],
  customAnswers: {},
  updatedAt: new Date().toISOString(),
};

export class RolePilotDatabase {
  private dbPath: string;
  private data: DBData;

  constructor() {
    const dataDir = path.resolve(process.cwd(), '.rolepilot-data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Fallback
      }
    }
    this.dbPath = path.resolve(dataDir, 'sqlite-store.json');
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DBData {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          profile: { ...DEFAULT_PROFILE, ...parsed.profile },
          jobs: parsed.jobs || {},
          resumes: parsed.resumes || {},
          applications: parsed.applications || [],
          trackerRecords: parsed.trackerRecords || [],
          fieldRules: parsed.fieldRules || {},
        };
      }
    } catch (err) {
      console.warn('[SQLite Storage] Reinitializing database:', err);
    }
    return {
      profile: DEFAULT_PROFILE,
      jobs: {},
      resumes: {},
      applications: [],
      trackerRecords: [],
      fieldRules: {
        'first_name': 'firstName',
        'last_name': 'lastName',
        'email': 'email',
        'phone': 'phone',
        'linkedin': 'linkedIn',
        'github': 'github',
        'portfolio': 'portfolio',
        'website': 'website',
        'location': 'location',
        'salary': 'desiredSalary',
        'headline': 'headline',
        'summary': 'summary',
      }
    };
  }

  private saveDatabase(): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[SQLite Storage] Error writing DB file:', err);
    }
  }

  public getProfile(): CandidateProfile {
    return this.data.profile;
  }

  public updateProfile(updated: Partial<CandidateProfile>): CandidateProfile {
    this.data.profile = {
      ...this.data.profile,
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase();
    return this.data.profile;
  }

  public saveJob(posting: JobPosting, match?: TransparentJobMatchResult): void {
    this.data.jobs[posting.id] = { posting, match };
    this.saveDatabase();
  }

  public getJob(jobId: string) {
    return this.data.jobs[jobId];
  }

  public saveResume(resume: TailoredResume): void {
    this.data.resumes[resume.jobId] = resume;
    this.saveDatabase();
  }

  public getResume(jobId: string): TailoredResume | undefined {
    return this.data.resumes[jobId];
  }

  public logApplication(entry: ApplicationHistoryEntry): void {
    const existingIndex = this.data.applications.findIndex(a => a.id === entry.id || (a.url === entry.url && entry.url !== ''));
    if (existingIndex >= 0) {
      this.data.applications[existingIndex] = entry;
    } else {
      this.data.applications.unshift(entry);
    }
    this.saveDatabase();
  }

  public getApplicationHistory(): ApplicationHistoryEntry[] {
    return this.data.applications;
  }

  public getApplicationTrackerRecords(): ApplicationTrackerRecord[] {
    return this.data.trackerRecords || [];
  }

  public saveApplicationTrackerRecords(records: ApplicationTrackerRecord[]): void {
    this.data.trackerRecords = records;
    this.saveDatabase();
  }

  public getFieldRules(): Record<string, string> {
    return this.data.fieldRules || {};
  }

  public getCloudConsent(): boolean {
    return this.data.cloudConsent?.granted ?? false;
  }

  public setCloudConsent(granted: boolean): void {
    this.data.cloudConsent = {
      granted,
      grantedAt: new Date().toISOString(),
    };
    this.saveDatabase();
  }

  public getAIUsageStats(): AIUsageStats {
    return this.data.aiUsageStats || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitErrors: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      estimatedDailyUsage: 0,
      agentUsage: {},
    };
  }

  public saveAIUsageStats(stats: AIUsageStats): void {
    this.data.aiUsageStats = stats;
    this.saveDatabase();
  }

  public getApiKey(): string | undefined {
    return this.data.apiKey;
  }

  public setApiKey(apiKey: string): void {
    this.data.apiKey = apiKey.trim();
    this.saveDatabase();
  }

  public getGeminiModel(): string | undefined {
    return this.data.geminiModel;
  }

  public setGeminiModel(model: string): void {
    this.data.geminiModel = model.trim();
    this.saveDatabase();
  }
}

export const db = new RolePilotDatabase();
