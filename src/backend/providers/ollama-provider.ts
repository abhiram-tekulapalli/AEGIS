import { OllamaModelInfo, SystemHealth } from '@/shared/types';

/**
 * Ollama Local AI Inference Provider
 * Handles connection to local Ollama instance on http://127.0.0.1:11434
 * Detects installed models and executes prompt generation requests with structured JSON parsing.
 */

export class OllamaProvider {
  private ollamaUrl: string;
  private selectedModel: string | null = null;
  private useMockFallback: boolean = false;

  constructor(url = 'http://127.0.0.1:11434') {
    this.ollamaUrl = process.env.OLLAMA_HOST || url;
  }

  public getOllamaUrl(): string {
    return this.ollamaUrl;
  }

  public setOllamaUrl(url: string): void {
    this.ollamaUrl = url;
  }

  public getSelectedModel(): string | null {
    return this.selectedModel;
  }

  public setSelectedModel(modelName: string): void {
    this.selectedModel = modelName;
  }

  public setMockFallback(enable: boolean): void {
    this.useMockFallback = enable;
  }

  public isMockFallback(): boolean {
    return this.useMockFallback;
  }

  /**
   * Fetch installed Ollama models via GET /api/tags
   */
  public async getInstalledModels(): Promise<OllamaModelInfo[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${this.ollamaUrl}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Ollama API returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const models: OllamaModelInfo[] = data.models || [];
      
      // Auto-select first available model if none selected yet
      if (models.length > 0 && !this.selectedModel) {
        this.selectedModel = models[0].name;
      }

      return models;
    } catch (err) {
      // Return empty array if Ollama service is unreachable
      return [];
    }
  }

  /**
   * Health check for Ollama local service
   */
  public async checkHealth(): Promise<SystemHealth> {
    const models = await this.getInstalledModels();
    const isConnected = models.length > 0 || !this.useMockFallback;
    
    // Check if we can reach Ollama root or tags
    let status: SystemHealth['status'] = 'offline';
    if (models.length > 0) {
      status = 'ok';
    } else if (this.useMockFallback) {
      status = 'degraded';
    }

    return {
      status,
      backendVersion: '2.0.0-cloud-agent',
      aiProvider: 'gemini',
      geminiConnected: false,
      geminiModel: 'gemini-3.8-flash',
      cloudConsentGranted: false,
      apiKeyPresent: false,
      apiKeyMasked: null,
      ollamaConnected: models.length > 0,
      ollamaUrl: this.ollamaUrl,
      activeModel: this.selectedModel || (models[0]?.name ?? (this.useMockFallback ? 'rolepilot-mock-llama3' : null)),
      availableModels: models.map(m => m.name),
      databaseStatus: 'connected',
      usageStats: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        rateLimitErrors: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        estimatedDailyUsage: 0,
        agentUsage: {},
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate completion from local Ollama model (or mock testing fallback)
   */
  public async generateStructuredJSON<T>(
    prompt: string,
    systemPrompt: string,
    fallbackGenerator: () => T,
    modelOverride?: string
  ): Promise<T> {
    const modelToUse = modelOverride || this.selectedModel;

    // If mock fallback is enabled or no model available, use local deterministic reasoning generator
    if (this.useMockFallback || !modelToUse) {
      console.log('[OllamaProvider] Using local structured reasoning engine fallback.');
      return fallbackGenerator();
    }

    try {
      const fullPrompt = `${systemPrompt}\n\nIMPORTANT: Respond STRICTLY in valid JSON matching the requested schema. No markdown wrapping or conversational text.\n\nUser Request:\n${prompt}`;

      const res = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelToUse,
          prompt: fullPrompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.2,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Ollama generation failed: HTTP ${res.status}`);
      }

      const data = await res.json();
      const responseText = data.response;

      if (!responseText) {
        throw new Error('Empty response from Ollama model');
      }

      // Parse JSON from response
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as T;
    } catch (err) {
      console.warn(`[OllamaProvider] Error calling Ollama model (${modelToUse}), switching to fallback generator:`, err);
      return fallbackGenerator();
    }
  }
}

export const ollamaProvider = new OllamaProvider();
