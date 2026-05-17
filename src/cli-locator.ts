import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { homedir } from "node:os";
import * as path from "node:path";

export function locateGrokCli(configuredPath: string): string | undefined {
  if (configuredPath) {
    return existsSync(configuredPath) ? configuredPath : undefined;
  }
  const candidate = path.join(homedir(), ".grok", "bin", "grok");
  if (existsSync(candidate)) return candidate;
  try {
    const onPath = execSync("command -v grok", { encoding: "utf8" }).trim();
    if (onPath && existsSync(onPath)) return onPath;
  } catch {
    // ignore
  }
  return undefined;
}
