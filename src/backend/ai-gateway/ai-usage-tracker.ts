import { db } from '../db/database';
import { AIUsageStats } from '@/shared/types';

export class AIUsageTracker {
  private stats: AIUsageStats;

  constructor() {
    this.stats = db.getAIUsageStats();
  }

  public getStats(): AIUsageStats {
    return { ...this.stats };
  }

  public recordRequest(
    agentId: string = 'general',
    success: boolean,
    inputTokens: number = 0,
    outputTokens: number = 0,
    isRateLimitError: boolean = false
  ): void {
    this.stats.totalRequests++;
    this.stats.lastUsedAt = new Date().toISOString();

    if (success) {
      this.stats.successfulRequests++;
    } else {
      this.stats.failedRequests++;
    }

    if (isRateLimitError) {
      this.stats.rateLimitErrors++;
    }

    this.stats.inputTokens += inputTokens;
    this.stats.outputTokens += outputTokens;
    this.stats.totalTokens += inputTokens + outputTokens;

    // Agent-level tracking
    if (!this.stats.agentUsage[agentId]) {
      this.stats.agentUsage[agentId] = { requests: 0, inputTokens: 0, outputTokens: 0 };
    }
    this.stats.agentUsage[agentId].requests++;
    this.stats.agentUsage[agentId].inputTokens += inputTokens;
    this.stats.agentUsage[agentId].outputTokens += outputTokens;

    // Estimate daily request load
    this.stats.estimatedDailyUsage = Math.min(this.stats.totalRequests, 1500); // 1,500 RPD free quota benchmark

    db.saveAIUsageStats(this.stats);
  }

  public resetStats(): void {
    this.stats = {
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
    db.saveAIUsageStats(this.stats);
  }
}

export const aiUsageTracker = new AIUsageTracker();
