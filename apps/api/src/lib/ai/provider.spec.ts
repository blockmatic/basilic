import { afterEach, describe, expect, it, vi } from "vitest";

import {
  defaultGatewayModel,
  isAllowedRequestModel,
  resolveGatewayModel,
  upgradeSonnetGatewayModel,
} from "./provider.js";

describe("AI provider model resolution", () => {
  it("defaults to Haiku when model is omitted", () => {
    expect(resolveGatewayModel()).toBe("claude-haiku-4-5");
    expect(defaultGatewayModel).toBe("anthropic/claude-haiku-4.5");
  });

  it("maps sonnet alias to Sonnet 4.6", () => {
    expect(resolveGatewayModel("sonnet")).toBe("claude-sonnet-4-6");
    expect(upgradeSonnetGatewayModel).toBe("anthropic/claude-sonnet-4.6");
  });

  it("honors defaultModel override for the haiku alias", () => {
    expect(
      resolveGatewayModel("haiku", {
        defaultModel: "claude-sonnet-4-6",
      })
    ).toBe("claude-sonnet-4-6");
    expect(
      resolveGatewayModel("sonnet", { defaultModel: "x-ai/grok-3-mini" })
    ).toBe("claude-sonnet-4-6");
  });
});

describe("isAllowedRequestModel", () => {
  it("allows omitted, default, haiku, sonnet, and Gateway ids", () => {
    expect(isAllowedRequestModel({})).toBe(true);
    expect(isAllowedRequestModel({ model: "default" })).toBe(true);
    expect(isAllowedRequestModel({ model: "haiku" })).toBe(true);
    expect(isAllowedRequestModel({ model: "sonnet" })).toBe(true);
    expect(isAllowedRequestModel({ model: defaultGatewayModel })).toBe(true);
    expect(isAllowedRequestModel({ model: upgradeSonnetGatewayModel })).toBe(
      true
    );
  });

  it("rejects opus and unknown ids", () => {
    expect(isAllowedRequestModel({ model: "opus" })).toBe(false);
    expect(isAllowedRequestModel({ model: "gpt-4" })).toBe(false);
    expect(isAllowedRequestModel({ model: "qwen3:8b" })).toBe(false);
  });

  it("allows direct Anthropic model ids", () => {
    expect(isAllowedRequestModel({ model: "claude-haiku-4-5" })).toBe(true);
  });
});

describe("getResolvedProvider", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("../env.js");
  });

  it("returns null when Anthropic credentials are unset", async () => {
    vi.resetModules();
    vi.doMock("../env.js", () => ({
      env: {
        // biome-ignore lint/style/useNamingConvention: mocked env keys match createEnv
        ANTHROPIC_API_KEY: undefined,
        // biome-ignore lint/style/useNamingConvention: mocked env keys match createEnv
        AI_DEFAULT_MODEL: undefined,
      },
    }));
    const { getResolvedProvider } = await import("./provider.js");
    expect(getResolvedProvider()).toBeNull();
  });
});
