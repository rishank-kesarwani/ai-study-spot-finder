import { Injectable, Logger } from '@nestjs/common';

export interface UsageRecord {
  timestamp: string;
  userId?: string;
  applicationId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  model: string;
  durationMs: number;
}

@Injectable()
export class AiCostTrackerService {
  private readonly logger = new Logger(AiCostTrackerService.name);
  private recentUsage: UsageRecord[] = [];
  private totalTokensUsed = 0;
  private totalCostUsd = 0;

  // Gemini 1.5 Pro / Flash blended cost estimation
  private readonly COST_PER_1K_PROMPT_TOKENS = 0.000125;
  private readonly COST_PER_1K_COMPLETION_TOKENS = 0.000375;

  trackUsage(record: {
    userId?: string;
    applicationId: string;
    promptTokens: number;
    completionTokens: number;
    model?: string;
    durationMs: number;
  }): UsageRecord {
    const promptTokens = record.promptTokens || 0;
    const completionTokens = record.completionTokens || 0;
    const totalTokens = promptTokens + completionTokens;

    const estimatedCostUsd =
      (promptTokens / 1000) * this.COST_PER_1K_PROMPT_TOKENS +
      (completionTokens / 1000) * this.COST_PER_1K_COMPLETION_TOKENS;

    const usage: UsageRecord = {
      timestamp: new Date().toISOString(),
      userId: record.userId,
      applicationId: record.applicationId,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      model: record.model || 'gemini-1.5-pro',
      durationMs: record.durationMs,
    };

    this.recentUsage.unshift(usage);
    if (this.recentUsage.length > 500) {
      this.recentUsage.pop();
    }

    this.totalTokensUsed += totalTokens;
    this.totalCostUsd += estimatedCostUsd;

    this.logger.log(
      `[AI Telemetry] Query completed in ${record.durationMs}ms: ${totalTokens} tokens ($${estimatedCostUsd.toFixed(6)}) - Model: ${usage.model}`,
    );

    return usage;
  }

  getSummary() {
    return {
      totalRequests: this.recentUsage.length,
      totalTokensUsed: this.totalTokensUsed,
      totalCostUsd: Number(this.totalCostUsd.toFixed(4)),
      recentRequests: this.recentUsage.slice(0, 10),
    };
  }
}
