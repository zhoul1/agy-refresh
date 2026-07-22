import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { parseImageGenQuota } from "../src/lib/image-gen-quota";

const FIXTURE_DIR = join(import.meta.dir, "fixtures");

describe("parseImageGenQuota", () => {
  const rawJson = readFileSync(join(FIXTURE_DIR, "image-gen-quota.json"), "utf-8");
  const response = JSON.parse(rawJson);
  const snapshot = parseImageGenQuota(response);

  it("should parse exhausted image model id", () => {
    expect(snapshot).not.toBeNull();
    expect(snapshot!.modelId).toBe("gemini-3.1-flash-image");
  });

  it("should mark as exhausted", () => {
    expect(snapshot!.isExhausted).toBe(true);
    expect(snapshot!.status).toBe("RESOURCE_EXHAUSTED");
  });

  it("should extract reset timestamp", () => {
    expect(snapshot!.resetTime).toBe("2026-07-09T15:33:14Z");
  });

  it("should extract reset delay", () => {
    expect(snapshot!.resetDelay).toBe("2h52m4.583682053s");
  });

  it("should extract domain", () => {
    expect(snapshot!.domain).toBe("cloudcode-pa.googleapis.com");
  });

  it("should include rawJson string", () => {
    expect(typeof snapshot!.rawJson).toBe("string");
    expect(snapshot!.rawJson.length).toBeGreaterThan(0);
  });

  describe("string input", () => {
    it("should parse a JSON string directly", () => {
      const s = parseImageGenQuota(rawJson);
      expect(s).not.toBeNull();
      expect(s!.modelId).toBe("gemini-3.1-flash-image");
      expect(s!.isExhausted).toBe(true);
    });
  });

  describe("success report", () => {
    it("should parse ok:true with model", () => {
      const s = parseImageGenQuota({ ok: true, model: "gemini-3.1-flash-image" });
      expect(s).not.toBeNull();
      expect(s!.modelId).toBe("gemini-3.1-flash-image");
      expect(s!.isExhausted).toBe(false);
      expect(s!.status).toBe("OK");
    });

    it("should parse success:true with model and resetTime", () => {
      const s = parseImageGenQuota({ success: true, model: "gemini-3.1-flash-image", resetTime: "2026-07-10T00:00:00Z" });
      expect(s).not.toBeNull();
      expect(s!.isExhausted).toBe(false);
      expect(s!.resetTime).toBe("2026-07-10T00:00:00Z");
    });

    it("should treat a response without error as success with fallback model", () => {
      const s = parseImageGenQuota({ candidates: [{ content: { parts: [{ inlineData: "AAA" }] } }] }, "gemini-3.1-flash-image");
      expect(s).not.toBeNull();
      expect(s!.modelId).toBe("gemini-3.1-flash-image");
      expect(s!.isExhausted).toBe(false);
      expect(s!.status).toBe("OK");
    });

    it("should parse a generic (non-429) error but not mark exhausted", () => {
      const s = parseImageGenQuota({ error: { code: 404, status: "NOT_FOUND", message: "method not found" } }, "gemini-3.1-flash-image");
      expect(s).not.toBeNull();
      expect(s!.modelId).toBe("gemini-3.1-flash-image");
      expect(s!.status).toBe("NOT_FOUND");
      expect(s!.isExhausted).toBe(false);
    });
  });

  describe("null / unrecognized safety", () => {
    it("should return null for null", () => {
      expect(parseImageGenQuota(null)).toBeNull();
    });
    it("should return null for empty object", () => {
      expect(parseImageGenQuota({})).toBeNull();
    });
    it("should return null for invalid string", () => {
      expect(parseImageGenQuota("not json")).toBeNull();
    });
    it("should return null for unknown structure without model", () => {
      expect(parseImageGenQuota({ error: { code: 500 } })).toBeNull();
    });
  });
});
