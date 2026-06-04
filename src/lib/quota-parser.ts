export interface ModelQuotaInfo {
  modelId: string;
  displayName?: string;
  usedPercentage?: number;
  remainingPercentage?: number;
  resetTime?: string;
  isExhausted: boolean;
}

export interface QuotaSnapshot {
  email?: string;
  promptCreditsUsed?: number;
  promptCreditsLimit?: number;
  promptCreditsRemaining?: number;
  models: ModelQuotaInfo[];
  rawJson: string;
}

export function parseUserStatusToSnapshot(input: any): QuotaSnapshot {
  const snapshot: QuotaSnapshot = { models: [], rawJson: JSON.stringify(input) };
  if (!input || typeof input !== "object") return snapshot;

  const userStatus = input?.userStatus || input;
  if (!userStatus || typeof userStatus !== "object") return snapshot;

  if (userStatus?.email) snapshot.email = userStatus.email;

  const planStatus = userStatus?.planStatus;
  if (planStatus) {
    const available = planStatus.availablePromptCredits;
    const monthly = planStatus.planInfo?.monthlyPromptCredits;
    if (typeof available === "number" && typeof monthly === "number") {
      snapshot.promptCreditsUsed = monthly - available;
      snapshot.promptCreditsLimit = monthly;
      snapshot.promptCreditsRemaining = available;
    }
  }

  const configs = userStatus?.cascadeModelConfigData?.clientModelConfigs;
  if (Array.isArray(configs)) {
    for (const m of configs) {
      const modelOrAlias = m.modelOrAlias;
      const modelId = modelOrAlias?.model || "unknown";
      const quotaInfo = m.quotaInfo;
      const remainingFraction = typeof quotaInfo?.remainingFraction === "number" ? quotaInfo.remainingFraction : undefined;
      snapshot.models.push({
        modelId,
        displayName: m.label || undefined,
        usedPercentage: remainingFraction !== undefined ? (1 - remainingFraction) * 100 : undefined,
        remainingPercentage: remainingFraction !== undefined ? remainingFraction * 100 : undefined,
        resetTime: quotaInfo?.resetTime || undefined,
        isExhausted: remainingFraction === 0,
      });
    }
  }

  return snapshot;
}
