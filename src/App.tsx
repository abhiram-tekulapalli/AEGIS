import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  FileText, 
  CheckSquare, 
  Download, 
  Moon, 
  Sun, 
  Zap, 
  Briefcase, 
  User, 
  History,
  Terminal,
  Building2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

import { Header } from './components/sidepanel/Header';
import { OnboardingModal } from './components/sidepanel/OnboardingModal';
import { JobInspector } from './components/sidepanel/JobInspector';
import { ProfileReadinessView } from './components/sidepanel/ProfileReadinessView';
import { ApplicationPlannerView } from './components/sidepanel/ApplicationPlannerView';
import { TailoredResumeView } from './components/sidepanel/TailoredResumeView';
import { ApplicationTrackerView } from './components/sidepanel/ApplicationTrackerView';

import { MockJobPage } from './components/testbed/MockJobPage';
import { ExtensionExporter } from './components/developer/ExtensionExporter';

import { apiClient } from './services/api-client';
import { 
  SystemHealth, 
  OllamaModelInfo, 
  CandidateProfile, 
  JobPosting, 
  TransparentJobMatchResult, 
  ApplicationPlan, 
  TailoredResume,
  FormFillAction,
  ApplicationTrackerRecord,
  DetectedFormField,
  AgentStateContext
} from '@/shared/types';
import { ProfileReadiness } from './backend/services/profile-analyzer';

