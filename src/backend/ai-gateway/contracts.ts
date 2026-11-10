import { AIUsageStats } from '@/shared/types';

export interface AIRequestParams {
  prompt: string;
  systemInstruction?: string;
  modelOverride?: string;
  agentId?: string;
  timeoutMs?: number;
  temperature?: number;
  maxTokens?: number;
}

export interface AIStructuredRequestParams<T> extends AIRequestParams {
  fallbackGenerator: () => T;
  zodSchema?: any;
}

export interface AIResponsePayload {
  text: string;
  model: string;
  provider: string;
  usageMetadata?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface AIProviderHealth {
  status: 'ok' | 'degraded' | 'offline';
  connected: boolean;
  provider: string;
  model: string;
  message?: string;
}

export interface AIProvider {
  name: string;
  isConfigured(): boolean;
  checkHealth(): Promise<AIProviderHealth>;
  generateText(params: AIRequestParams): Promise<AIResponsePayload>;
  generateStructuredJSON<T>(params: AIStructuredRequestParams<T>): Promise<T>;
}
