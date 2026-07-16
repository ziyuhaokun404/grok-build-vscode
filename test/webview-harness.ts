// Shared test harness for driving the REAL shipped webview scripts
// (media/chat.js + media/webview-helpers.js) inside a happy-dom window.
//
// happy-dom doesn't execute inline <script> text synchronously, but window.eval
// runs in the window's realm and shares its globals — webview-helpers sets
// window.GrokWebviewHelpers, and chat.js reads it at startup. We stub
// acquireVsCodeApi to capture the postMessage payloads the webview sends back to
// the extension host, then dispatch the same messages sidebar.ts posts.
//
// This file is NOT a test (it has no *.test.ts suffix, so vitest's
// include glob "test/**/*.test.ts" skips it); it's imported by the DOM tests.
import { Window } from "happy-dom";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const helperSrc = read("../media/webview-helpers.js");
const chatSrc = read("../media/chat.js");

// Mirror of getHtml()'s <body> — only the ids chat.js queries at startup matter.
export const BODY = `
  <div class="app-shell">
    <aside id="session-rail" class="session-rail">
      <div class="session-rail-header">
        <span class="session-rail-title">会话</span>
        <button id="session-rail-new"></button>
      </div>
      <div id="session-rail-list"></div>
      <div class="session-rail-footer">
        <button id="session-rail-history">全部历史…</button>
      </div>
    </aside>
    <div id="session-rail-resizer" class="session-rail-resizer" role="separator" aria-orientation="vertical" aria-label="调整会话栏宽度" tabindex="0"></div>
    <div class="main-col">
      <header class="top-bar">
        <button id="session-rail-toggle"></button>
        <span id="session-title"></span>
        <div class="top-bar-spacer"></div>
        <button id="history-btn"></button>
        <button id="new-btn"></button>
        <div id="history-popover" hidden></div>
      </header>
      <section id="context-card" class="context-card" hidden>
        <button type="button" id="context-card-toggle" class="context-card-toggle" aria-expanded="false" aria-controls="context-card-details">
          <span class="context-card-summary">
            <span class="context-card-label">上下文</span>
            <span id="context-card-usage" class="context-card-usage"></span>
            <span class="context-card-bar-wrap"><span id="context-card-bar" class="context-card-bar"></span></span>
            <span id="context-card-pct" class="context-card-pct"></span>
          </span>
          <span class="context-card-chevron">▾</span>
        </button>
        <div id="context-card-details" class="context-card-details" role="region" hidden></div>
      </section>
      <main id="messages" class="messages">
        <div class="welcome" id="welcome">
          <p id="welcome-version" class="loading-dots">Starting</p>
          <div id="welcome-onboarding"></div>
        </div>
      </main>
      <section id="settings-page" class="settings-page" hidden>
        <header class="settings-page-header">
          <button id="settings-back-btn"></button>
          <span id="settings-page-title">设置</span>
        </header>
        <div id="settings-page-body"></div>
      </section>
      <footer class="composer">
        <button id="scroll-bottom-btn" class="scroll-bottom-btn"></button>
        <div class="composer-card">
          <div id="attachments"></div>
          <div class="composer-input-wrap">
            <textarea id="input"></textarea>
          </div>
          <button id="add-btn"></button>
          <button id="gear-btn"></button>
          <div id="donut"><svg><circle id="donut-arc"/></svg><span id="donut-label"></span></div>
          <div id="chips"></div>
          <button id="model-chip-btn">
            <span class="model-chip-text">
              <span id="model-chip-name"></span>
              <span id="model-chip-effort"></span>
            </span>
            <span class="model-chip-chevron"></span>
          </button>
          <button id="mode-btn"></button>
          <button id="send-btn"></button>
        </div>
        <div id="mode-popover" hidden></div>
        <div id="model-effort-popover" hidden></div>
        <div id="add-popover" hidden></div>
        <div id="context-popover" hidden></div>
        <div id="slash-popover" hidden></div>
      </footer>
    </div>
  </div>`;

export interface Posted { type: string; [k: string]: unknown }

export interface Harness {
  window: Window;
  posted: Posted[];
  doc: Document;
}

export function bootWebview(opts: { ready?: boolean } = {}): Harness {
  const window = new Window({ url: "https://localhost/" });
  const posted: Posted[] = [];
  (window as any).acquireVsCodeApi = () => ({
    postMessage: (m: Posted) => posted.push(m),
    setState: () => {},
    getState: () => undefined,
  });
  const doc = (window as any).document as Document;
  doc.body.innerHTML = BODY;
  (window as any).eval(helperSrc);
  (window as any).eval(chatSrc);
  // The webview now boots busy+locked (startup spinner) and only goes idle once
  // the host posts setBusy:false after the session is live. Most tests exercise
  // that ready state, so simulate it by default; pass { ready: false } to assert
  // the startup spinner itself.
  if (opts.ready !== false) {
    dispatch(window, { type: "setBusy", value: false });
  }
  posted.length = 0; // drop chat.js's startup {type:"ready"} so tests see only their own messages
  return { window, posted, doc };
}

/** Deliver a message to the webview exactly as the extension host would. */
export function dispatch(window: Window, data: Posted): void {
  (window as any).dispatchEvent(new (window as any).MessageEvent("message", { data }));
}

/** Click via a real bubbling MouseEvent so onclick + stopPropagation behave like the browser. */
export function click(window: Window, el: Element): void {
  el.dispatchEvent(new (window as any).MouseEvent("click", { bubbles: true, cancelable: true }));
}
