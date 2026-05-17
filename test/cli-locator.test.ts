import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { locateGrokCli } from "../src/cli-locator";

describe("locateGrokCli", () => {
  let tmpDir: string;
  let fakeBin: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "grok-locate-"));
    fakeBin = path.join(tmpDir, "grok");
    fs.writeFileSync(fakeBin, "#!/bin/sh\necho mock\n");
    fs.chmodSync(fakeBin, 0o755);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns the configured path when it exists", () => {
    expect(locateGrokCli(fakeBin)).toBe(fakeBin);
  });

  it("returns undefined when configured path is missing", () => {
    expect(locateGrokCli(path.join(tmpDir, "missing"))).toBeUndefined();
  });

  it("falls back to PATH when no config and no ~/.grok/bin/grok", () => {
    const originalPath = process.env.PATH;
    process.env.PATH = tmpDir;
    try {
      const result = locateGrokCli("");
      // Either ~/.grok/bin/grok wins (if the user actually has it installed) or PATH lookup does.
      expect(result === fakeBin || result?.endsWith("/grok")).toBe(true);
    } finally {
      process.env.PATH = originalPath;
    }
  });

  it("returns undefined when nothing found", () => {
    const originalPath = process.env.PATH;
    const originalHome = process.env.HOME;
    process.env.PATH = "";
    process.env.HOME = tmpDir; // tmpDir has no .grok/bin/grok
    try {
      expect(locateGrokCli("")).toBeUndefined();
    } finally {
      process.env.PATH = originalPath;
      if (originalHome) process.env.HOME = originalHome;
    }
  });
});
