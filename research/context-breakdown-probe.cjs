#!/usr/bin/env node
// Probe: does `/context` return a categorical breakdown over ACP, or is it
// still TUI-only? Also captures `/session-info` prose for the Context line the
// extension already scrapes (parseSessionInfoContext).
//
// Background: the CLI TUI's /context shows system prompt / messages /
// reasoning / free + skills listing / tool definitions / MCP estimates
// (~/.grok/docs/user-guide/04-slash-commands.md). grok-build-vscode hid
// /context from autocomplete because ACP streamed nothing (docs/ACP-feedback.md
// §2.2). The experimental top-of-session context card therefore estimates
// categories client-side (src/context-breakdown.ts).
//
// Run:  node research/context-breakdown-probe.cjs   (needs a logged-in grok)
// Env:  GROK_BIN=…
//
// PASS criteria (informational — always exits 0 with a report):
//   - /session-info streams a **Context:** N / M line
//   - /context either streams a breakdown (NEW capability → integrate) or
//     stays empty (status quo → keep estimates)

const { spawn } = require("node:child_process");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");

const TIMEOUT_MS = 90_000;

function grokBin() {
  if (process.env.GROK_BIN) return process.env.GROK_BIN;
  const home = process.env.USERPROFILE || process.env.HOME || os.homedir();
  for (const name of ["grok.exe", "grok.cmd", "grok"]) {
    const p = path.join(home, ".grok", "bin", name);
    if (fs.existsSync(p)) return p;
  }
  return "grok";
}

const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "grok-ctx-breakdown-"));
fs.writeFileSync(path.join(cwd, "README.md"), "# context breakdown probe\n");
const proc = spawn(grokBin(), ["agent", "stdio"], {
  cwd,
  env: process.env,
  shell: process.platform === "win32",
});

let buf = "";
let nextId = 1;
let sessionId = "";
const waiters = new Map();
let agentText = "";
let thoughtChars = 0;

const timer = setTimeout(() => {
  console.log("TIMEOUT");
  finish(2);
}, TIMEOUT_MS);

function finish(code) {
  clearTimeout(timer);
  try {
    proc.kill();
  } catch {
    /* ignore */
  }
  try {
    fs.rmSync(cwd, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
  process.exit(code);
}

function write(obj) {
  proc.stdin.write(JSON.stringify(obj) + "\n");
}
function send(method, params) {
  const id = nextId++;
  write({ jsonrpc: "2.0", id, method, params });
  return new Promise((res) => waiters.set(id, res));
}

proc.stdout.on("data", (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    if (msg.id != null && waiters.has(msg.id)) {
      waiters.get(msg.id)(msg);
      waiters.delete(msg.id);
    }
    if (msg.method === "session/update") {
      const u = msg.params?.update;
      if (u?.sessionUpdate === "agent_message_chunk" && u?.content?.text) {
        agentText += u.content.text;
      }
      if (u?.sessionUpdate === "agent_thought_chunk" && u?.content?.text) {
        thoughtChars += u.content.text.length;
      }
    }
  }
});
proc.stderr.on("data", (d) => process.stderr.write(d));

function summarizeMeta(result) {
  const m = result?.result?._meta ?? result?.result ?? {};
  return {
    totalTokens: m.totalTokens,
    modelId: m.modelId,
    inputTokens: m.inputTokens,
    outputTokens: m.outputTokens,
  };
}

(async () => {
  console.log("bin:", grokBin());
  console.log("cwd:", cwd);

  await send("initialize", {
    protocolVersion: 1,
    clientCapabilities: {
      fs: { readTextFile: true, writeTextFile: true },
      terminal: true,
    },
    clientInfo: { name: "context-breakdown-probe", version: "0" },
  });
  write({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });

  const ns = await send("session/new", { cwd, mcpServers: [] });
  sessionId =
    ns.result?.sessionId || ns.result?.session?.sessionId || "";
  console.log("session:", sessionId);

  // --- /session-info ---
  agentText = "";
  thoughtChars = 0;
  const r1 = await send("session/prompt", {
    sessionId,
    prompt: [{ type: "text", text: "/session-info" }],
  });
  const infoText = agentText;
  const infoMeta = summarizeMeta(r1);
  console.log("\n=== /session-info ===");
  console.log("reply length:", infoText.length, "thought chars:", thoughtChars);
  console.log(infoText || "(empty)");
  console.log("meta:", JSON.stringify(infoMeta));

  const ctxLine =
    /context:\*{0,2}\s*([\d][\d,]*)\s*\/\s*([\d][\d,]*)\s*tokens/i.exec(infoText);
  if (ctxLine) {
    console.log(
      "PARSED Context:",
      Number(ctxLine[1].replace(/,/g, "")),
      "/",
      Number(ctxLine[2].replace(/,/g, "")),
    );
  } else {
    console.log("PARSED Context: (none — parseSessionInfoContext would return null)");
  }

  // --- /context ---
  agentText = "";
  thoughtChars = 0;
  const r2 = await send("session/prompt", {
    sessionId,
    prompt: [{ type: "text", text: "/context" }],
  });
  const ctxText = agentText;
  const ctxMeta = summarizeMeta(r2);
  console.log("\n=== /context ===");
  console.log("reply length:", ctxText.length, "thought chars:", thoughtChars);
  console.log(ctxText || "(empty)");
  console.log("meta:", JSON.stringify(ctxMeta));

  const looksLikeBreakdown =
    /system\s*prompt|skills\s*list|tool\s*def|messages|free/i.test(ctxText);

  console.log("\n=== verdict ===");
  if (ctxText.length === 0) {
    console.log(
      "STATUS: /context still empty over ACP (TUI-only). Keep client-side estimates.",
    );
  } else if (looksLikeBreakdown) {
    console.log(
      "STATUS: /context returned breakdown-like text — integrate a parser and prefer it over estimates.",
    );
  } else {
    console.log(
      "STATUS: /context returned text but no known category labels — inspect and adapt parser.",
    );
  }

  finish(0);
})().catch((e) => {
  console.error(e);
  finish(1);
});
