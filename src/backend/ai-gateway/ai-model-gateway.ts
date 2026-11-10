import { 
  AIRequestParams, 
  AIResponsePayload, 
  AIStructuredRequestParams, 
  AIProviderHealth 
} from './contracts';
import { geminiProvider } from './providers/gemini-provider';
import { aiConfigService } from './ai-config-service';
import { aiUsageTracker } from './ai-usage-tracker';
import { AIErrorHandler, AINormalizedError } from './ai-error-handler';

export class AIModelGateway {
  private activeConcurrency = 0;
  private queue: Array<() => void> = [];

  private async acquireSemaphore(): Promise<void> {
    const maxConcurrent = aiConfigService.getMaxConcurrentRequests();
    if (this.activeConcurrency < maxConcurrent) {
      this.activeConcurrency++;
      return;
    }

    return new Promise((resolve) => {
      this.queue.push(() => {
        this.activeConcurrency++;
        resolve();
      });
    });
  }

  private releaseSemaphore(): void {
    this.activeConcurrency = Math.max(0, this.activeConcurrency - 1);
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    }
  }

  public async checkHealth(): Promise<AIProviderHealth> {
    const isMock = aiConfigService.isMockFallback();
    const isConsent = aiConfigService.isCloudConsentGranted();
    const isConf = geminiProvider.isConfigured();

    if (isMock) {
      return {
        status: 'degraded',
        connected: true,
        provider: 'mock',
        model: 'aegis-deterministic-local-engine',
        message: 'Local testing reasoning engine active.',
      };
    }

    if (!isConsent) {
      return {
        status: 'degraded',
        connected: isConf,
        provider: 'gemini',
        model: aiConfigService.getGeminiModel(),
        message: 'Cloud AI consent required. Personal profile data will not be sent until consent is granted.',
      };
    }

    return await geminiProvider.checkHealth();
  }

  public async generateText(params: AIRequestParams): Promise<AIResponsePayload> {
    const isConsent = aiConfigService.isCloudConsentGranted();
    const isConf = geminiProvider.isConfigured();
    const isMock = aiConfigService.isMockFallback();

    if (isMock || !isConsent || !isConf) {
      console.log('[AIModelGateway] Cloud consent or API key unavailable, returning local deterministic response.');
      return {
        text: 'AEGIS local deterministic response mode.',
        model: 'local-engine',
        provider: 'mock',
      };
    }

    await this.acquireSemaphore();
    try {
      return await geminiProvider.generateText(params);
    } catch (err) {
      throw AIErrorHandler.normalize(err);
    } finally {
      this.releaseSemaphore();
    }
  }

  public async generateStructuredJSON<T>(params: AIStructuredRequestParams<T>): Promise<T> {
    const isConsent = aiConfigService.isCloudConsentGranted();
    const isConf = geminiProvider.isConfigured();
    const isMock = aiConfigService.isMockFallback();

    if (isMock || !isConsent || !isConf) {
      console.log(`[AIModelGateway] Routing request for agent "${params.agentId || 'general'}" to local fallback generator (Consent: ${isConsent}, Key: ${isConf}, Mock: ${isMock}).`);
      return params.fallbackGenerator();
    }

    await this.acquireSemaphore();
    try {
      return await geminiProvider.generateStructuredJSON<T>(params);
    } catch (err) {
      console.warn(`[AIModelGateway] Provider error for agent "${params.agentId || 'general'}", using fallback generator:`, err);
      return params.fallbackGenerator();
    } finally {
      this.releaseSemaphore();
    }
  }
}

export const aiModelGateway = new AIModelGateway();
