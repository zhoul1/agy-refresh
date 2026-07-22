import { describe, it, expect } from "bun:test";
import { triggerImageGen } from "../src/lib/image-gen-trigger";

const IMAGE_GEN_FIXTURE = JSON.stringify({
  error: {
    code: 429,
    message: "You have exhausted your capacity on this model.",
    status: "RESOURCE_EXHAUSTED",
    details: [{ "@type": "type.googleapis.com/google.rpc.ErrorInfo", reason: "QUOTA_EXHAUSTED", domain: "cloudcode-pa.googleapis.com", metadata: { model: "gemini-3.1-flash-image", quotaResetTimeStamp: "2026-07-09T15:33:14Z", quotaResetDelay: "2h52m4s" } }],
  },
});

function fakeEndpoint() {
  return Promise.resolve({ baseUrl: "https://127.0.0.1:12345", csrfToken: "tok" });
}

describe("triggerImageGen", () => {
  it("should parse a 429 response into an exhausted snapshot", async () => {
    const fetchFn = async () => new Response(IMAGE_GEN_FIXTURE, { status: 429 });
    const result = await triggerImageGen(
      { enabled: true, method: "GenerateImage", model: "gemini-3.1-flash-image", prompt: "x", authToken: "", endpoint: "", timeoutMs: 5000 },
      fetchFn,
      5000,
      fakeEndpoint,
    );
    expect(result.ok).toBe(true);
    expect(result.snapshot!.isExhausted).toBe(true);
    expect(result.snapshot!.modelId).toBe("gemini-3.1-flash-image");
    expect(result.snapshot!.resetTime).toBe("2026-07-09T15:33:14Z");
  });

  it("should treat a successful image response as OK", async () => {
    const fetchFn = async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ inlineData: "AAA" }] } }] }), { status: 200 });
    const result = await triggerImageGen(
      { enabled: true, method: "GenerateImage", model: "gemini-3.1-flash-image", prompt: "x", authToken: "", endpoint: "", timeoutMs: 5000 },
      fetchFn,
      5000,
      fakeEndpoint,
    );
    expect(result.ok).toBe(true);
    expect(result.snapshot!.isExhausted).toBe(false);
    expect(result.snapshot!.status).toBe("OK");
  });

  it("should report error when endpoint is not found", async () => {
    const result = await triggerImageGen(
      { enabled: true, method: "GenerateImage", model: "gemini-3.1-flash-image", prompt: "x", authToken: "", endpoint: "", timeoutMs: 5000 },
      undefined,
      5000,
      () => Promise.resolve(null),
    );
    expect(result.ok).toBe(false);
    expect(result.error).toContain("AGy");
  });

  it("should report unrecognized response when method is wrong", async () => {
    const fetchFn = async () => new Response(JSON.stringify({ error: { code: 404, status: "NOT_FOUND", message: "unknown method GenerateImage" } }), { status: 404 });
    const result = await triggerImageGen(
      { enabled: true, method: "GenerateImage", model: "gemini-3.1-flash-image", prompt: "x", authToken: "", endpoint: "", timeoutMs: 5000 },
      fetchFn,
      5000,
      fakeEndpoint,
    );
    expect(result.ok).toBe(false);
    expect(result.error).toContain("method");
  });

  it("should call a custom endpoint when configured (with auth token)", async () => {
    let seenAuth = "";
    const fetchFn = async (url: string, opts: any) => {
      seenAuth = opts.headers?.Authorization || "";
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ inlineData: "AAA" }] } }] }), { status: 200 });
    };
    const cfg = { enabled: true, endpoint: "https://cloudcode-pa.googleapis.com/x:generateContent", method: "GenerateImage", model: "gemini-3.1-flash-image", prompt: "x", authToken: "SECRET", timeoutMs: 5000 };
    const result = await triggerImageGen(cfg, fetchFn, 5000, fakeEndpoint);
    expect(seenAuth).toBe("Bearer SECRET");
    expect(result.ok).toBe(true);
    expect(result.snapshot!.status).toBe("OK");
    expect(result.baseUrl).toBe("https://cloudcode-pa.googleapis.com/x:generateContent");
  });
});