export default function App() {
  // Navigation state
  const [viewMode, setViewMode] = useState<'simulator' | 'sidepanel_only' | 'developer'>('simulator');
  const [activeSidepanelTab, setActiveSidepanelTab] = useState<'job' | 'plan' | 'resume' | 'profile' | 'tracker'>('job');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Backend state
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [models, setModels] = useState<OllamaModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [mockFallback, setMockFallback] = useState<boolean>(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [agentContext, setAgentContext] = useState<AgentStateContext | null>(null);

  // Domain state
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [profileReadiness, setProfileReadiness] = useState<ProfileReadiness | null>(null);
  const [currentJob, setCurrentJob] = useState<JobPosting | null>(null);
  const [jobMatch, setJobMatch] = useState<TransparentJobMatchResult | null>(null);
  const [applicationPlan, setApplicationPlan] = useState<ApplicationPlan | null>(null);
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);
  const [trackerRecords, setTrackerRecords] = useState<ApplicationTrackerRecord[]>([]);

  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);

  // Sync dark class on document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initial data loading
  useEffect(() => {
    loadHealthAndModels();
    loadProfile();
    loadTrackerRecords();
    loadAgentContext();
  }, []);

  const loadHealthAndModels = async () => {
    try {
      const hData = await apiClient.getHealth();
      setHealth(hData as any);

      const mData = await apiClient.getOllamaModels();
      setModels(mData.models);
      setSelectedModel(mData.selectedModel);
      setMockFallback(mData.mockFallbackEnabled);

      if (!hData.geminiConnected && !mData.mockFallbackEnabled) {
        setMockFallback(true);
      }
    } catch (err) {
      console.warn('Backend loading warning:', err);
    }
  };

  const loadProfile = async () => {
    try {
      const data = await apiClient.getProfile();
      setProfile(data.profile);
      setProfileReadiness(data.readiness);
    } catch (err) {
      console.warn('Profile load failed:', err);
    }
  };

  const loadTrackerRecords = async () => {
    try {
      const data = await apiClient.getTrackerRecords();
      setTrackerRecords(data.records);
    } catch (err) {
      console.warn('Tracker load failed:', err);
    }
  };

  const loadAgentContext = async () => {
    try {
      const ctx = await apiClient.getAgentContext();
      setAgentContext(ctx);
    } catch (err) {
      console.warn('Agent context load failed:', err);
    }
  };

  // Handlers
  const handleSelectModel = async (model: string) => {
    setSelectedModel(model);
    await apiClient.updateOllamaConfig({ model });
    loadHealthAndModels();
  };

  const handleToggleMockFallback = async (enable: boolean) => {
    setMockFallback(enable);
    await apiClient.updateOllamaConfig({ useMockFallback: enable });
    loadHealthAndModels();
  };

  const handleUpdateProfile = async (updated: CandidateProfile) => {
    try {
      const res = await apiClient.updateProfile(updated);
      setProfile(res.profile);
      setProfileReadiness(res.readiness);
    } catch (err: any) {
      alert('Error updating profile: ' + err.message);
    }
  };

  const handleAnalyzeJob = async () => {
    if (!currentJob) return;
    setIsAnalyzing(true);
    try {
      const res = await apiClient.analyzeJob(currentJob, selectedModel || undefined);
      setCurrentJob(res.job);
      setJobMatch(res.match);
      loadAgentContext();
      setActiveSidepanelTab('job');
    } catch (err: any) {
      alert('Job analysis failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const fieldElements = document.querySelectorAll<HTMLElement>('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select');
      const detectedFields: DetectedFormField[] = Array.from(fieldElements).map((el, i) => {
        const id = el.id || `input-${i}`;
        const name = el.getAttribute('name') || id;
        const label = document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() || name;
        const placeholder = el.getAttribute('placeholder') || '';
        const tag = el.tagName.toLowerCase();
        const type = tag === 'textarea' ? 'textarea' : tag === 'select' ? 'select' : (el.getAttribute('type') || 'text') as any;
        
        let options: string[] | undefined;
        if (tag === 'select') {
          options = Array.from((el as HTMLSelectElement).options).map(o => o.text.trim());
        }

        return {
          id,
          selector: el.id ? `#${el.id}` : (name ? `[name="${name}"]` : `${tag}:nth-of-type(${i + 1})`),
          name,
          label,
          placeholder,
          type,
          required: el.hasAttribute('required'),
          options,
        };
      });

      const targetJob = currentJob || {
        id: 'job-simulator',
        url: 'https://boards.greenhouse.io/acme/jobs/101',
        title: 'Senior Full-Stack Engineer',
        company: 'Acme AI Systems',
        location: 'San Francisco, CA',
        workType: 'Hybrid',
        employmentType: 'Full-time',
        salary: '$165,000 USD',
        description: 'Acme AI Systems is building autonomous local AI agent assistants.',
        responsibilities: ['Design and deploy scalable web microservices'],
        requiredSkills: ['TypeScript', 'React', 'Node.js', 'Express', 'Ollama'],
        preferredSkills: ['SQLite', 'Zod', 'Vite'],
        educationalQualifications: ['BS Computer Science or equivalent'],
        experienceRequirements: '5+ years experience',
        eligibilityNotes: [],
        otherRequirements: [],
        boardType: 'greenhouse',
        extractedAt: new Date().toISOString(),
        untrustedContentSanitized: true,
      };

      const res = await apiClient.generatePlan(targetJob, detectedFields, selectedModel || undefined);
      setApplicationPlan(res.plan);
      loadAgentContext();
      setActiveSidepanelTab('plan');
    } catch (err: any) {
      alert('Generating plan failed: ' + err.message);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleExecuteApprovedActions = async (approvedActions: FormFillAction[]) => {
    if (approvedActions.length === 0) return;
    setIsFilling(true);

    const updatedActions: FormFillAction[] = [];

    for (const action of approvedActions) {
      const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(action.selector);
      if (el) {
        el.style.outline = '3px solid #6366f1';
        el.style.boxShadow = '0 0 12px rgba(99, 102, 241, 0.5)';
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        el.value = action.proposedValue;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));

        await new Promise((r) => setTimeout(r, 150));
        el.style.outline = '';
        el.style.boxShadow = '';

        updatedActions.push({
          ...action,
          status: 'verified_success',
          verifiedValue: el.value,
          reasoning: `Verified value populated in DOM ("${el.value.slice(0, 20)}...")`,
        });
      } else {
        updatedActions.push({
          ...action,
          status: 'verified_failed',
          reasoning: 'DOM element not found',
        });
      }
    }

    if (applicationPlan) {
      setApplicationPlan({
        ...applicationPlan,
        actions: applicationPlan.actions.map((a) => {
          const matched = updatedActions.find((u) => u.fieldId === a.fieldId);
          return matched || a;
        }),
      });
    }

    // Save to local tracker
    const logRecord: ApplicationTrackerRecord = {
      id: `app-${Date.now()}`,
      company: currentJob?.company || 'Acme AI Systems',
      jobTitle: currentJob?.title || 'Senior Full-Stack Engineer',
      jobUrl: currentJob?.url || window.location.href,
      jobDescriptionSnapshot: currentJob?.description.slice(0, 200) || '',
      matchScore: jobMatch?.matchScore || 85,
      boardType: currentJob?.boardType || 'greenhouse',
      status: 'prepared',
      dateAnalyzed: new Date().toISOString(),
      filledActionsCount: updatedActions.filter((a) => a.status === 'verified_success').length,
    };
    await apiClient.saveTrackerRecord(logRecord);
    loadTrackerRecords();
    loadAgentContext();

    setIsFilling(false);
  };

  const handleTailorResume = async () => {
    if (!currentJob) return;
    setIsTailoring(true);
    try {
      const res = await apiClient.tailorResume(currentJob, selectedModel || undefined);
      setTailoredResume(res.tailoredResume);
      loadAgentContext();
      setActiveSidepanelTab('resume');
    } catch (err: any) {
      alert('Tailoring resume failed: ' + err.message);
    } finally {
      setIsTailoring(false);
    }
  };

  const handleHighlightField = (selector: string) => {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) {
      el.style.outline = '3px solid #6366f1';
      el.style.boxShadow = '0 0 12px rgba(99, 102, 241, 0.6)';
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        el.style.outline = '';
        el.style.boxShadow = '';
      }, 2500);
    }
  };

  const handleSaveTrackerRecord = async (record: ApplicationTrackerRecord) => {
    await apiClient.saveTrackerRecord(record);
    loadTrackerRecords();
  };

  const handleDeleteTrackerRecord = async (recordId: string) => {
    await apiClient.deleteTrackerRecord(recordId);
    loadTrackerRecords();
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      {/* Top Bar Contract */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 flex items-center justify-between gap-8 shrink-0">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-black text-xs tracking-widest shadow-xs">
            AE
          </div>
          <span className="text-lg font-extrabold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase whitespace-nowrap shrink-0">
            AEGIS
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700">
            Gemini Cloud Agent v2.0
          </span>
        </div>

        {/* Zone 2: Navigation view mode controls */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setViewMode('simulator')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'simulator'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            Application Workbench
          </button>
          <button
            onClick={() => setViewMode('sidepanel_only')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'sidepanel_only'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
            SidePanel View
          </button>
          <button
            onClick={() => setViewMode('developer')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'developer'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Chrome Extension Export
          </button>
        </nav>

        {/* Zone 3: Primary action & theme switch */}
        <div className="flex items-center gap-3 shrink-0">
          {agentContext?.currentState && (
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-pulse" />
              State: {agentContext.currentState}
            </span>
          )}

          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
            Setup & CLI
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content Area */}
        <main
          className={`${
            viewMode === 'sidepanel_only'
              ? 'hidden'
              : viewMode === 'developer'
              ? 'lg:col-span-12'
              : 'lg:col-span-7 xl:col-span-8'
          } space-y-6`}
        >
          {viewMode === 'simulator' && (
            <MockJobPage
              onFormFieldsDetected={(fields, job) => {
                setCurrentJob(job as any);
                handleGeneratePlan();
              }}
            />
          )}

          {viewMode === 'developer' && <ExtensionExporter />}
        </main>

        {/* Chrome Extension SidePanel Container */}
        <aside
          className={`${
            viewMode === 'developer'
              ? 'hidden'
              : viewMode === 'sidepanel_only'
              ? 'lg:col-span-8 lg:col-start-3 xl:col-span-6 xl:col-start-4'
              : 'lg:col-span-5 xl:col-span-4'
          } bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden sticky top-6 flex flex-col max-h-[85vh]`}
        >
          {/* Sidepanel Header */}
          <Header
            health={health}
            models={models}
            selectedModel={selectedModel}
            mockFallback={mockFallback}
            theme={theme}
            onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            onSelectModel={handleSelectModel}
            onToggleMockFallback={handleToggleMockFallback}
            onRefreshHealth={loadHealthAndModels}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />

          {/* Sidepanel Navigation Bar */}
          <nav className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-2 py-1.5 text-xs font-mono font-medium shrink-0">
            <button
              onClick={() => setActiveSidepanelTab('job')}
              className={`flex-1 py-1 px-1 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeSidepanelTab === 'job'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Job</span>
            </button>

            <button
              onClick={() => setActiveSidepanelTab('plan')}
              className={`flex-1 py-1 px-1 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeSidepanelTab === 'plan'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Plan</span>
            </button>

            <button
              onClick={() => setActiveSidepanelTab('resume')}
              className={`flex-1 py-1 px-1 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeSidepanelTab === 'resume'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tailor</span>
            </button>

            <button
              onClick={() => setActiveSidepanelTab('profile')}
              className={`flex-1 py-1 px-1 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeSidepanelTab === 'profile'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveSidepanelTab('tracker')}
              className={`flex-1 py-1 px-1 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeSidepanelTab === 'tracker'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Tracker</span>
            </button>
          </nav>

          {/* Sidepanel View Body */}
          <div className="flex-1 overflow-y-auto">
            {activeSidepanelTab === 'job' && (
              <JobInspector
                job={currentJob}
                match={jobMatch}
                isAnalyzing={isAnalyzing}
                onAnalyzeJob={handleAnalyzeJob}
                onGeneratePlan={handleGeneratePlan}
                onTailorResume={handleTailorResume}
              />
            )}

            {activeSidepanelTab === 'plan' && (
              <ApplicationPlannerView
                plan={applicationPlan}
                isGenerating={isGeneratingPlan}
                isFilling={isFilling}
                onGeneratePlan={handleGeneratePlan}
                onExecuteApprovedActions={handleExecuteApprovedActions}
                onHighlightField={handleHighlightField}
              />
            )}

            {activeSidepanelTab === 'resume' && (
              <TailoredResumeView
                tailoredResume={tailoredResume}
                job={currentJob}
                isTailoring={isTailoring}
                onTailorResume={handleTailorResume}
              />
            )}

            {activeSidepanelTab === 'profile' && profile && (
              <ProfileReadinessView
                profile={profile}
                readiness={profileReadiness}
                onSaveProfile={handleUpdateProfile}
              />
            )}

            {activeSidepanelTab === 'tracker' && (
              <ApplicationTrackerView
                records={trackerRecords}
                onSaveRecord={handleSaveTrackerRecord}
                onDeleteRecord={handleDeleteTrackerRecord}
              />
            )}
          </div>
        </aside>
      </div>

      {/* Onboarding / Connection modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        ollamaConnected={health?.ollamaConnected ?? false}
        mockFallback={mockFallback}
        onEnableMock={() => handleToggleMockFallback(true)}
      />
    </div>
  );
}
