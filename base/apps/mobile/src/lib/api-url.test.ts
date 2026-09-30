import { describe, expect, it } from "vitest";

import { requireApiUrl } from "./api-url.js";

describe("requireApiUrl", () => {
  it("rejects an empty value", () => {
    expect(() => requireApiUrl({ value: "  " })).toThrow(
      "EXPO_PUBLIC_API_URL is required"
    );
  });

  it("returns a trimmed URL", () => {
    expect(requireApiUrl({ value: " https://api.basilic.localhost " })).toEqual(
      { url: "https://api.basilic.localhost" }
    );
  });
});
