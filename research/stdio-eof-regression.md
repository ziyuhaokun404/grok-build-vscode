# `grok agent stdio` Windows regression — stdin not read until EOF (issue #22)

**Status:** confirmed upstream Grok CLI regression. First broken build **0.2.61**; last
working build **0.2.60**. Reproduced on **0.2.64** (native Windows). Tracked in
extension issue [#22](https://github.com/phuryn/grok-build-vscode/issues/22).

## Symptom

On Grok CLI **0.2.61–0.2.64** on **Windows**, the extension can't start a session:

```
spawning C:\Users\<user>\.grok\bin\grok.exe agent --reasoning-effort xhigh stdio (cwd=…)
grok exited with code null
Failed to start Grok: ACP request timed out: initialize
```

Downgrading to **0.2.60** (`grok update --version 0.2.60`) fixes it immediately.

## Root cause

`grok agent stdio` **does not read its first line of stdin until stdin reaches
EOF.** A live ACP client must keep stdin open (the protocol is bidirectional
JSON-RPC over stdin/stdout — exactly as the grok README's own stdio examples show,
with `stdin.write(...)` + `drain()` and the pipe held open). So the `initialize`
request is never read, the handshake times out after 120s, and the host tears the
process down — which surfaces as `exit code null` (SIGTERM), matching the report.

This contradicts grok's own documented stdio transport contract (README §
"stdio Transport"), where the agent is expected to process newline-delimited
JSON-RPC messages as they arrive.

## Reproduction (Windows, Node)

Spawn `grok agent stdio` the way any ACP client does — pipes for stdin/stdout,
stdin held open — then send `initialize`:

| Variant | stdin after writing `initialize` | Result |
|---|---|---|
| A | left **open** (real client behavior) | no response; `initialize` never read; on teardown `exit code=null sig=SIGTERM` |
| B | **closed** (`stdin.end()`) right after the write | full `initialize` response, clean `exit code=0` |
| C | left open, then 16 KB of padding written | no response (rules out fixed-size read buffering) |
| D | `shell:true`, extra newlines, a 2nd request | no response |

Only **EOF** unblocks the read. Padding to 16 KB does not, so it's not a
fixed-buffer-fill issue — the read is gated on stream close.

### Decisive evidence — grok's own `--debug-file`

With stdin **open** (failing), grok's debug log boots fully but stops at:

```
… Relay sync: DISABLED (not in TUI mode)
```

…and never reads the request. With stdin **closed** (working), the same log
continues *past* that point:

```
… Relay sync: DISABLED (not in TUI mode)
… plugins::discovery: plugin discovered …
… mvp_agent: code-nav capability initialized from initialize request …   ← the request was finally read
… session::storage::search: session search bootstrap complete …
… timing name="startup.stdio_agent_total" …
```

So the agent is fully initialized and merely **blocked on the stdin read** until
the stream closes.

## Ruled out

- **Arguments** — `grok agent --reasoning-effort xhigh stdio` parses fine on 0.2.64
  (`--help` confirms the flag and the `stdio` subcommand are unchanged).
- **Leader process** (new in this line) — debug log shows
  `leader mode resolved use_leader=false`; no `agent.exe` child is spawned.
- **Working directory** (C: vs the reporter's D: drive) — fails identically from C:.
- **Shell wrapping** (`shell:true`) — no change.

The reason a quick `printf '…' | grok agent stdio` *looks* fine from a shell is that
the pipe closes after the line (EOF), which is the one thing that unblocks the read.
Any persistent client hangs.

## Extension mitigation (shipped)

The extension can't make grok read stdin, so until xAI ships a fix it **auto-pins
the CLI to the last working build**: before spawning, it reads `grok --version`,
and if the build is in the broken Windows range (`isStdioBrokenGrokVersion`,
[src/cli-locator.ts](../src/cli-locator.ts)), it runs
`grok update --version 0.2.60` ([src/sidebar.ts](../src/sidebar.ts)
`maybePinBrokenCli`). The range upper bound is closed at 0.2.64 so a future fixed
release isn't needlessly downgraded — **remove or widen this guard once a fix is
verified.**

---

## Report for xAI (copy-paste)

> **Title:** `grok agent stdio` on Windows hangs — first stdin line not read until EOF (regression in 0.2.61, worked in 0.2.60)
>
> **Summary:** On Windows, `grok agent stdio` does not read its first stdin line
> until stdin is closed (EOF). A persistent ACP/JSON-RPC client (which must keep
> stdin open) therefore never gets an `initialize` response; the handshake hangs
> indefinitely. Closing stdin immediately after writing `initialize` returns a
> correct response, proving the agent boots fine and only the stdin read is
> blocked. Padding the write to 16 KB does not unblock it, so it is not
> fixed-buffer-fill — the read is gated on stream EOF.
>
> **Environment:** Windows 11; native build `grok 0.2.64 (stable)` (also 0.2.61–0.2.63). Last working: `0.2.60`.
>
> **Repro:**
> 1. Spawn `grok agent stdio` with pipes for stdin/stdout (not a TTY).
> 2. Write one line: `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":1,"clientCapabilities":{"fs":{"readTextFile":true,"writeTextFile":true},"terminal":true}}}\n`
> 3. **Keep stdin open** → no response (hang). **Close stdin** → correct `initialize` response.
>
> **Evidence:** With `--debug-file`, the failing (stdin-open) run stops at
> `Relay sync: DISABLED (not in TUI mode)` and never logs reading the request;
> the working (stdin-closed) run continues to
> `code-nav capability initialized from initialize request` and
> `startup.stdio_agent_total`.
>
> **Impact:** Breaks every persistent stdio/ACP integration on Windows
> (e.g. editor extensions). `printf … | grok agent stdio` masks it because the
> pipe closes (EOF).
>
> **Likely area:** Windows async stdin read in the `agent stdio` path between
> 0.2.60 and 0.2.61 (per-line read appears to wait for stream close).
