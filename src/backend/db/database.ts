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
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'alex.morgan@example.com',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA',
  headline: 'Senior Full Stack Software Engineer',
  summary: 'Senior Software Engineer with 6+ years of experience building modern web applications, cloud-native services, and local AI integrations using React, TypeScript, Node.js, and Python.',
  website: 'https://alexmorgan.dev',
  linkedIn: 'https://linkedin.com/in/alexmorgan-dev',
  github: 'https://github.com/alexmorgan-dev',
  portfolio: 'https://alexmorgan.dev/projects',
  workAuthorization: 'US Citizen',
  requiresSponsorship: false,
  desiredSalary: '$160,000 - $185,000 USD',
  noticePeriod: '2 Weeks',
  desiredJobTitles: ['Senior Full Stack Engineer', 'Staff Software Engineer', 'AI Platform Architect'],
  preferredWorkType: 'Remote',
  openToRelocation: false,
  yearsOfExperience: 6,
  skills: [
    'TypeScript', 'React', 'Node.js', 'Express', 'Next.js', 
    'Python', 'PostgreSQL', 'SQLite', 'TailwindCSS', 'REST APIs', 
    'GraphQL', 'Docker', 'AWS', 'Git', 'Vite', 'Ollama', 'System Architecture'
  ],
  programmingLanguages: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'HTML/CSS'],
  toolsAndFrameworks: ['React', 'Node.js', 'Express', 'Vite', 'Docker', 'Git', 'Zod', 'Ollama'],
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      graduationYear: '2020',
      evidenceSource: 'manual_entry',
    }
  ],
  workHistory: [
    {
      id: 'exp-1',
      company: 'Apex Tech Solutions',
      role: 'Senior Software Engineer',
      startDate: '2022-03',
      endDate: 'Present',
      isCurrent: true,
      highlights: [
        'Architected and deployed microservices handling 2M+ daily active requests with 99.98% uptime.',
        'Led transition to Vite and React 19, reducing frontend build times by 65%.',
        'Implemented local AI agent pipelines for internal developer tooling using Ollama and Llama 3.'
      ],
      technologiesUsed: ['TypeScript', 'React', 'Node.js', 'Ollama', 'Docker'],
      evidenceSource: 'manual_entry',
    },
    {
      id: 'exp-2',
      company: 'Vanguard Systems',
      role: 'Full Stack Developer',
      startDate: '2020-06',
      endDate: '2022-02',
      isCurrent: false,
      highlights: [
        'Developed customer-facing dashboard and automated analytics pipeline with TypeScript and PostgreSQL.',
        'Engineered responsive web client and RESTful API endpoints for multi-tenant SaaS application.'
      ],
      technologiesUsed: ['TypeScript', 'React', 'PostgreSQL', 'Express'],
      evidenceSource: 'manual_entry',
    }
  ],
  internships: [],
  projects: [
    {
      id: 'proj-1',
      title: 'AEGIS Local Agent',
      description: 'Privacy-first local job application agent powered by Ollama LLM and SQLite.',
      role: 'Lead Architect',
      technologies: ['TypeScript', 'React', 'Express', 'SQLite', 'Ollama'],
      url: 'https://github.com/alexmorgan-dev/aegis',
      outcomes: ['Integrated offline LLM inference with zero data leakage.'],
      evidenceSource: 'manual_entry',
    }
  ],
  certifications: [],
  achievements: [
    'Winner of 2024 Developer Productivity Hackathon',
    'Author of open-source local LLM TypeScript SDK'
  ],
  resumeDocuments: [],
  customAnswers: {
    'why_company': 'I am deeply inspired by your team\'s mission to build user-focused, privacy-respecting products. My background in high-performance web applications matches your current engineering roadmap.',
    'greatest_achievement': 'Designing an automated offline-first agent system that saved our engineering team 15+ hours per week in routine workflows.',
  },
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
