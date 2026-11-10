import { db } from '../db/database';
import { AIProviderInfo } from '@/shared/types';

export class AIConfigurationService {
  private mockFallbackEnabled: boolean = false;

  public getProvider(): string {
    return process.env.AI_PROVIDER || 'gemini';
  }

  public getGeminiApiKey(): string | undefined {
    return process.env.GEMINI_API_KEY;
  }

  public getGeminiModel(): string {
    return process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  }

  public getTimeoutMs(): number {
    return process.env.AI_REQUEST_TIMEOUT_MS ? parseInt(process.env.AI_REQUEST_TIMEOUT_MS, 10) : 60000;
  }

  public getMaxRetries(): number {
    return process.env.AI_MAX_RETRIES ? parseInt(process.env.AI_MAX_RETRIES, 10) : 2;
  }

  public getMaxConcurrentRequests(): number {
    return process.env.AI_MAX_CONCURRENT_REQUESTS ? parseInt(process.env.AI_MAX_CONCURRENT_REQUESTS, 10) : 2;
  }

  public getMaxOutputTokens(): number {
    return process.env.AI_MAX_OUTPUT_TOKENS ? parseInt(process.env.AI_MAX_OUTPUT_TOKENS, 10) : 4096;
  }

  public isCloudConsentGranted(): boolean {
    return db.getCloudConsent();
  }

  public setCloudConsent(granted: boolean): void {
    db.setCloudConsent(granted);
  }

  public isMockFallback(): boolean {
    return this.mockFallbackEnabled;
  }

  public setMockFallback(enable: boolean): void {
    this.mockFallbackEnabled = enable;
  }

  public getMaskedApiKey(): string | null {
    const key = this.getGeminiApiKey();
    if (!key || key.trim().length === 0) return null;
    const clean = key.trim();
    if (clean.length <= 8) return '****';
    return `${clean.slice(0, 4)}...${clean.slice(-4)}`;
  }

  public getProviderInfo(): AIProviderInfo {
    const apiKey = this.getGeminiApiKey();
    const hasKey = Boolean(apiKey && apiKey.trim().length > 0);
    const consent = this.isCloudConsentGranted();

    return {
      provider: 'gemini',
      model: this.getGeminiModel(),
      configured: hasKey,
      cloudConsentGranted: consent,
      mockFallbackEnabled: this.mockFallbackEnabled,
      apiKeyPresent: hasKey,
      apiKeyMasked: this.getMaskedApiKey(),
    };
  }
}

export const aiConfigService = new AIConfigurationService();
