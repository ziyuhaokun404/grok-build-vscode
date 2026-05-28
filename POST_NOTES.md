# Post notes — "Shipping a VS Code extension as a PM without coding"

Notes for the copywriting Claude. Drawn from the actual build session of `grok-build-vscode` v1.2.0 (Plan mode work, ~178 tests, multi-agent setup). Builder-teacher angle.

---

## Possible hooks / angles

- "I'm a PM. I shipped a VS Code extension to the Marketplace without writing code. Here's what I actually had to get good at." (process / craft angle — the meta-skill)
- "PMs reading code matters less than PMs writing the right prompts." (the work shifts upstream)
- "I don't ship code; I ship tests, docs, and constraints." (what the PM artifact actually IS in agent-led dev)

---

## Where the PM started

- Already had **v1.0.5** in the Marketplace, written by previous AI iterations
- Plan mode was **disabled** in 1.1.0 because of an upstream CLI bug (`exit_plan_mode` in grok 0.2.x treats any response as approval — can't reject a plan at the protocol layer)
- ~143 tests passing, all grok-free, but Plan mode was the headline gap
- Goal of this iteration: get Plan mode actually working *despite* the upstream bug, without waiting on xAI to fix it
- Wasn't starting from zero — was iterating on a thin-client architecture (the extension is a UI shell, all real work lives in the `grok` CLI subprocess)

---

## Prompt types that worked (and why)

Worth structuring this section as a typology — each type had a different job:

1. **Symptom reporting with screenshots.** "Blue circles in effort settings are too small compared to empty ones" + screenshot. The model can't see your screen; a sentence + image collapses 10 rounds of guessing into one. Worked best for visual / UI bugs.

2. **Reproducible test sequences.** "I did REJECT → REJECT MSG → CANCEL, see REJECT → CANCEL → REJECT MSG." The PM specifying their exact actions and expected vs actual outcome is the highest-signal bug report. Beats "it's broken" by a mile.

3. **Architecture "should we" questions.** "Should we keep CI light?" "How does the agent know we cancelled?" "Will Grok understand the history on restore?" — these forced the model (me) to surface trade-offs and assumptions the PM might not have caught otherwise. Don't just ask for code; ask for *reasoning*.

4. **Honest pushback — the concrete moment.** I confidently told the PM that `npm run publish` would work locally because CLAUDE.md said "the publisher is already registered and authenticated locally." The PM came back with: *"are you sure we can publish from command line? I've been publishing manually by uploading vsix via marketplace website."* That one question collapsed the false confidence — I'd been repeating a claim from an existing doc without verifying it. The PM had been publishing via the web UI the whole time, which means `vsce login` had never been run, which means my "just run `npm run publish`" advice would have failed at the first attempt. I corrected the docs, acknowledged the mistake plainly, and we moved on. The lesson for the post: **models confidently repeat plausible-sounding claims from their own context, and PMs need to challenge — even (especially) when the model sounds sure.** Pushback isn't friction; it's quality control. Worth using as a specific, named anecdote in the piece — readers respect when the writer shows their AI being wrong and getting corrected. That's the working relationship, not a bug in it.

5. **Open-ended exploratory prompts.** "How about we simulate ACP/grok? would it make sense or would it be over-engineering?" — invites the model to give a *recommendation with trade-offs*, not just execute. Critical for architectural decisions.

---

## Approach to tests

This is probably the meatiest section for a PM audience. The lesson is: **tests are how a non-coding PM verifies the agent did what it said.**

- **Test pyramid emerged organically, not by design.** Started with pure unit tests (logic split into `plan-gate.ts`, `plan-restore.ts`, etc. specifically so they have no `vscode` import and run in node). Added happy-dom DOM tests that drive the *real* `media/chat.js` for the webview. Added fake-CLI integration tests that spawn a ~150-line fake `grok agent stdio` and drive the real `AcpClient` against it over JSON-RPC stdio.
- **Each tier catches different bugs.** Pure tests catch logic regressions. DOM tests catch rendering / event-wiring regressions. Integration tests catch the wire-protocol stuff. The bugs that bit hardest in manual testing were the ones *between* tiers — e.g. the sidebar's counter not stepping when an `afterTurn` posted a user bubble. Worth calling out: **tests + manual smoke is the actual quality bar, not tests alone.**
- **Comprehensive ≠ over-engineered.** When asking "should we add a full grok simulator," I pushed back: a full simulator becomes partially tautological (you're testing your understanding of grok, encoded twice). The narrow version (~150 lines, 6 tests for the specific protocol behaviors that bit us) was the right call. Lesson: pick scope by which *specific past bugs* the test would have caught.
- **Refactor for testability beats mocking for testability.** When sidebar logic was hard to test (because it imported `vscode` everywhere), the move was to *extract* the pure decision into a new module (`plan-restore.ts`) and test that. Not "mock vscode." Mocking is a maintenance tax; extraction is permanent simplification.

### Concrete examples worth using in the post:

- The "Reject > Cancel > Reject Msg" ordering bug — saved with the same `afterUserMessage` because a follow-up prompt's user bubble didn't increment the counter. Manual testing caught it; tests didn't because the gap was between persist and render. **PMs find these because they actually use the thing.**
- The "(empty plan)" bug — `lastPlanText` was being cleared before persist. A pure module test (text-preservation case) was added specifically to lock that regression out.
- The Cancel-restores-into-Plan-mode bug — the CLI replays its own `current_mode_update` events on `session/load`, which raised the gate even when the user had cancelled. Fix: explicit override after replay. Test: a 4-line scenario in `plan-restore.test.ts` ("user rejects then cancels → Agent mode").

---

## Documenting the work

The PM had to maintain four docs in lockstep:

| File | Audience | What's in it |
|---|---|---|
| `CLAUDE.md` | The AI (and future AIs) | Status, module map, repo conventions, "version bumps are user-initiated" |
| `README.md` | Marketplace users + GitHub visitors | Install, key concepts, configuration, commands |
| `TESTS.md` | Anyone adding tests | Test design, what's covered, what's deferred |
| `changelog.md` | Release readers | Per-version "what changed and why" |

**Key learnings worth highlighting:**

- **The CLAUDE.md is operational, not aspirational.** Lines like "version bumps are user-initiated" actually changed model behavior. I (the agent) read it every turn and obeyed it. The PM was effectively writing executable policy.
- **Changelog entries are written *during* iteration, not after.** The v1.2.0 entry got rewritten three times as scope grew (Approve/Keep planning → Approve/Reject/Cancel; 143 → 172 → 178 tests). Marked it `(unreleased)` until publish. PMs need to be comfortable rewriting their own history docs.
- **Stale counts are toxic.** "143 tests" appeared in 6 places when the actual count was 178. Every doc edit had to ripple through all of them. Lesson: either generate from a single source (later), or `grep` for the old count every time you bump it.
- **Don't trust the agent's claim that docs are updated.** Verify by `grep`-ing for the old numbers. Multiple times I said "docs updated" and the PM asked "did you actually...?"

---

## CI vs local tests

This was a real architectural question, not a checkbox.

- **CI runs everything in `test/*.test.ts` — 178 tests, ~1.4s on Ubuntu.** No matrix, no fast/slow split. Reason: the whole suite is lighter than most lint passes, so splitting buys nothing and adds drift.
- **Grok-dependent probes live separately in `research/*.cjs` and are never collected by vitest.** They require the real `grok` binary, run manually, write non-destructively to a temp cwd. The fact that this split is *enforced by the vitest include glob* (not by convention) is what makes CI safe to run on a clean Ubuntu box.
- **CI is doing one thing well: regression-proofing the grok-free surface.** It's not trying to be an end-to-end validation. End-to-end validation = the PM's manual smoke against the real CLI. That tradeoff is explicit in `TESTS.md`.

Worth contrasting with the standard advice "you need full E2E in CI." For a thin-client extension where the upstream CLI is the heavy logic, that advice is wrong — what CI should protect is *our* surface, not theirs.

---

## App has no DB — iteration learnings that transfer

The extension uses:
- VS Code's `globalState` (key-value, per-extension) for session metadata + saved plan verdicts
- The filesystem for transient state (grok writes `plan.md`, we read it)
- No backend, no DB, no migrations

**What still transfers to apps that have a DB:**

- **Persisting decisions, not just data.** Each resolved plan saves `{text, verdict, afterUserMessage}` — the *decision* you made, not just the artifact. On restore, the system reconstructs the right state because the decisions are recorded. Same principle as event sourcing.
- **Schema evolution caveats.** `SessionMetaOverride` got a new optional field (`afterUserMessage`) mid-iteration. Older entries lacking it still work because the code handles the legacy case ("no position → drain at end of replay"). That graceful-degradation discipline is the same whether your store is key-value or Postgres.
- **The pure-decision module pattern.** `plan-restore.ts` exports `appendPlanEntry` + `decideRestoreState`. These are pure functions. The sidebar wires them to `globalState`. If we ever moved to a real DB, only the wiring changes — the decisions stay testable. Same separation works for any persistence layer.

---

## Multi-agent setup: grok tab + codex as extra perspectives, AGENTS.md as the glue

This is genuinely novel and worth a whole subsection in the post.

- **Same repo, multiple AI sidekicks.** The PM has Claude Code (me) + a Grok tab in VS Code + Codex, all looking at the same codebase. They don't share context — each is its own conversation — but they share *the source of truth* (the repo).
- **AGENTS.md is the contract that makes this work.** It's the equivalent of an onboarding doc for a new hire: "here's what this project is, here's the conventions, here's what's already been decided." Each agent reads it independently and aligns. Without it, three agents would propose three different architectures.
- **Why three perspectives matter for a PM.** Each agent has different bias:
  - One might over-engineer; another might under-test; a third might miss the UX implication
  - The PM picks the answer that fits, or asks the agents to critique each other
  - This is *closer to having a small eng team* than "AI pair programming" — different agents play different roles
- **Cost: context fragmentation.** None of them know what the others said. The PM has to be the human integrator. This is hard work and probably the actual skill PMs need to develop.

---

## Remote control as the primary surface + global codex ideation skill

Worth a brief callout — this is the workflow shape the PM uses:

- **Remote control = primary IDE.** The PM drives Claude Code from a mobile/web surface rather than a local terminal. The remote session has full filesystem + tool access on the dev box. The local IDE is just a viewer.
- **Global codex ideation skill.** A reusable skill (`/codex-ideation` or similar) bundles the multi-agent comparison pattern — fire the same question at codex + claude + grok, see who lands the best answer. Defined once, called anywhere.
- **Why this matters for the post:** the PM's "workspace" isn't a directory — it's a *toolchain*. Local Claude, remote Claude, Grok tab, Codex, skills, MCP servers. The skill is in composing them, not in using any one.

---

## Other learnings I'd surface (PM perspective)

These came up during this build session. Use whichever fit the post angle.

1. **Reload-cycle pain.** Multiple times I packaged the .vsix but the PM hadn't reloaded the VS Code window, so changes silently didn't take effect. "Did you rebuild and reinstall?" became a recurring question. Lesson: when the build → install → reload loop has three steps, *all three must be in the muscle memory* or you'll waste rounds debugging stale code.

2. **Visual bugs require human eyes.** The "copy code icon overlapping the header buttons" bug couldn't be found from the code alone — I needed the PM to describe what they saw (and even then, the multiple-choice question I asked was what nailed the symptom). Tests don't replace eyes; they replace *forgetting*.

3. **The "Claude said it works" trap.** Tests green + vsix installed ≠ feature works for the user. Multiple iterations in this session, I reported "done" and the PM came back with a new bug. Each one taught me that *the user's first manual test* is the real definition of done.

4. **Naming changes the mental model.** "Keep planning" → "Reject" was more than a rename. It exposed a missing third option ("I want to stop planning without implementing"), which became Cancel. The PM pushed for the rename; the architecture followed. **Naming is product work.**

5. **Working around upstream bugs is normal.** The whole Plan mode design (client-side gate, suppression, clarifying follow-up prompts) exists because the CLI's `exit_plan_mode` is broken. PMs in agent-led dev will hit this constantly: "the foundation is buggy, design around it." That's a *product* problem, not a tooling problem.

6. **Confirmatory loops are the engine.** Implement → test → package → install → user verifies → next iteration. The loop has to be fast or iteration grinds. We automated package+install with a one-liner so the loop is now ~30 seconds. PMs should treat tightening this loop as first-class work.

7. **"Comprehensive tests" can be a trap.** The PM asked for state-machine tests covering all transitions. I delivered 27 new tests. But the actual bug that bit them next (the ordering issue) was caught by *manual testing*, not the new tests. **Tests prove the past; manual smoke probes the future.** Both are needed, neither replaces the other.

8. **The PM is the integration test.** Pure tests verify modules. DOM tests verify rendering. Integration tests verify protocol. *The PM verifies the whole.* No automated layer replaces them. Tools just make their job tractable.

---

## Bits worth showing in the post (concrete moments)

- The plan-mode decision: gate the two *mandatory* server→client choke points the agent cannot avoid. Strategic clarity dropped into code.
- The verdict prompts: every Approve / Reject / Cancel sends a clarifying message to Grok over the wire, because the CLI's "approved on any response" bug would otherwise corrupt Grok's understanding. Designing around upstream pathology is half the work.
- The ordering bug investigation: walking through the trace, finding the one-line counter mismatch, fixing it. Could be a small "anatomy of a bug" sidebar.
- The "we already iterate at v1.2.0 until you say bump" convention. Released-or-not is a PM decision, not an agent decision. Codify it.

---

## Recommended structure for the actual post

Three options, pick by audience:

- **Long form (10-15 min read):** the meta-skill angle. PM as integrator, prompts as a craft, tests as artifact. Show the multi-agent setup.
- **Tactical (5-7 min):** the concrete workflow. Tools used, prompts used, file layout. Optimized for other PMs trying to replicate.
- **Series:** open with the meta-skill, follow with a deep-dive on one bug (the ordering issue or the false-approval workaround) as the second post.
