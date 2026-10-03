import { describe, expect, it } from "vitest";

import { getOrCreateSession } from "../../../test/utils/auth-helper.js";
import { fastify } from "./agents.spec.js";

describe("GET /agents", () => {
  it("lists public agents without a Bearer token", async () => {
    const response = await fastify.inject({ method: "GET", url: "/agents" });
    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      id: string;
      transport: string;
      endpoint: string;
    }[];
    expect(body.map((row) => row.id)).toEqual(["operator", "ask"]);
    expect(body.every((row) => row.transport === "eve")).toBe(true);
    expect(body.every((row) => /^https?:\/\//.test(row.endpoint))).toBe(true);
    expect(body.some((row) => row.id === "system")).toBe(false);
  });

  it("lists the same public agents with a session", async () => {
    const jwt = await getOrCreateSession(fastify, "agents-list@test.ai");
    const response = await fastify.inject({
      headers: { Authorization: `Bearer ${jwt}` },
      method: "GET",
      url: "/agents",
    });
    expect(response.statusCode).toBe(200);
    const body = response.json() as { id: string }[];
    expect(body.map((row) => row.id)).toEqual(["operator", "ask"]);
  });
});
