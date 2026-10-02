import assert from "node:assert/strict";
import http from "node:http";
import { test } from "node:test";

import {
  createWorkspaceProxy,
  eveAgentUrl,
  mapPublicEvePath,
  stripHopByHopHeaders,
} from "./dev-workspace.mjs";

test("mapPublicEvePath rewrites Vercel-shaped mounts to /eve/v1", () => {
  assert.deepEqual(mapPublicEvePath({ url: "/eve/operator/v1/health" }), {
    id: "operator",
    path: "/eve/v1/health",
  });
  assert.deepEqual(mapPublicEvePath({ url: "/eve/ask/v1/session?x=1" }), {
    id: "ask",
    path: "/eve/v1/session?x=1",
  });
  assert.equal(mapPublicEvePath({ url: "/eve/command/v1/health" }), null);
  assert.equal(mapPublicEvePath({ url: "/eve/v1/health" }), null);
});

test("eveAgentUrl appends the public mount", () => {
  assert.equal(
    eveAgentUrl({ id: "operator", origin: "https://agents.basilic.localhost" }),
    "https://agents.basilic.localhost/eve/operator"
  );
});

test("workspace proxy forwards public mounts", async () => {
  const operator = http.createServer((_req, res) => {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("operator-ok");
  });
  await new Promise((resolve) => operator.listen(0, "127.0.0.1", resolve));
  const proxy = createWorkspaceProxy({
    origins: { operator: `http://127.0.0.1:${operator.address().port}` },
  });
  await new Promise((resolve) => proxy.listen(0, "127.0.0.1", resolve));
  const { port } = proxy.address();
  const operatorRes = await fetch(
    `http://127.0.0.1:${port}/eve/operator/v1/health`
  );
  const missing = await fetch(`http://127.0.0.1:${port}/eve/ask/v1/health`);
  assert.equal(await operatorRes.text(), "operator-ok");
  assert.equal(missing.status, 404);
  await Promise.all([
    new Promise((resolve) => proxy.close(resolve)),
    new Promise((resolve) => operator.close(resolve)),
  ]);
});

test("stripHopByHopHeaders drops Connection-nominated names", () => {
  assert.deepEqual(
    stripHopByHopHeaders({
      authorization: "Bearer t",
      connection: "close, x-internal",
      "keep-alive": "timeout=5",
      trailer: "x-checksum",
      "x-internal": "secret",
    }),
    { authorization: "Bearer t" }
  );
});

test("proxy strips hop-by-hop headers in both directions", async () => {
  let seen;
  const operator = http.createServer((req, res) => {
    seen = req.headers;
    res.writeHead(200, {
      connection: "close, x-internal",
      "content-type": "text/plain",
      "keep-alive": "timeout=5",
      trailer: "x-checksum",
      "x-internal": "nope",
    });
    res.end("ok");
  });
  await new Promise((resolve) => operator.listen(0, "127.0.0.1", resolve));
  const proxy = createWorkspaceProxy({
    origins: { operator: `http://127.0.0.1:${operator.address().port}` },
  });
  await new Promise((resolve) => proxy.listen(0, "127.0.0.1", resolve));
  const { port } = proxy.address();
  const forwarded = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        headers: {
          authorization: "Bearer t",
          connection: "close, x-internal",
          "x-internal": "secret",
        },
        hostname: "127.0.0.1",
        path: "/eve/operator/v1/health",
        port,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () =>
          resolve({
            body: Buffer.concat(chunks).toString(),
            headers: res.headers,
            status: res.statusCode,
          })
        );
      }
    );
    req.on("error", reject);
    req.end();
  });
  assert.equal(forwarded.body, "ok");
  assert.equal(seen.authorization, "Bearer t");
  assert.equal(seen["x-internal"], undefined);
  assert.equal(forwarded.headers["x-internal"], undefined);
  assert.equal(forwarded.headers["keep-alive"], undefined);
  assert.equal(forwarded.headers.trailer, undefined);
  await Promise.all([
    new Promise((resolve) => proxy.close(resolve)),
    new Promise((resolve) => operator.close(resolve)),
  ]);
});
