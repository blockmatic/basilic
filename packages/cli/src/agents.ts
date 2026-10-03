import {
  AgentError,
  createAgentsClient,
  type AgentProblem,
  type AgentRecord,
} from "@repo/core/agents";
import type { Command } from "commander";

type Output = { json?: boolean; jsonl?: boolean; stream?: boolean };

const writeLine = ({ value }: { value: unknown }) => {
  process.stdout.write(`${JSON.stringify(value)}\n`);
};

function exitWithProblem({
  problem,
  json,
}: {
  problem: AgentProblem;
  json?: boolean;
}): never {
  if (json) process.stderr.write(`${JSON.stringify({ error: problem })}\n`);
  else
    process.stderr.write(
      `${[
        `Error [${problem.code}]: ${problem.message}`,
        problem.resolution && `Resolution: ${problem.resolution}`,
        problem.traceId && `Trace: ${problem.traceId}`,
      ]
        .filter(Boolean)
        .join("\n")}\n`
    );
  process.exit(1);
}

function describeAgent({ agent }: { agent: AgentRecord }) {
  return [
    `${agent.id} — ${agent.name}`,
    agent.description,
    `output: ${agent.outputMode}  streaming: ${agent.streaming}  auth: ${agent.auth}`,
    `capabilities: ${agent.capabilities.join(", ")}`,
    agent.delegatesTo &&
      `delegates to (private): ${agent.delegatesTo.join(", ")}`,
    `endpoint: ${agent.endpoint}`,
    `docs: ${agent.docs}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function run<T>({
  json,
  task,
}: {
  json?: boolean;
  task: () => Promise<T>;
}): Promise<T> {
  try {
    return await task();
  } catch (error) {
    if (error instanceof AgentError)
      exitWithProblem({ json, problem: error.problem });
    throw error;
  }
}

export function registerAgentCommands({
  program,
  getApiKey,
  getBaseUrl,
}: {
  program: Command;
  getApiKey: () => Promise<string>;
  getBaseUrl: (cmd: Command) => string;
}) {
  const clientFor = (cmd: Command) =>
    createAgentsClient({
      baseUrl: getBaseUrl(cmd),
      getCredential: getApiKey,
    });

  const agents = program
    .command("agents")
    .description(
      "Discover and invoke public agents. The API key is exchanged for a short-lived agent token; eve never sees the key."
    );

  agents
    .command("list")
    .description("List public agents (GET /agents)")
    .option("--json", "print JSON")
    .action(async function (this: Command, { json }: Output) {
      const rows = await run({ json, task: () => clientFor(this).list() });
      if (json) writeLine({ value: rows });
      else
        for (const agent of rows)
          process.stdout.write(
            `${agent.id}\t${agent.outputMode}\t${agent.description}\n`
          );
    });

  agents
    .command("describe <agentId>")
    .description("Describe one public agent (GET /agents/:agentId)")
    .option("--json", "print JSON")
    .action(async function (this: Command, agentId: string, { json }: Output) {
      const agent = await run({
        json,
        task: () => clientFor(this).get({ agentId }),
      });
      if (json) writeLine({ value: agent });
      else process.stdout.write(`${describeAgent({ agent })}\n`);
    });

  agents
    .command("invoke <agentId> <message>")
    .description(
      "Send one message to a public agent and wait for the reply. Use --stream --jsonl for one JSON event per line."
    )
    .option("--json", "print the final result as JSON")
    .option("--stream", "print events as they arrive")
    .option("--jsonl", "with --stream, print one JSON event per line")
    .option("--timeout <ms>", "abort after this many milliseconds", "120000")
    .action(async function (
      this: Command,
      agentId: string,
      message: string,
      { json, jsonl, stream, timeout }: Output & { timeout: string }
    ) {
      const timeoutMs = Number.parseInt(timeout, 10);
      if (!Number.isFinite(timeoutMs) || timeoutMs <= 0)
        exitWithProblem({
          json: json || jsonl,
          problem: {
            code: "INVALID_TIMEOUT",
            message: `--timeout must be a positive integer, got "${timeout}"`,
            retryable: false,
          },
        });
      if (jsonl && !stream)
        exitWithProblem({
          json: true,
          problem: {
            code: "INVALID_FLAGS",
            message: "--jsonl requires --stream",
            resolution: "Pass --stream --jsonl, or --json for a single result.",
            retryable: false,
          },
        });
      const controller = new AbortController();
      process.once("SIGINT", () => controller.abort());
      const events = clientFor(this).stream({
        agentId,
        message,
        signal: controller.signal,
        timeoutMs,
      });
      for await (const event of events) {
        if (stream && jsonl) writeLine({ value: event });
        if (event.type === "error")
          return stream && jsonl
            ? process.exit(1)
            : exitWithProblem({ json, problem: event.error });
        if (stream && !jsonl && event.type === "text")
          process.stdout.write(event.delta);
        if (stream && !jsonl && event.type === "delegation")
          process.stderr.write(`[${event.agent} ${event.phase}]\n`);
        if (event.type !== "result") continue;
        if (json) writeLine({ value: event });
        else if (!stream) process.stdout.write(`${event.text}\n`);
        else if (!jsonl) process.stdout.write("\n");
      }
    });
}
