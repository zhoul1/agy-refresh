import { describe, it, expect } from "bun:test";
import { extractArg, scoreCandidate } from "../src/lib/agy-process";

describe("extractArg", () => {
  const cmd = `"c:\\tools\\language_server.exe" --csrf_token 76ed0b24-e185-43b5-9e00-ca4c6b7faf79 --extension_server_port 49790 --cloud_code_endpoint https://cloudcode-pa.googleapis.com`;

  it("should extract --csrf_token with = format", () => {
    expect(extractArg(cmd, "--csrf_token")).toBe("76ed0b24-e185-43b5-9e00-ca4c6b7faf79");
  });

  it("should extract --extension_server_port with space format", () => {
    // This command has --csrf_token in space format, not = format
    // Let me construct one that uses space format
    const cmd2 = `language_server.exe --csrf_token abc123 --extension_server_port 49790`;
    expect(extractArg(cmd2, "--extension_server_port")).toBe("49790");
  });

  it("should extract --extension_server_port with = format", () => {
    const cmd2 = `language_server.exe --extension_server_port=51796 --other args`;
    expect(extractArg(cmd2, "--extension_server_port")).toBe("51796");
  });

  it("should return null for missing argument", () => {
    expect(extractArg("language_server.exe --other args", "--csrf_token")).toBeNull();
  });

  it("should handle quoted values", () => {
    const cmd2 = `server --csrf_token="token with spaces" --flag value`;
    expect(extractArg(cmd2, "--csrf_token")).toBe("token with spaces");
  });

  it("should return null for empty string", () => {
    expect(extractArg("", "--csrf_token")).toBeNull();
  });
});

describe("scoreCandidate", () => {
  it("should give 0 for no port and no csrf", () => {
    expect(scoreCandidate({ pid: 100 })).toBe(0);
  });

  it("should give 10 for port", () => {
    expect(scoreCandidate({ pid: 100, port: 5000 })).toBe(10);
  });

  it("should give 20 for csrfToken", () => {
    expect(scoreCandidate({ pid: 100, csrfToken: "abc" })).toBe(20);
  });

  it("should give 30 for both port and csrfToken", () => {
    expect(scoreCandidate({ pid: 100, port: 5000, csrfToken: "abc" })).toBe(30);
  });
});
