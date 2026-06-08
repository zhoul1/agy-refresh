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
  name?: string;
  planName?: string;
  promptCreditsUsed?: number;
  promptCreditsLimit?: number;
  promptCreditsRemaining?: number;
  flowCreditsUsed?: number;
  flowCreditsLimit?: number;
  flowCreditsRemaining?: number;
  googleOneAiCredits?: number;
  models: ModelQuotaInfo[];
  rawJson: string;
}

export function parseUserStatusToSnapshot(input: any): QuotaSnapshot {
  const snapshot: QuotaSnapshot = { models: [], rawJson: JSON.stringify(input) };
  if (!input || typeof input !== "object") return snapshot;

  const userStatus = input?.userStatus || input;
  if (!userStatus || typeof userStatus !== "object") return snapshot;

  if (userStatus?.email) snapshot.email = userStatus.email;
  if (userStatus?.name) snapshot.name = userStatus.name;

  const planStatus = userStatus?.planStatus;
  if (planStatus) {
    const available = planStatus.availablePromptCredits;
    const monthly = planStatus.planInfo?.monthlyPromptCredits;
    if (typeof available === "number" && typeof monthly === "number") {
      snapshot.promptCreditsUsed = monthly - available;
      snapshot.promptCreditsLimit = monthly;
      snapshot.promptCreditsRemaining = available;
    }

    const flowAvailable = planStatus.availableFlowCredits;
    const flowMonthly = planStatus.planInfo?.monthlyFlowCredits;
    if (typeof flowAvailable === "number" && typeof flowMonthly === "number") {
      snapshot.flowCreditsUsed = flowMonthly - flowAvailable;
      snapshot.flowCreditsLimit = flowMonthly;
      snapshot.flowCreditsRemaining = flowAvailable;
    }

    snapshot.planName = planStatus.planInfo?.planName;
  }

  const userTier = userStatus?.userTier;
  if (userTier?.availableCredits && Array.isArray(userTier.availableCredits)) {
    const googleOne = userTier.availableCredits.find((c: any) => c.creditType === "GOOGLE_ONE_AI");
    if (googleOne?.creditAmount) {
      snapshot.googleOneAiCredits = parseInt(googleOne.creditAmount, 10) || 0;
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
