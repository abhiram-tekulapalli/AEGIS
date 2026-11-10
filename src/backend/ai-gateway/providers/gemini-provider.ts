import { GoogleGenAI } from '@google/genai';
import { 
  AIProvider, 
  AIProviderHealth, 
  AIRequestParams, 
  AIResponsePayload, 
  AIStructuredRequestParams 
} from '../contracts';
import { aiConfigService } from '../ai-config-service';
import { aiUsageTracker } from '../ai-usage-tracker';
import { AIErrorHandler } from '../ai-error-handler';

export class GeminiProvider implements AIProvider {
  public readonly name = 'gemini';

  public isConfigured(): boolean {
    const key = aiConfigService.getGeminiApiKey();
    return Boolean(key && key.trim().length > 0);
  }

  private getGenAIClient(): GoogleGenAI {
    const apiKey = aiConfigService.getGeminiApiKey();
    if (!apiKey || apiKey.trim().length === 0) {
      throw AIErrorHandler.normalize(new Error('API key is missing'));
    }

    return new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  public async checkHealth(): Promise<AIProviderHealth> {
    const isConf = this.isConfigured();
    const model = aiConfigService.getGeminiModel();

    if (!isConf) {
      return {
        status: 'offline',
        connected: false,
        provider: this.name,
        model,
        message: 'GEMINI_API_KEY is not configured in backend environment.',
      };
    }

    try {
      const client = this.getGenAIClient();
      const res = await client.models.generateContent({
        model,
        contents: 'ping',
        config: {
          maxOutputTokens: 10,
        },
      });

      const text = res.text || '';
      return {
        status: 'ok',
        connected: true,
        provider: this.name,
        model,
        message: 'Gemini Developer API connected successfully.',
      };
    } catch (err: any) {
      const normalized = AIErrorHandler.normalize(err);
      return {
        status: normalized.code === 'RATE_LIMITED' ? 'degraded' : 'offline',
        connected: false,
        provider: this.name,
        model,
        message: normalized.userActionableMessage,
      };
    }
  }

  public async generateText(params: AIRequestParams): Promise<AIResponsePayload> {
    const modelToUse = params.modelOverride || aiConfigService.getGeminiModel();
    const client = this.getGenAIClient();
    const maxRetries = aiConfigService.getMaxRetries();
    const timeoutMs = params.timeoutMs || aiConfigService.getTimeoutMs();

    let attempt = 0;
    let lastError: any = null;

    while (attempt <= maxRetries) {
      try {
        const fetchPromise = client.models.generateContent({
          model: modelToUse,
          contents: params.prompt,
          config: {
            systemInstruction: params.systemInstruction,
            maxOutputTokens: params.maxTokens || aiConfigService.getMaxOutputTokens(),
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI Request Timeout')), timeoutMs)
        );

        const response: any = await Promise.race([fetchPromise, timeoutPromise]);
        const responseText = response.text || '';

        const usageMetadata = response.usageMetadata
          ? {
              inputTokens: response.usageMetadata.promptTokenCount || 0,
              outputTokens: response.usageMetadata.candidatesTokenCount || 0,
              totalTokens: response.usageMetadata.totalTokenCount || 0,
            }
          : undefined;

        aiUsageTracker.recordRequest(
          params.agentId || 'general',
          true,
          usageMetadata?.inputTokens || 0,
          usageMetadata?.outputTokens || 0
        );

        return {
          text: responseText,
          model: modelToUse,
          provider: this.name,
          usageMetadata,
        };
      } catch (err: any) {
        lastError = err;
        const normalized = AIErrorHandler.normalize(err);

        aiUsageTracker.recordRequest(
          params.agentId || 'general',
          false,
          0,
          0,
          normalized.code === 'RATE_LIMITED'
        );

        // Exponential backoff for rate limits or transient errors
        if ((normalized.code === 'RATE_LIMITED' || normalized.statusCode >= 500) && attempt < maxRetries) {
          attempt++;
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw normalized;
      }
    }

    throw AIErrorHandler.normalize(lastError);
  }

  public async generateStructuredJSON<T>(params: AIStructuredRequestParams<T>): Promise<T> {
    const modelToUse = params.modelOverride || aiConfigService.getGeminiModel();
    const client = this.getGenAIClient();
    const maxRetries = aiConfigService.getMaxRetries();
    const timeoutMs = params.timeoutMs || aiConfigService.getTimeoutMs();

    const fullPrompt = `${params.prompt}\n\nIMPORTANT: Respond STRICTLY with a valid JSON object matching the requested schema. No markdown formatting or extra text.`;

    let attempt = 0;
    let lastError: any = null;

    while (attempt <= maxRetries) {
      try {
        const fetchPromise = client.models.generateContent({
          model: modelToUse,
          contents: fullPrompt,
          config: {
            systemInstruction: params.systemInstruction,
            responseMimeType: 'application/json',
            maxOutputTokens: params.maxTokens || aiConfigService.getMaxOutputTokens(),
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI Request Timeout')), timeoutMs)
        );

        const response: any = await Promise.race([fetchPromise, timeoutPromise]);
        const responseText = response.text || '';

        const usageMetadata = response.usageMetadata
          ? {
              inputTokens: response.usageMetadata.promptTokenCount || 0,
              outputTokens: response.usageMetadata.candidatesTokenCount || 0,
              totalTokens: response.usageMetadata.totalTokenCount || 0,
            }
          : undefined;

        aiUsageTracker.recordRequest(
          params.agentId || 'general',
          true,
          usageMetadata?.inputTokens || 0,
          usageMetadata?.outputTokens || 0
        );

        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        if (params.zodSchema) {
          return params.zodSchema.parse(parsed) as T;
        }

        return parsed as T;
      } catch (err: any) {
        lastError = err;
        const normalized = AIErrorHandler.normalize(err);

        aiUsageTracker.recordRequest(
          params.agentId || 'general',
          false,
          0,
          0,
          normalized.code === 'RATE_LIMITED'
        );

        // Exponential backoff for rate limits or transient errors
        if ((normalized.code === 'RATE_LIMITED' || normalized.statusCode >= 500) && attempt < maxRetries) {
          attempt++;
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        console.warn(`[GeminiProvider] Error generating JSON from model (${modelToUse}), using fallback generator:`, normalized.message);
        return params.fallbackGenerator();
      }
    }

    return params.fallbackGenerator();
  }
}

export const geminiProvider = new GeminiProvider();
