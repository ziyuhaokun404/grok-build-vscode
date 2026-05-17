import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";
import { AcpClient, EffortLevel, ExitPlanRequest, PermissionRequest } from "./acp";
import { locateGrokCli } from "./cli-locator";
import { TerminalManager } from "./terminal-manager";
import {
  FileChip,
  clearImplicitChips,
  makeExplicitChip,
  makeImplicitChip,
  removeChip,
  toggleChip,
} from "./chips";
import { buildPrompt } from "./prompt-builder";

type WebviewMsg =
  | { type: "ready" }
  | { type: "send"; text: string; chips: FileChip[] }
  | { type: "newSession" }
  | { type: "cancel" }
  | { type: "pickModel" }
  | { type: "pickEffort" }
  | { type: "toggleMode" }
  | { type: "removeChip"; id: string }
  | { type: "toggleChip"; id: string }
  | { type: "openFile"; path: string }
  | { type: "openDiff"; path: string; oldText: string; newText: string }
  | { type: "dropFile"; path: string; shift: boolean }
  | { type: "permissionAnswer"; requestId: number | string; optionId: string }
  | { type: "exitPlanAnswer"; requestId: number | string; verdict: "approved" | "abandoned" | "rejected" };

export class GrokSidebar implements vscode.WebviewViewProvider {
  public static readonly viewId = "grok.chat";
  private view?: vscode.WebviewView;
  private client?: AcpClient;
  private output: vscode.OutputChannel;
  private chips: FileChip[] = [];
  private editorWatcher?: vscode.Disposable;
  private terminalManager = new TerminalManager();

