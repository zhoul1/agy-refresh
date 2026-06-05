import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { callGetUserStatus } from "../src/lib/agy-quota";
import { parseUserStatusToSnapshot } from "../src/lib/quota-parser";

const FIXTURE_DIR = join(import.meta.dir, "fixtures");

describe("connect-rpc with mocked fetch", () => {
  const fixtureJson = readFileSync(join(FIXTURE_DIR, "get-user-status-response.json"), "utf-8");

  it("should handle successful response", async () => {
    // Mock fetch to return the fixture data
    const mockFetch = async (url: string, options: any) => {
      return {
        status: 200,
        ok: true,
        json: async () => JSON.parse(fixtureJson),
        text: async () => fixtureJson,
        headers: new Headers(),
      };
    };

    const response = await callGetUserStatus("https://127.0.0.1:49801", "test-token", mockFetch);
    expect(response).toBeTruthy();

    const snapshot = parseUserStatusToSnapshot(response);
    expect(snapshot.email).toBe("user@example.com");
    expect(snapshot.models).toHaveLength(8);
    expect(snapshot.promptCreditsLimit).toBe(50000);
  });

  it("should handle 401 response", async () => {
    const mockFetch = async () => {
      return {
        status: 401,
        ok: false,
        text: async () => '{"code":"unauthenticated","message":"invalid CSRF token"}',
        headers: new Headers(),
      };
    };

    await expect(
      callGetUserStatus("https://127.0.0.1:49801", "bad-token", mockFetch)
    ).rejects.toThrow("HTTP 401");
  });

  it("should handle network error", async () => {
    const mockFetch = async () => {
      throw new Error("ECONNREFUSED");
    };

    await expect(
      callGetUserStatus("https://127.0.0.1:49801", "token", mockFetch)
    ).rejects.toThrow("ECONNREFUSED");
  });

  it("should handle abort signal", async () => {
    const mockFetch = async (_url: string, options: any) => {
      if (options.signal) {
        await new Promise((_, reject) => {
          options.signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
        });
      }
      return null as any;
    };

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 50);

    await expect(
      callGetUserStatus("https://127.0.0.1:49801", "token", mockFetch, { signal: controller.signal })
    ).rejects.toThrow();
  }, { timeout: 2000 });
});

describe("connect-rpc response parsing integration", () => {
  it("should parse real fixture end-to-end", async () => {
    const mockFetch = async () => {
      const text = readFileSync(join(FIXTURE_DIR, "get-user-status-response.json"), "utf-8");
      return {
        status: 200,
        ok: true,
        json: async () => JSON.parse(text),
        text: async () => text,
        headers: new Headers(),
      };
    };

    const raw = await callGetUserStatus("https://127.0.0.1:49801", "token", mockFetch);
    const snapshot = parseUserStatusToSnapshot(raw);

    expect(snapshot.email).toBe("user@example.com");
    expect(snapshot.models[0].displayName).toBe("Gemini 3.5 Flash (Medium)");
    expect(snapshot.models[0].usedPercentage).toBeCloseTo(20, 0);

    const exhausted = snapshot.models.find(m => m.isExhausted);
    expect(exhausted).toBeUndefined();
  });

  it("should handle edge case fixture", async () => {
    const mockFetch = async () => {
      const text = readFileSync(join(FIXTURE_DIR, "get-user-status-edge-cases.json"), "utf-8");
      return {
        status: 200,
        ok: true,
        json: async () => JSON.parse(text),
        text: async () => text,
        headers: new Headers(),
      };
    };

    const raw = await callGetUserStatus("https://127.0.0.1:49801", "token", mockFetch);
    const snapshot = parseUserStatusToSnapshot(raw);

    const exhausted = snapshot.models.find(m => m.isExhausted);
    expect(exhausted).toBeDefined();
    expect(exhausted!.modelId).toBe("MODEL_EXHAUSTED");
  });
});
