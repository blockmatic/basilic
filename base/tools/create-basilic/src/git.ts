import { spawnSync } from "node:child_process";
import { relative, resolve } from "node:path";

function workspaceGit({ repoRoot }: { repoRoot: string }) {
  const top = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (top.status !== 0) {
    throw new Error(top.stderr || "git rev-parse failed");
  }
  const toplevel = resolve(top.stdout.trim());
  const root = resolve(repoRoot);
  if (toplevel === root) return { prefix: "", toplevel };
  const prefix = relative(toplevel, root).split("\\").join("/");
  if (!prefix || prefix.startsWith("..")) {
    throw new Error("repoRoot is outside the git worktree");
  }
  return { prefix, toplevel };
}

function stripPrefix({ path, prefix }: { path: string; prefix: string }) {
  if (!prefix) return path;
  return path.startsWith(`${prefix}/`) ? path.slice(prefix.length + 1) : path;
}

export function listTrackedFiles({ repoRoot }: { repoRoot: string }) {
  const { prefix, toplevel } = workspaceGit({ repoRoot });
  const args = prefix ? ["ls-files", "-z", "--", prefix] : ["ls-files", "-z"];
  return gitZeroFiles({ args, repoRoot: toplevel }).map((path) =>
    stripPrefix({ path, prefix })
  );
}

export function listUntrackedFiles({ repoRoot }: { repoRoot: string }) {
  const { prefix, toplevel } = workspaceGit({ repoRoot });
  const args = prefix
    ? ["ls-files", "--others", "--exclude-standard", "-z", "--", prefix]
    : ["ls-files", "--others", "--exclude-standard", "-z"];
  return gitZeroFiles({ args, repoRoot: toplevel }).map((path) =>
    stripPrefix({ path, prefix })
  );
}

function gitZeroFiles({
  repoRoot,
  args,
}: {
  repoRoot: string;
  args: string[];
}) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "buffer",
    maxBuffer: 50 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr.toString("utf8") || `git ${args[0]} failed`);
  }
  return result.stdout.toString("utf-8").split("\0").filter(Boolean);
}

export function gitHeadSha({ repoRoot }: { repoRoot: string }) {
  const result = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf-8",
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || "git rev-parse failed");
  }
  return result.stdout.trim();
}

export function assertCleanWorktree({ repoRoot }: { repoRoot: string }) {
  const { prefix, toplevel } = workspaceGit({ repoRoot });
  const args = prefix
    ? ["status", "--porcelain", "--", prefix]
    : ["status", "--porcelain"];
  const result = spawnSync("git", args, {
    cwd: toplevel,
    encoding: "utf-8",
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || "git status failed");
  }
  if (result.stdout.trim()) {
    throw new Error(
      "Refusing to assemble from a dirty worktree. Commit or stash first."
    );
  }
}

export function extractHeadArchive({
  repoRoot,
  dest,
}: {
  repoRoot: string;
  dest: string;
}) {
  const { prefix, toplevel } = workspaceGit({ repoRoot });
  const tree = prefix ? `HEAD:${prefix}` : "HEAD";
  const archive = spawnSync("git", ["archive", "--format=tar", tree], {
    cwd: toplevel,
    maxBuffer: 200 * 1024 * 1024,
  });
  if (archive.status !== 0) {
    throw new Error(archive.stderr.toString("utf8") || "git archive failed");
  }
  const extract = spawnSync("tar", ["-xf", "-", "-C", dest], {
    input: archive.stdout,
    maxBuffer: 200 * 1024 * 1024,
  });
  if (extract.status !== 0) {
    throw new Error(extract.stderr.toString("utf8") || "tar extract failed");
  }
}
