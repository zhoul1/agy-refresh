import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { parseUserStatusToSnapshot } from "../src/lib/quota-parser";

const FIXTURE_DIR = join(import.meta.dir, "fixtures");

describe("parseUserStatusToSnapshot", () => {
  const rawJson = readFileSync(join(FIXTURE_DIR, "get-user-status-response.json"), "utf-8");
  const response = JSON.parse(rawJson);
  const snapshot = parseUserStatusToSnapshot(response);

  it("should extract email", () => {
    expect(snapshot.email).toBe("user@example.com");
  });

  it("should extract prompt credits", () => {
    expect(snapshot.promptCreditsLimit).toBe(50000);
    expect(snapshot.promptCreditsUsed).toBe(49500);
    expect(snapshot.promptCreditsRemaining).toBe(500);
  });

  it("should extract all 8 models", () => {
    expect(snapshot.models).toHaveLength(8);
  });

  it("should parse model with quotaInfo correctly", () => {
    const flash = snapshot.models.find((m) => m.modelId === "MODEL_PLACEHOLDER_M20");
    expect(flash).toBeDefined();
    expect(flash!.displayName).toBe("Gemini 3.5 Flash (Medium)");
    expect(flash!.usedPercentage).toBeCloseTo(20, 0);
    expect(flash!.remainingPercentage).toBeCloseTo(80, 0);
    expect(flash!.resetTime).toBe("2026-06-04T23:42:47Z");
    expect(flash!.isExhausted).toBe(false);
  });

  it("should parse model without remainingFraction", () => {
    const claude = snapshot.models.find((m) => m.modelId === "MODEL_PLACEHOLDER_M35");
    expect(claude).toBeDefined();
    expect(claude!.displayName).toBe("Claude Sonnet 4.6 (Thinking)");
    expect(claude!.usedPercentage).toBeUndefined();
    expect(claude!.remainingPercentage).toBeUndefined();
    expect(claude!.isExhausted).toBe(false);
  });

  it("should include rawJson string", () => {
    expect(typeof snapshot.rawJson).toBe("string");
    expect(snapshot.rawJson.length).toBeGreaterThan(0);
  });

  describe("edge cases", () => {
    const edgeJson = readFileSync(join(FIXTURE_DIR, "get-user-status-edge-cases.json"), "utf-8");
    const edgeResponse = JSON.parse(edgeJson);
    const edgeSnapshot = parseUserStatusToSnapshot(edgeResponse);

    it("should mark exhausted model (remainingFraction=0)", () => {
      const exhausted = edgeSnapshot.models.find((m) => m.modelId === "MODEL_EXHAUSTED");
      expect(exhausted).toBeDefined();
      expect(exhausted!.usedPercentage).toBe(100);
      expect(exhausted!.remainingPercentage).toBe(0);
      expect(exhausted!.isExhausted).toBe(true);
    });

    it("should handle full quota (remainingFraction=1)", () => {
      const full = edgeSnapshot.models.find((m) => m.modelId === "MODEL_FULL");
      expect(full).toBeDefined();
      expect(full!.usedPercentage).toBe(0);
      expect(full!.remainingPercentage).toBe(100);
      expect(full!.isExhausted).toBe(false);
    });

    it("should handle model with missing quotaInfo", () => {
      const noQuota = edgeSnapshot.models.find((m) => m.modelId === "MODEL_NO_QUOTA");
      expect(noQuota).toBeDefined();
      expect(noQuota!.usedPercentage).toBeUndefined();
      expect(noQuota!.remainingPercentage).toBeUndefined();
      expect(noQuota!.isExhausted).toBe(false);
    });

    it("should handle null label", () => {
      const noLabel = edgeSnapshot.models.find((m) => m.modelId === "MODEL_NO_LABEL");
      expect(noLabel).toBeDefined();
      expect(noLabel!.displayName).toBeUndefined();
      expect(noLabel!.usedPercentage).toBe(50);
      expect(noLabel!.remainingPercentage).toBe(50);
    });

    it("should handle zero available credits", () => {
      expect(edgeSnapshot.promptCreditsUsed).toBe(100000);
      expect(edgeSnapshot.promptCreditsRemaining).toBe(0);
      expect(edgeSnapshot.promptCreditsLimit).toBe(100000);
    });
  });

  describe("null/undefined safety", () => {
    it("should handle null input gracefully", () => {
      const result = parseUserStatusToSnapshot(null);
      expect(result.models).toEqual([]);
      expect(result.email).toBeUndefined();
    });

    it("should handle empty object", () => {
      const result = parseUserStatusToSnapshot({});
      expect(result.models).toEqual([]);
    });

    it("should handle missing cascadeModelConfigData", () => {
      const result = parseUserStatusToSnapshot({ userStatus: { email: "x@y.com" } });
      expect(result.email).toBe("x@y.com");
      expect(result.models).toEqual([]);
    });
  });
});
