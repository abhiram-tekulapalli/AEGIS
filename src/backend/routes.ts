import { Router, Request, Response } from 'express';
import { z } from 'zod';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

import { db } from './db/database';
import { aiModelGateway } from './ai-gateway/ai-model-gateway';
import { aiConfigService } from './ai-gateway/ai-config-service';
import { aiUsageTracker } from './ai-gateway/ai-usage-tracker';
import { agentRegistry } from './agents/agent-registry';
import { agentCoordinator } from './agents/specialized/agent-coordinator';
import { profileAnalyzer } from './services/profile-analyzer';
import { profileIntelligence } from './services/profile-intelligence';
import { jobIntelligence } from './services/job-intelligence';
import { matchingEngine } from './services/matching-engine';
import { resumeCustomization } from './services/resume-customization';
import { questionIntelligence } from './services/question-intelligence';
import { formAutomationEngine } from './services/form-automation';
import { agentOrchestrator } from './agent/orchestrator';
import { applicationTracker } from './services/application-tracker';

import { 
  CandidateProfileSchema, 
  AnalyzeJobRequestSchema, 
  GeneratePlanRequestSchema, 
  TailorResumeRequestSchema,
  ApplicationTrackerRecordSchema
} from '@/shared/schemas';

export const apiRouter = Router();

// Middleware: Origin & Local Binding Validation
apiRouter.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-AEGIS-Client, X-RolePilot-Client');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

/**
 * GET /api/health
 */
