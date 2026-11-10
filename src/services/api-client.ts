import { 
  SystemHealth, 
  OllamaModelInfo, 
  CandidateProfile, 
  JobPosting, 
  TransparentJobMatchResult, 
  ApplicationPlan, 
  TailoredResume,
  DetectedFormField,
  ApplicationTrackerRecord,
  AgentStateContext
} from '@/shared/types';

const API_BASE = '/api';

export class RolePilotAPIClient {
  public async getHealth(): Promise<SystemHealth & { profileReadinessScore: number; isProfileReady: boolean; agentState: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch backend health');
    return res.json();
  }

  public async getOllamaModels(): Promise<{
    connected: boolean;
    provider: string;
    selectedModel: string | null;
    mockFallbackEnabled: boolean;
    cloudConsentGranted: boolean;
    apiKeyPresent: boolean;
    apiKeyMasked: string | null;
    models: any[];
    agents: any[];
  }> {
    const res = await fetch(`${API_BASE}/ai/config`);
    if (!res.ok) throw new Error('Failed to fetch AI configuration');
    return res.json();
  }

  public async updateOllamaConfig(config: { model?: string; useMockFallback?: boolean; cloudConsent?: boolean }) {
    const res = await fetch(`${API_BASE}/ai/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to update AI configuration');
    return res.json();
  }

  public async updateCloudConsent(granted: boolean): Promise<{ success: boolean; cloudConsentGranted: boolean }> {
    const res = await fetch(`${API_BASE}/ai/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ granted }),
    });
    if (!res.ok) throw new Error('Failed to update cloud consent');
    return res.json();
  }

  public async getProfile(): Promise<{ profile: CandidateProfile; readiness: any }> {
    const res = await fetch(`${API_BASE}/profile`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  }

  public async updateProfile(profile: CandidateProfile): Promise<{ success: boolean; profile: CandidateProfile; readiness: any }> {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  }

  public async uploadResumeFile(fileName: string, fileType: string, fileBase64: string): Promise<{ success: boolean; record: any; profile: CandidateProfile; readiness: any }> {
    const res = await fetch(`${API_BASE}/profile/upload-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, fileType, fileBase64 }),
    });
    if (!res.ok) throw new Error('Failed to upload/parse resume file');
    return res.json();
  }

  public async analyzeJob(job: Partial<JobPosting>, selectedModel?: string): Promise<{ success: boolean; job: JobPosting; match: TransparentJobMatchResult }> {
    const res = await fetch(`${API_BASE}/jobs/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, selectedModel }),
    });
    if (!res.ok) throw new Error('Failed to analyze job');
    return res.json();
  }

  public async generatePlan(job: Partial<JobPosting>, fields: DetectedFormField[], selectedModel?: string): Promise<{ success: boolean; plan: ApplicationPlan }> {
    const res = await fetch(`${API_BASE}/applications/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, fields, selectedModel }),
    });
    if (!res.ok) throw new Error('Failed to generate application plan');
    return res.json();
  }

  public async tailorResume(job: Partial<JobPosting>, selectedModel?: string): Promise<{ success: boolean; tailoredResume: TailoredResume }> {
    const res = await fetch(`${API_BASE}/resume/tailor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, selectedModel }),
    });
    if (!res.ok) throw new Error('Failed to tailor resume');
    return res.json();
  }

  public getDocxDownloadUrl(jobId: string): string {
    return `${API_BASE}/resume/download-docx?jobId=${encodeURIComponent(jobId)}`;
  }

  public async getTrackerRecords(statusFilter?: string): Promise<{ records: ApplicationTrackerRecord[] }> {
    const query = statusFilter && statusFilter !== 'all' ? `?status=${encodeURIComponent(statusFilter)}` : '';
    const res = await fetch(`${API_BASE}/tracker${query}`);
    if (!res.ok) throw new Error('Failed to fetch tracker records');
    return res.json();
  }

  public async saveTrackerRecord(record: ApplicationTrackerRecord): Promise<{ success: boolean; record: ApplicationTrackerRecord; isDuplicateNotice?: boolean }> {
    const res = await fetch(`${API_BASE}/tracker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error('Failed to save tracker record');
    return res.json();
  }

  public async deleteTrackerRecord(recordId: string): Promise<void> {
    await fetch(`${API_BASE}/tracker/${encodeURIComponent(recordId)}`, {
      method: 'DELETE',
    });
  }

  public async getAgentContext(): Promise<AgentStateContext> {
    const res = await fetch(`${API_BASE}/agent/context`);
    if (!res.ok) throw new Error('Failed to fetch agent context');
    return res.json();
  }

  public getExtensionDownloadUrl(): string {
    return `${API_BASE}/extension/bundle`;
  }
}

export const apiClient = new RolePilotAPIClient();
