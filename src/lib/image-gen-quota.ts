export interface ImageGenQuotaSnapshot {
  modelId: string;
  status: string;
  isExhausted: boolean;
  resetTime?: string;
  resetDelay?: string;
  domain?: string;
  reason?: string;
  message?: string;
  rawJson: string;
}

/**
 * 解析 Google 图像生成（gemini-*.image）相关的返回内容：
 *  - 限流 429 错误 JSON（RESOURCE_EXHAUSTED / QUOTA_EXHAUSTED）
 *  - 其它错误（含方法不存在等），状态标为错误但非额度耗尽
 *  - 成功出图返回的响应（无 error 结构），fallbackModel 用于补全模型名
 * 无法识别时返回 null。
 */
export function parseImageGenQuota(input: any, fallbackModel?: string): ImageGenQuotaSnapshot | null {
  const rawJson = typeof input === "string" ? input : JSON.stringify(input ?? null);
  let parsed: any = input;
  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input);
    } catch {
      parsed = null;
    }
  }
  if (!parsed || typeof parsed !== "object") return null;

  // 错误结构：error.code / error.status
  const err = parsed.error;
  if (err && (err.code !== undefined || err.status !== undefined)) {
    const details = Array.isArray(err.details) ? err.details : [];
    const info = details.find(
      (d: any) => d && (d.reason === "QUOTA_EXHAUSTED" || d["@type"]?.includes("ErrorInfo"))
    ) || details[0] || {};
    const meta = info?.metadata || {};
    const isQuota = err.code === 429 || err.status === "RESOURCE_EXHAUSTED";
    const modelId = meta.model || (typeof err.message === "string" ? extractModelFromMessage(err.message) : undefined) || fallbackModel;
    if (!modelId) return null;
    return {
      modelId,
      status: err.status || String(err.code ?? "ERROR"),
      isExhausted: isQuota,
      resetTime: isQuota ? (meta.quotaResetTimeStamp || undefined) : undefined,
      resetDelay: isQuota ? (meta.quotaResetDelay || undefined) : undefined,
      domain: info?.domain || undefined,
      reason: info?.reason || undefined,
      message: typeof err.message === "string" ? err.message : undefined,
      rawJson,
    };
  }

  // 没有明显 error 结构 → 视为成功出图（实际返回通常含图像数据）
  const modelId = parsed.model || parsed.modelId || fallbackModel;
  if (!modelId) return null;
  return {
    modelId,
    status: "OK",
    isExhausted: false,
    resetTime: parsed.resetTime || undefined,
    rawJson,
  };
}

function extractModelFromMessage(message: string): string | undefined {
  const m = message.match(/model[`'"\s]+([\w.\-]+)/i);
  return m ? m[1] : undefined;
}