apiRouter.get('/health', async (req: Request, res: Response) => {
  const healthInfo = await aiModelGateway.checkHealth();
  const profile = db.getProfile();
  const readiness = profileAnalyzer.analyzeReadiness(profile);
  const usageStats = aiUsageTracker.getStats();
  const providerInfo = aiConfigService.getProviderInfo();

  res.json({
    status: healthInfo.status,
    backendVersion: '2.0.0-cloud-agent',
    aiProvider: 'gemini',
    geminiConnected: healthInfo.connected,
    geminiModel: providerInfo.model,
    cloudConsentGranted: providerInfo.cloudConsentGranted,
    apiKeyPresent: providerInfo.apiKeyPresent,
    apiKeyMasked: providerInfo.apiKeyMasked,
    ollamaConnected: false,
    ollamaUrl: 'http://127.0.0.1:11434',
    activeModel: providerInfo.model,
    availableModels: [providerInfo.model, 'gemini-3.8-flash', 'gemini-3.1-flash-lite'],
    databaseStatus: 'connected',
    usageStats,
    profileReadinessScore: readiness.score,
    isProfileReady: readiness.isReadyForAutoFill,
    agentState: agentOrchestrator.getContext().currentState,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/ai/config & GET /api/ollama/models (backward compatibility)
 */
const getAiConfigHandler = async (req: Request, res: Response) => {
  const healthInfo = await aiModelGateway.checkHealth();
  const providerInfo = aiConfigService.getProviderInfo();
  const usageStats = aiUsageTracker.getStats();

  res.json({
    connected: healthInfo.connected,
    provider: providerInfo.provider,
    selectedModel: providerInfo.model,
    mockFallbackEnabled: providerInfo.mockFallbackEnabled,
    cloudConsentGranted: providerInfo.cloudConsentGranted,
    apiKeyPresent: providerInfo.apiKeyPresent,
    apiKeyMasked: providerInfo.apiKeyMasked,
    ollamaUrl: 'http://127.0.0.1:11434',
    usageStats,
    models: [
      { name: 'gemini-3.8-flash', size: 0, digest: 'cloud-gemini-3.8-flash', modified_at: new Date().toISOString() },
      { name: 'gemini-3.1-flash-lite', size: 0, digest: 'cloud-gemini-3.1-flash-lite', modified_at: new Date().toISOString() },
    ],
    agents: agentRegistry.listAgents(),
  });
};

apiRouter.get('/ai/config', getAiConfigHandler);
apiRouter.get('/ollama/models', getAiConfigHandler);

/**
 * POST /api/ai/config & POST /api/ollama/config (backward compatibility)
 */
const postAiConfigHandler = (req: Request, res: Response) => {
  const { model, useMockFallback, cloudConsent } = req.body;

  if (typeof useMockFallback === 'boolean') {
    aiConfigService.setMockFallback(useMockFallback);
  }
  if (typeof cloudConsent === 'boolean') {
    aiConfigService.setCloudConsent(cloudConsent);
  }

  const providerInfo = aiConfigService.getProviderInfo();

  res.json({
    success: true,
    provider: providerInfo.provider,
    selectedModel: providerInfo.model,
    mockFallbackEnabled: providerInfo.mockFallbackEnabled,
    cloudConsentGranted: providerInfo.cloudConsentGranted,
    apiKeyPresent: providerInfo.apiKeyPresent,
    apiKeyMasked: providerInfo.apiKeyMasked,
  });
};

apiRouter.post('/ai/config', postAiConfigHandler);
apiRouter.post('/ollama/config', postAiConfigHandler);

/**
 * POST /api/ai/consent
 */
apiRouter.post('/ai/consent', (req: Request, res: Response) => {
  const { granted } = req.body;
  if (typeof granted !== 'boolean') {
    return res.status(400).json({ error: 'Missing or invalid boolean field "granted"' });
  }

  aiConfigService.setCloudConsent(granted);
  res.json({
    success: true,
    cloudConsentGranted: aiConfigService.isCloudConsentGranted(),
  });
});

/**
 * GET /api/agents
 */
apiRouter.get('/agents', (req: Request, res: Response) => {
  res.json({
    agents: agentRegistry.listAgents(),
  });
});

/**
 * GET /api/profile
 */
apiRouter.get('/profile', (req: Request, res: Response) => {
  const profile = db.getProfile();
  const readiness = profileAnalyzer.analyzeReadiness(profile);
  res.json({
    profile,
    readiness,
  });
});

/**
 * POST /api/profile
 */
apiRouter.post('/profile', (req: Request, res: Response) => {
  try {
    const validatedData = CandidateProfileSchema.parse(req.body);
    const updated = db.updateProfile(validatedData);
    const readiness = profileAnalyzer.analyzeReadiness(updated);

    res.json({
      success: true,
      profile: updated,
      readiness,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.issues });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/profile/upload-resume
 */
apiRouter.post('/profile/upload-resume', async (req: Request, res: Response) => {
  try {
    const { fileName, fileType, fileBase64 } = req.body;
    if (!fileName || !fileBase64) {
      return res.status(400).json({ error: 'Missing fileName or fileBase64 payload' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    const mimeType = fileType || (fileName.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    const record = await profileIntelligence.parseResumeFile(buffer, fileName, mimeType);
    const updatedProfile = db.getProfile();
    const readiness = profileAnalyzer.analyzeReadiness(updatedProfile);

    res.json({
      success: record.extractionStatus === 'success' || record.extractionStatus === 'partial',
      record,
      profile: updatedProfile,
      readiness,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to upload/parse resume: ' + err.message });
  }
});

/**
 * POST /api/jobs/analyze
 */
apiRouter.post('/jobs/analyze', async (req: Request, res: Response) => {
  try {
    const { job } = AnalyzeJobRequestSchema.parse(req.body);
    const { job: processedJob, match } = await agentCoordinator.extractAndAnalyzeJob(job as any);

    await agentOrchestrator.tool_extractJobDescription(processedJob);
    await agentOrchestrator.tool_analyzeJobMatch(processedJob.id);

    res.json({
      success: true,
      job: processedJob,
      match,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.issues });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/applications/plan
 */
apiRouter.post('/applications/plan', async (req: Request, res: Response) => {
  try {
    const { job, fields } = GeneratePlanRequestSchema.parse(req.body);
    const processedJob = jobIntelligence.processJobListing(job as any);
    const profile = db.getProfile();

    const plan = await agentCoordinator.generateApplicationPlan(processedJob, profile, fields as any);
    await agentOrchestrator.tool_mapApplicationFields(fields as any);

    res.json({
      success: true,
      plan,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.issues });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/resume/tailor
 */
apiRouter.post('/resume/tailor', async (req: Request, res: Response) => {
  try {
    const { job, selectedModel } = TailorResumeRequestSchema.parse(req.body);
    const processedJob = jobIntelligence.processJobListing(job as any);
    const profile = db.getProfile();

    const tailoredResume = await agentCoordinator.generateTailoredResume(processedJob, profile, selectedModel);
    await agentOrchestrator.tool_generateTailoredResume(selectedModel);

    res.json({
      success: true,
      tailoredResume,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.issues });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/resume/download-docx
 */
apiRouter.get('/resume/download-docx', async (req: Request, res: Response) => {
  try {
    const jobId = req.query.jobId as string;
    const profile = db.getProfile();
    const tailored = db.getResume(jobId) || {
      id: `tailored-${Date.now()}`,
      jobId: jobId || 'default',
      jobTitle: 'Software Engineer',
      company: 'Target Company',
      summary: profile.summary,
      highlightedSkills: profile.skills,
      tailoredExperienceHighlights: profile.workHistory.map(wh => ({
        company: wh.company,
        role: wh.role,
        tailoredBullets: wh.highlights,
        originalBullets: wh.highlights,
      })),
      tailoredProjects: profile.projects.map(p => ({ title: p.title, tailoredDescription: p.description })),
      coverLetterText: profile.summary,
      generatedAt: new Date().toISOString(),
    };

    const buffer = await resumeCustomization.createResumeDocxBuffer(tailored, profile);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="Tailored-Resume-${tailored.company.replace(/[^a-zA-Z0-9]/g, '_')}.docx"`);
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate DOCX document: ' + err.message });
  }
});

/**
 * GET /api/tracker
 */
apiRouter.get('/tracker', (req: Request, res: Response) => {
  const statusFilter = req.query.status as any;
  const records = applicationTracker.getRecords({ status: statusFilter });
  res.json({ records });
});

/**
 * POST /api/tracker
 */
apiRouter.post('/tracker', (req: Request, res: Response) => {
  try {
    const record = ApplicationTrackerRecordSchema.parse(req.body);
    const duplicateCheck = applicationTracker.isDuplicateApplication(record.jobUrl, record.company, record.jobTitle);

    const saved = applicationTracker.saveRecord(record);

    res.json({
      success: true,
      record: saved,
      isDuplicateNotice: duplicateCheck.isDuplicate && duplicateCheck.existingRecord?.id !== record.id,
      existingRecord: duplicateCheck.existingRecord,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.issues });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/tracker/:id
 */
apiRouter.delete('/tracker/:id', (req: Request, res: Response) => {
  applicationTracker.deleteRecord(req.params.id);
  res.json({ success: true, records: applicationTracker.getRecords() });
});

/**
 * GET /api/agent/context
 */
apiRouter.get('/agent/context', (req: Request, res: Response) => {
  res.json(agentOrchestrator.getContext());
});

/**
 * GET /api/extension/bundle
 */
apiRouter.get('/extension/bundle', async (req: Request, res: Response) => {
  try {
    const zip = new JSZip();
    
    const manifestContent = fs.readFileSync(path.resolve(process.cwd(), 'extension/manifest.json'), 'utf-8');
    const sidepanelHtmlContent = fs.readFileSync(path.resolve(process.cwd(), 'extension/sidepanel.html'), 'utf-8');
    const serviceWorkerContent = fs.readFileSync(path.resolve(process.cwd(), 'extension/background/service-worker.ts'), 'utf-8');
    const contentScriptContent = fs.readFileSync(path.resolve(process.cwd(), 'extension/content/content-script.ts'), 'utf-8');
    const domReaderContent = fs.readFileSync(path.resolve(process.cwd(), 'extension/content/dom-reader.ts'), 'utf-8');
    const formDetectorContent = fs.readFileSync(path.resolve(process.cwd(), 'extension/content/form-detector.ts'), 'utf-8');
    const formFillerContent = fs.readFileSync(path.resolve(process.cwd(), 'extension/content/form-filler.ts'), 'utf-8');

    zip.file('manifest.json', manifestContent);
    zip.file('sidepanel.html', sidepanelHtmlContent);
    zip.file('background/service-worker.js', serviceWorkerContent);
    zip.file('content/content-script.js', contentScriptContent);
    zip.file('content/dom-reader.js', domReaderContent);
    zip.file('content/form-detector.js', formDetectorContent);
    zip.file('content/form-filler.js', formFillerContent);

    // Include PNG icons if present
    const icon16Path = path.resolve(process.cwd(), 'extension/icons/icon-16.png');
    const icon48Path = path.resolve(process.cwd(), 'extension/icons/icon-48.png');
    const icon128Path = path.resolve(process.cwd(), 'extension/icons/icon-128.png');

    if (fs.existsSync(icon16Path)) {
      zip.file('icons/icon-16.png', fs.readFileSync(icon16Path));
    }
    if (fs.existsSync(icon48Path)) {
      zip.file('icons/icon-48.png', fs.readFileSync(icon48Path));
    }
    if (fs.existsSync(icon128Path)) {
      zip.file('icons/icon-128.png', fs.readFileSync(icon128Path));
    }

    zip.file('README_INSTALL.txt', `AEGIS CHROME EXTENSION INSTALLATION INSTRUCTIONS:

1. Extract this zip file into a folder on your computer.
2. Open Google Chrome and navigate to chrome://extensions
3. Enable "Developer mode" toggle in the top-right corner.
4. Click "Load unpacked" and select the extracted folder.
5. The AEGIS Side Panel icon will appear in your Chrome toolbar!
`);

    const content = await zip.generateAsync({ type: 'nodebuffer' });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="AEGIS-Chrome-Extension.zip"');
    res.send(content);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate extension bundle zip: ' + err.message });
  }
});
