#!/usr/bin/env node
import { spawn } from "node:child_process";
import http from "node:http";
import { dirname, resolve } from "node:path";

const packageRoot = dirname(import.meta.dirname);
const hopByHop = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export function stripHopByHopHeaders(headers) {
  const out = { ...headers };
  const nominated = new Set();
  for (const [key, value] of Object.entries(out)) {
    if (key.toLowerCase() !== "connection" || value == null) {
      continue;
    }
    const raw = Array.isArray(value) ? value.join(",") : String(value);
    for (const token of raw.split(",")) {
      const name = token.trim().toLowerCase();
      if (name) {
        nominated.add(name);
      }
    }
  }
  for (const key of Object.keys(out)) {
    const lower = key.toLowerCase();
    if (hopByHop.has(lower) || nominated.has(lower)) {
      delete out[key];
    }
  }
  return out;
}

export const eveAgentIds = ["operator", "ask"];

export function evePublicMount({ id }) {
  return `/eve/${id}`;
}

export function mapPublicEvePath({ url }) {
  const parsed = new URL(url, "http://127.0.0.1");
  for (const id of eveAgentIds) {
    const mount = evePublicMount({ id });
    if (parsed.pathname !== mount && !parsed.pathname.startsWith(`${mount}/`)) {
      continue;
    }
    const rest = parsed.pathname.slice(mount.length);
    return { id, path: `/eve${rest}${parsed.search}` };
  }
  return null;
}

export function eveAgentUrl({ origin, id }) {
  return `${String(origin).replace(/\/$/, "")}${evePublicMount({ id })}`;
}

function proxyHeaders({ headers, host }) {
  return { ...stripHopByHopHeaders(headers), host };
}

const defaultInternalPorts = { ask: "3105", operator: "3104" };

export function createWorkspaceProxy({ origins }) {
  return http.createServer((req, res) => {
    const mapped = mapPublicEvePath({ url: req.url ?? "/" });
    if (!mapped || !origins[mapped.id]) {
      res.writeHead(404);
      res.end();
      return;
    }
    const target = new URL(origins[mapped.id]);
    const proxyReq = http.request(
      {
        headers: proxyHeaders({ headers: req.headers, host: target.host }),
        hostname: target.hostname,
        method: req.method,
        path: mapped.path,
        port: target.port,
      },
      (proxyRes) => {
        res.writeHead(
          proxyRes.statusCode ?? 502,
          stripHopByHopHeaders(proxyRes.headers)
        );
        proxyRes.pipe(res);
      }
    );
    proxyReq.on("error", () => {
      if (!res.headersSent) {
        res.writeHead(502);
      }
      res.end();
    });
    req.pipe(proxyReq);
  });
}

function spawnEve({ agentId, port, env }) {
  const childEnv = { ...env, HOST: "127.0.0.1", PORT: String(port) };
  delete childEnv.PORTLESS_URL;
  childEnv.EVE_PUBLIC_ROUTE_PREFIX = evePublicMount({ id: agentId });
  return spawn("pnpm", ["exec", "eve", "dev", "--agent", agentId, "--no-ui"], {
    cwd: packageRoot,
    env: childEnv,
    shell: process.platform === "win32",
    stdio: "inherit",
  });
}

function waitChildExit(child) {
  return new Promise((resolve) => {
    if (child.exitCode != null || child.signalCode != null) {
      return resolve();
    }
    child.once("exit", resolve);
  });
}

export function createIdempotentShutdown(run) {
  let started;
  return () => {
    started ??= Promise.resolve().then(run);
    return started;
  };
}

function isMain() {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return import.meta.filename === resolve(entry);
}

function main({ env = process.env } = {}) {
  const listenPort = env.PORT ?? "3100";
  const origins = {};
  const children = [];
  for (const id of eveAgentIds) {
    const portKey = `EVE_${id.toUpperCase()}_INTERNAL_PORT`;
    const port = env[portKey] ?? defaultInternalPorts[id];
    children.push(spawnEve({ agentId: id, env, port }));
    origins[id] = `http://127.0.0.1:${port}`;
  }
  const server = createWorkspaceProxy({ origins });
  let exitCode = 0;
  let stopping = false;
  const shutdown = createIdempotentShutdown(async () => {
    for (const child of children) {
      if (child.exitCode == null && child.signalCode == null)
        child.kill("SIGTERM");
    }
    await Promise.all([
      new Promise((resolve) => server.close(() => resolve())),
      ...children.map(waitChildExit),
    ]);
  });
  const stop = ({ code } = {}) => {
    if (!stopping && code != null) {
      exitCode = code;
    }
    stopping = true;
    void shutdown().then(() => process.exit(exitCode));
  };
  process.on("SIGINT", () => stop({ code: 130 }));
  process.on("SIGTERM", () => stop({ code: 143 }));
  for (const child of children) {
    child.on("exit", (code, signal) =>
      stop({ code: signal ? 1 : (code ?? 0) })
    );
  }
  server.listen(Number(listenPort), env.HOST ?? "0.0.0.0");
}

if (isMain()) {
  main();
}