  constructor(
    private context: vscode.ExtensionContext,
    output: vscode.OutputChannel,
  ) {
    this.output = output;
  }

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, "media"),
        vscode.Uri.joinPath(this.context.extensionUri, "resources"),
      ],
    };
    view.webview.html = this.getHtml(view.webview);
    view.webview.onDidReceiveMessage((m: WebviewMsg) => this.onMessage(m));
    this.watchActiveEditor();
  }

  insertActiveMention(opts?: { selection?: boolean; uri?: vscode.Uri }): void {
    const editor = vscode.window.activeTextEditor;
    const uri = opts?.uri ?? editor?.document.uri;
    if (!uri) return;
    const relPath = vscode.workspace.asRelativePath(uri);
    let selStart: number | undefined;
    let selEnd: number | undefined;
    if (opts?.selection && editor && !editor.selection.isEmpty) {
      selStart = editor.selection.start.line + 1;
      selEnd = editor.selection.end.line + 1;
    }
    this.chips.push(makeExplicitChip(uri.fsPath, relPath, selStart, selEnd));
    this.postChips();
    this.reveal();
  }

  newSession(): void {
    void this.startSession();
  }

  async pickModel(): Promise<void> {
    if (!this.client || !this.client.availableModels.length) {
      vscode.window.showInformationMessage("Start a session first.");
      return;
    }
    const items = this.client.availableModels.map((m) => ({
      label: m.name ?? m.modelId,
      description: m.modelId === this.client!.currentModelId ? "$(check) current" : "",
      detail: m.description,
      modelId: m.modelId,
    }));
    const picked = await vscode.window.showQuickPick(items, {
      placeHolder: "Pick a Grok model",
    });
    if (picked) {
      await this.client.setModel(picked.modelId);
      this.post({ type: "modelChanged", modelId: picked.modelId });
    }
  }

  async pickEffort(): Promise<void> {
    const levels: EffortLevel[] = ["low", "medium", "high", "xhigh", "max"];
    const cfg = vscode.workspace.getConfiguration("grok");
    const current = cfg.get<EffortLevel>("defaultEffort", "high");
    const picked = await vscode.window.showQuickPick(
      levels.map((l) => ({ label: l, description: l === current ? "$(check) current" : "" })),
      { placeHolder: "Pick effort level (applies on next session)" },
    );
    if (!picked) return;
    await cfg.update("defaultEffort", picked.label, vscode.ConfigurationTarget.Global);
    this.post({ type: "effortChanged", effort: picked.label });

    const restart = await vscode.window.showInformationMessage(
      `Effort set to "${picked.label}". Restart Grok session now?`,
      "Restart",
      "Later",
    );
    if (restart === "Restart") {
      void this.startSession();
    }
  }

  async toggleMode(): Promise<void> {
    if (!this.client) return;
    const next = this.client.currentModeId === "plan" ? "agent" : "plan";
    try {
      await this.client.setMode(next);
    } catch (e) {
      vscode.window.showErrorMessage(`Couldn't switch mode: ${(e as Error).message}`);
    }
  }

  dispose(): void {
    this.client?.dispose();
    this.editorWatcher?.dispose();
    this.terminalManager.disposeAll();
  }

  // ---------- internals ----------

  private async ensureClient(): Promise<AcpClient | undefined> {
    if (this.client) return this.client;
    return this.startSession();
  }

  private async startSession(): Promise<AcpClient | undefined> {
    this.client?.dispose();
    this.client = undefined;

    const cfg = vscode.workspace.getConfiguration("grok");
    const cliPath = locateGrokCli(cfg.get<string>("cliPath", ""));
    if (!cliPath) {
      this.post({
        type: "error",
        text: "Grok CLI not found. Install with: curl -fsSL https://x.ai/cli/install.sh | bash",
      });
      return undefined;
    }

    const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
    const effort = cfg.get<EffortLevel>("defaultEffort", "high");
    const client = new AcpClient({
      cliPath,
      cwd,
      effort,
      log: (msg) => this.output.appendLine(msg),
    });
    this.client = client;

    // fs handlers (mandatory — the agent calls these to read/write files)
    client.fsRead = async (p: string) => {
      try {
        const uri = vscode.Uri.file(p);
        const bytes = await vscode.workspace.fs.readFile(uri);
        return Buffer.from(bytes).toString("utf8");
      } catch {
        return fs.readFileSync(p, "utf8");
      }
    };
    client.fsWrite = async (p: string, content: string) => {
      try {
        const uri = vscode.Uri.file(p);
        const dir = vscode.Uri.file(path.dirname(p));
        await vscode.workspace.fs.createDirectory(dir);
        await vscode.workspace.fs.writeFile(uri, Buffer.from(content, "utf8"));
      } catch {
        fs.mkdirSync(path.dirname(p), { recursive: true });
        fs.writeFileSync(p, content, "utf8");
      }
    };
    client.terminal = this.terminalManager;

    client.on("initialized", (init) => {
      this.post({
        type: "initialized",
        info: { cliPath, cwd, effort, init: { protocolVersion: init?.protocolVersion } },
      });
    });
    client.on("session", (res) =>
      this.post({
        type: "session",
        sessionId: res.sessionId,
        models: client.availableModels,
        currentModelId: client.currentModelId,
      }),
    );
    client.on("modelChanged", (id) =>
      this.post({ type: "modelChanged", modelId: id }),
    );
    client.on("modeChanged", (id) =>
      this.post({ type: "modeChanged", modeId: id }),
    );
    client.on("commandsUpdate", (cmds) =>
      this.post({ type: "commandsUpdate", commands: cmds }),
    );
    client.on("messageChunk", (text: string) =>
      this.post({ type: "messageChunk", text }),
    );
    client.on("thoughtChunk", (text: string) =>
      this.post({ type: "thoughtChunk", text }),
    );
    client.on("toolCall", (u) => this.post({ type: "toolCall", call: u }));
    client.on("toolCallUpdate", (u) =>
      this.post({ type: "toolCallUpdate", call: u }),
    );
    client.on("plan", (u) => this.post({ type: "plan", plan: u }));
    client.on("promptComplete", (meta) =>
      this.post({ type: "promptComplete", meta }),
    );
    client.on("xaiNotification", (u) =>
      this.post({ type: "xaiNotification", update: u }),
    );
    client.on("permissionRequest", (req: PermissionRequest) =>
      this.post({ type: "permissionRequest", req }),
    );
    client.on("exitPlanRequest", (req: ExitPlanRequest) =>
      this.post({ type: "exitPlanRequest", req }),
    );
    client.on("exit", (code) => this.post({ type: "exit", code }));
    client.on("stderr", (text: string) => this.output.append(text));

    try {
      await client.start();
      const defaultModel = cfg.get<string>("defaultModel", "");
      await client.newSession(defaultModel || undefined);
    } catch (err) {
      this.post({
        type: "error",
        text: `Failed to start Grok: ${(err as Error).message ?? String(err)}`,
      });
      client.dispose();
      this.client = undefined;
      return undefined;
    }
    return client;
  }

  private async onMessage(msg: WebviewMsg): Promise<void> {
    switch (msg.type) {
      case "ready":
        this.postInitialState();
        break;
      case "send":
        await this.handleSend(msg.text, msg.chips);
        break;
      case "newSession":
        await this.startSession();
        break;
      case "cancel":
        await this.client?.cancel();
        break;
      case "pickModel":
        await this.pickModel();
        break;
      case "pickEffort":
        await this.pickEffort();
        break;
      case "toggleMode":
        await this.toggleMode();
        break;
      case "removeChip":
        this.chips = removeChip(this.chips, msg.id);
        this.postChips();
        break;
      case "toggleChip":
        this.chips = toggleChip(this.chips, msg.id);
        this.postChips();
        break;
      case "openFile":
        void vscode.commands.executeCommand(
          "vscode.open",
          vscode.Uri.file(msg.path),
        );
        break;
      case "openDiff":
        await this.openDiffEditor(msg.path, msg.oldText, msg.newText);
        break;
      case "dropFile":
        this.addDroppedFile(msg.path, msg.shift);
        break;
      case "permissionAnswer":
        this.client?.respondPermission(msg.requestId, msg.optionId);
        break;
      case "exitPlanAnswer":
        this.client?.respondExitPlan(msg.requestId, msg.verdict);
        break;
    }
  }

  private async openDiffEditor(filePath: string, oldText: string, newText: string): Promise<void> {
    const tmp = vscode.Uri.parse(`untitled:${filePath}.before`);
    const after = vscode.Uri.file(filePath);
    // Write oldText into a virtual untitled doc, then diff against the file on disk that contains newText.
    const beforeDoc = await vscode.workspace.openTextDocument({ content: oldText, language: "plaintext" });
    const afterDoc = await vscode.workspace.openTextDocument({ content: newText, language: "plaintext" });
    await vscode.commands.executeCommand(
      "vscode.diff",
      beforeDoc.uri,
      afterDoc.uri,
      `Grok proposed: ${path.basename(filePath)}`,
    );
    // (tmp/after refs intentionally unused — we use openTextDocument's auto URIs)
    void tmp; void after;
  }

  private addDroppedFile(absPath: string, shiftHeld: boolean): void {
    if (!fs.existsSync(absPath)) return;
    const uri = vscode.Uri.file(absPath);
    const relPath = vscode.workspace.asRelativePath(uri);
    if (shiftHeld) {
      let totalLines = 1;
      try {
        totalLines = fs.readFileSync(absPath, "utf8").split("\n").length;
      } catch {
        /* keep 1 */
      }
      this.chips.push(makeExplicitChip(absPath, relPath, 1, totalLines));
    } else {
      this.chips.push(makeExplicitChip(absPath, relPath));
    }
    this.postChips();
  }

  private async handleSend(text: string, chips: FileChip[]): Promise<void> {
    const client = await this.ensureClient();
    if (!client) return;

    const finalPrompt = buildPrompt(text, chips, {
      readFile: (p) => fs.readFileSync(p, "utf8"),
      extName: (p) => path.extname(p),
    });

    this.chips = [];
    this.postChips();

    this.post({ type: "userMessage", text: finalPrompt });
    this.post({ type: "agentStart" });

    try {
      const meta = await client.prompt(finalPrompt);
      this.post({ type: "agentEnd", meta });
    } catch (err) {
      const e = err as any;
      const message = e?.data?.message ?? e?.message ?? String(err);
      this.post({ type: "agentError", text: message });
    }
  }

  private postInitialState(): void {
    const cfg = vscode.workspace.getConfiguration("grok");
    this.post({
      type: "initialState",
      effort: cfg.get("defaultEffort", "high"),
      useCtrlEnter: cfg.get("useCtrlEnterToSend", false),
    });
    if (cfg.get<boolean>("includeActiveFileByDefault", true)) {
      this.addActiveEditorChip();
    }
    void this.startSession();
  }

  private postChips(): void {
    this.post({ type: "chips", chips: this.chips });
  }

  private post(message: any): void {
    this.view?.webview.postMessage(message);
  }

  private reveal(): void {
    this.view?.show?.(true);
  }

  private watchActiveEditor(): void {
    this.editorWatcher?.dispose();
    this.editorWatcher = vscode.window.onDidChangeActiveTextEditor(() => {
      const includeActive = vscode.workspace
        .getConfiguration("grok")
        .get<boolean>("includeActiveFileByDefault", true);
      if (!includeActive) return;
      this.chips = clearImplicitChips(this.chips);
      this.addActiveEditorChip();
    });
  }

  private addActiveEditorChip(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.uri.scheme !== "file") return;
    const relPath = vscode.workspace.asRelativePath(editor.document.uri);
    this.chips.push(makeImplicitChip(editor.document.uri.fsPath, relPath));
    this.postChips();
  }

  private getHtml(webview: vscode.Webview): string {
    const nonce = getNonce();
    const mediaUri = (file: string) =>
      webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", file));
    const resourceUri = (file: string) =>
      webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "resources", file));

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} data:; script-src 'nonce-${nonce}';" />
<link rel="stylesheet" href="${mediaUri("chat.css")}" />
</head>
<body>
  <header class="topbar">
    <button id="model-btn" class="pill" title="Pick model">grok-build</button>
    <button id="effort-btn" class="pill" title="Pick effort">effort: high</button>
    <button id="mode-btn" class="pill" title="Toggle plan/agent mode">mode: agent</button>
    <button id="new-btn" class="pill ghost" title="New session">+ new</button>
  </header>

  <main id="messages" class="messages">
    <div class="welcome">
      <img src="${resourceUri("grok-mark.svg")}" alt="Grok" class="welcome-mark" />
      <h2>Grok</h2>
      <p id="welcome-version" class="muted">starting...</p>
      <ul class="welcome-tips">
        <li>Type your prompt below. <kbd>Enter</kbd> to send.</li>
        <li>Slash commands: <code>/compact</code>, <code>/new</code>, <code>/plan</code>, <code>/context</code>, <code>/yolo</code>.</li>
        <li>Active editor file is added as context — click <span aria-hidden="true">👁</span> to hide.</li>
      </ul>
    </div>
  </main>

  <div id="chips" class="chips"></div>

  <footer class="composer">
    <textarea id="input" placeholder="Ask Grok..." rows="3"></textarea>
    <div class="composer-bottom">
      <div id="hint" class="muted small"></div>
      <div class="context-donut" id="donut" title="Context usage">
        <svg width="22" height="22" viewBox="0 0 22 22">
          <circle cx="11" cy="11" r="9" fill="none" stroke="var(--vscode-editorWidget-border,#444)" stroke-width="2"/>
          <circle id="donut-arc" cx="11" cy="11" r="9" fill="none" stroke="var(--vscode-charts-green,#4ec9b0)" stroke-width="2" stroke-dasharray="0 999" transform="rotate(-90 11 11)"/>
        </svg>
        <span id="donut-label" class="small muted">0%</span>
      </div>
      <button id="send-btn" class="send">Send</button>
    </div>
    <div id="slash-popover" class="slash-popover" hidden></div>
  </footer>

  <script nonce="${nonce}" src="${mediaUri("chat.js")}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}
