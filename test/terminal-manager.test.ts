import { describe, it, expect } from "vitest";
import { TerminalManager } from "../src/terminal-manager";

describe("TerminalManager", () => {
  it("captures stdout from a quick command", async () => {
    const m = new TerminalManager();
    const { terminalId } = m.create({ command: "echo HELLO_TM" });
    const { exitCode } = await m.waitForExit(terminalId);
    expect(exitCode).toBe(0);
    const r = m.output(terminalId);
    expect(r.output).toContain("HELLO_TM");
    expect(r.exitStatus).toEqual({ exitCode: 0 });
    expect(r.truncated).toBe(false);
    m.release(terminalId);
  });

  it("captures stderr and nonzero exit", async () => {
    const m = new TerminalManager();
    const { terminalId } = m.create({ command: "echo ERR 1>&2; exit 7" });
    const r = await m.waitForExit(terminalId);
    expect(r.exitCode).toBe(7);
    const out = m.output(terminalId);
    expect(out.output).toContain("ERR");
    m.release(terminalId);
  });

  it("respects outputByteLimit and sets truncated flag", async () => {
    const m = new TerminalManager();
    // produce 5KB of "a"s with a small byte limit
    const { terminalId } = m.create({
      command: "awk 'BEGIN{for(i=0;i<5000;i++)printf \"a\"}'",
      outputByteLimit: 100,
    });
    await m.waitForExit(terminalId);
    const r = m.output(terminalId);
    expect(r.output.length).toBeLessThanOrEqual(100);
    expect(r.truncated).toBe(true);
    m.release(terminalId);
  });

  it("returns exitStatus null while still running", () => {
    const m = new TerminalManager();
    const { terminalId } = m.create({ command: "sleep 1" });
    const r = m.output(terminalId);
    expect(r.exitStatus).toBeNull();
    m.kill(terminalId);
    m.release(terminalId);
  });

  it("injects env from {name,value} pairs", async () => {
    const m = new TerminalManager();
    const { terminalId } = m.create({
      command: "echo $GROK_TEST_VAR",
      env: [{ name: "GROK_TEST_VAR", value: "INJECTED" }],
    });
    await m.waitForExit(terminalId);
    expect(m.output(terminalId).output).toContain("INJECTED");
    m.release(terminalId);
  });

  it("honors cwd", async () => {
    const m = new TerminalManager();
    const { terminalId } = m.create({ command: "pwd", cwd: "/tmp" });
    await m.waitForExit(terminalId);
    expect(m.output(terminalId).output.trim()).toBe("/tmp");
    m.release(terminalId);
  });

  it("waitForExit resolves immediately if already exited", async () => {
    const m = new TerminalManager();
    const { terminalId } = m.create({ command: "true" });
    await m.waitForExit(terminalId);
    const r = await m.waitForExit(terminalId); // second call
    expect(r.exitCode).toBe(0);
    m.release(terminalId);
  });

  it("output() throws on unknown terminalId", () => {
    const m = new TerminalManager();
    expect(() => m.output("nope")).toThrowError(/unknown terminalId/);
  });

  it("kill+release on a missing id is a no-op", () => {
    const m = new TerminalManager();
    expect(() => m.kill("nope")).not.toThrow();
    expect(() => m.release("nope")).not.toThrow();
  });

  it("disposeAll kills outstanding terminals", () => {
    const m = new TerminalManager();
    const { terminalId } = m.create({ command: "sleep 60" });
    m.disposeAll();
    expect(() => m.output(terminalId)).toThrow();
  });
});
