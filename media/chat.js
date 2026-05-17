(function () {
  const vscode = acquireVsCodeApi();

  const $ = (id) => document.getElementById(id);
  const messagesEl = $("messages");
  const input = $("input");
  const sendBtn = $("send-btn");
  const newBtn = $("new-btn");
  const modelBtn = $("model-btn");
  const effortBtn = $("effort-btn");
  const modeBtn = $("mode-btn");
  const chipsEl = $("chips");
  const hint = $("hint");
  const donutArc = $("donut-arc");
  const donutLabel = $("donut-label");
  const slashPopover = $("slash-popover");

  const state = {
    welcomeVisible: true,
    currentModelId: null,
    currentModeId: "agent",
    contextWindow: 200000,
    effort: "high",
    useCtrlEnter: false,
    commands: [],
    chips: [],
    busy: false,
    activeAgentEl: null,
    activeThoughtEl: null,
    slashFiltered: [],
    slashActive: 0,
    pendingDiffByToolCallId: new Map(), // toolCallId -> { path, oldText, newText }
  };

  // ---------- messages ----------

  function clearWelcome() {
    if (!state.welcomeVisible) return;
    messagesEl.innerHTML = "";
    state.welcomeVisible = false;
  }

  function addMessage(role, text) {
    clearWelcome();
    const el = document.createElement("div");
    el.className = `msg ${role}`;
    const rolelabel = document.createElement("div");
    rolelabel.className = "role";
    rolelabel.textContent = role === "user" ? "you" : role === "agent" ? "grok" : role;
    el.appendChild(rolelabel);
    const body = document.createElement("div");
    body.className = "body";
    body.textContent = text;
    el.appendChild(body);
    messagesEl.appendChild(el);
    scrollToBottom();
    return body;
  }

  function addToolCard(call) {
    clearWelcome();
    const el = document.createElement("div");
    el.className = "msg tool";
    const title = document.createElement("div");
    title.className = "tool-title";
    title.textContent = `[${call.kind || "tool"}] ${call.title || call.tool || "tool_call"}`;
    el.appendChild(title);
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function addError(text) {
    clearWelcome();
    const el = document.createElement("div");
    el.className = "msg error";
    el.textContent = text;
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function appendThought(text) {
    clearWelcome();
    if (!state.activeThoughtEl) {
      const el = document.createElement("div");
      el.className = "msg thinking";
      messagesEl.appendChild(el);
      state.activeThoughtEl = el;
    }
    state.activeThoughtEl.textContent += text;
    scrollToBottom();
  }

  function appendAgent(text) {
    clearWelcome();
    if (!state.activeAgentEl) {
      state.activeAgentEl = addMessage("agent", "");
    }
    state.activeAgentEl.textContent += text;
    scrollToBottom();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ---------- permission card ----------

  function addPermissionCard(req) {
    clearWelcome();
    const el = document.createElement("div");
    el.className = "card permission";
    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = req.toolCall?.title || `permission: ${req.toolCall?.kind || "tool"}`;
    el.appendChild(title);

    // diff preview link if we have a cached diff for this tool call
    const diff = state.pendingDiffByToolCallId.get(req.toolCall?.toolCallId);
    if (diff) {
      const subtitle = document.createElement("div");
      subtitle.className = "card-subtitle";
      const oldLines = (diff.oldText || "").split("\n").length;
      const newLines = (diff.newText || "").split("\n").length;
      subtitle.textContent = `${diff.path} — ${oldLines} → ${newLines} lines`;
      el.appendChild(subtitle);

      const preview = document.createElement("button");
      preview.className = "preview-link";
      preview.textContent = "open diff preview →";
      preview.onclick = () =>
        vscode.postMessage({
          type: "openDiff",
          path: diff.path,
          oldText: diff.oldText,
          newText: diff.newText,
        });
      el.appendChild(preview);
    }

    const actions = document.createElement("div");
    actions.className = "card-actions";
    for (const opt of req.options || []) {
      const btn = document.createElement("button");
      btn.textContent = opt.name;
      if (opt.kind === "allow_once") btn.classList.add("primary");
      if (opt.kind === "reject_once") btn.classList.add("danger");
      btn.onclick = () => {
        vscode.postMessage({
          type: "permissionAnswer",
          requestId: req.id,
          optionId: opt.optionId,
        });
        el.classList.add("resolved");
        for (const b of actions.querySelectorAll("button")) b.disabled = true;
        const chosen = document.createElement("div");
        chosen.className = "card-subtitle";
        chosen.textContent = `you chose: ${opt.name}`;
        el.appendChild(chosen);
      };
      actions.appendChild(btn);
    }
    el.appendChild(actions);

    messagesEl.appendChild(el);
    scrollToBottom();
  }

  // ---------- plan card ----------

  function addPlanCard(req) {
    clearWelcome();
    const el = document.createElement("div");
    el.className = "card plan";
    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = "Plan ready for review";
    el.appendChild(title);

    const body = document.createElement("pre");
    body.className = "plan-body";
    body.textContent = req.plan || "(empty plan)";
    el.appendChild(body);

    const actions = document.createElement("div");
    actions.className = "card-actions";
    const mk = (label, cls, verdict) => {
      const b = document.createElement("button");
      b.textContent = label;
      if (cls) b.classList.add(cls);
      b.onclick = () => {
        vscode.postMessage({
          type: "exitPlanAnswer",
          requestId: req.id,
          verdict,
        });
        el.classList.add("resolved");
        for (const x of actions.querySelectorAll("button")) x.disabled = true;
      };
      return b;
    };
    actions.appendChild(mk("Approve", "primary", "approved"));
    actions.appendChild(mk("Abandon", "danger", "abandoned"));
    actions.appendChild(mk("Reject", "", "rejected"));
    el.appendChild(actions);

    messagesEl.appendChild(el);
    scrollToBottom();
  }

  // ---------- chips ----------

  function renderChips() {
    chipsEl.innerHTML = "";
    for (const chip of state.chips) {
      const el = document.createElement("div");
      el.className = `chip${chip.hidden ? " hidden" : ""}`;
      const eye = document.createElement("button");
      eye.textContent = chip.hidden ? "🚫" : "👁";
      eye.title = chip.hidden ? "show in context" : "hide from context";
      eye.onclick = () => vscode.postMessage({ type: "toggleChip", id: chip.id });
      el.appendChild(eye);

      const name = document.createElement("span");
      name.className = "chip-name";
      const sel =
        chip.selectionStart && chip.selectionEnd
          ? `:L${chip.selectionStart}-${chip.selectionEnd}`
          : "";
      name.textContent = `📄 ${chip.relPath}${sel}`;
      name.title = chip.path;
      name.style.cursor = "pointer";
      name.onclick = () => vscode.postMessage({ type: "openFile", path: chip.path });
      el.appendChild(name);

      const remove = document.createElement("button");
      remove.textContent = "×";
      remove.title = "remove";
      remove.onclick = () => vscode.postMessage({ type: "removeChip", id: chip.id });
      el.appendChild(remove);

      chipsEl.appendChild(el);
    }
  }

  // ---------- donut ----------

  function updateDonut(used) {
    const pct = Math.min(100, Math.round((used / state.contextWindow) * 100));
    const circumference = 2 * Math.PI * 9;
    const arc = (pct / 100) * circumference;
    donutArc.setAttribute("stroke-dasharray", `${arc} ${circumference}`);
    let color = "var(--vscode-charts-green, #4ec9b0)";
    if (pct > 90) color = "var(--vscode-charts-red, #f48771)";
    else if (pct > 70) color = "var(--vscode-charts-yellow, #d7ba7d)";
    donutArc.setAttribute("stroke", color);
    donutLabel.textContent = `${pct}%`;
    donutLabel.title = `${used.toLocaleString()} / ${state.contextWindow.toLocaleString()} tokens`;
  }

  // ---------- slash autocomplete ----------

  function updateSlash() {
    const m = (input.value.slice(0, input.selectionStart || 0)).match(/(?:^|\n)\/(\S*)$/);
    if (!m) {
      slashPopover.hidden = true;
      state.slashFiltered = [];
      return;
    }
    const q = m[1].toLowerCase();
    state.slashFiltered = state.commands.filter((c) => c.name.toLowerCase().startsWith(q));
    if (!state.slashFiltered.length) {
      slashPopover.hidden = true;
      return;
    }
    state.slashActive = 0;
    renderSlash();
    slashPopover.hidden = false;
  }

  function renderSlash() {
    slashPopover.innerHTML = "";
    state.slashFiltered.forEach((cmd, i) => {
      const el = document.createElement("div");
      el.className = `slash-item${i === state.slashActive ? " active" : ""}`;
      const name = document.createElement("div");
      name.className = "slash-name";
      name.textContent = `/${cmd.name}`;
      el.appendChild(name);
      if (cmd.description) {
        const d = document.createElement("div");
        d.className = "slash-desc";
        d.textContent = cmd.description;
        el.appendChild(d);
      }
      el.onclick = () => pickSlash(cmd);
      slashPopover.appendChild(el);
    });
  }

  function pickSlash(cmd) {
    const text = input.value;
    input.value = text.replace(/(?:^|\n)\/(\S*)$/, (full) =>
      full.startsWith("\n") ? `\n/${cmd.name} ` : `/${cmd.name} `,
    );
    slashPopover.hidden = true;
    input.focus();
  }

  // ---------- send ----------

  function send() {
    if (state.busy) return;
    const text = input.value.trim();
    if (!text && state.chips.every((c) => c.hidden)) return;
    sendBtn.disabled = true;
    state.busy = true;
    state.activeAgentEl = null;
    state.activeThoughtEl = null;
    vscode.postMessage({ type: "send", text, chips: state.chips });
    input.value = "";
    slashPopover.hidden = true;
  }

  // ---------- inbound ----------

  window.addEventListener("message", (e) => {
    const msg = e.data;
    switch (msg.type) {
      case "initialState":
        state.effort = msg.effort;
        state.useCtrlEnter = msg.useCtrlEnter;
        effortBtn.textContent = `effort: ${state.effort}`;
        break;
      case "initialized":
        $("welcome-version").textContent = `connected · ${msg.info.cliPath} · effort: ${msg.info.effort}`;
        break;
      case "session": {
        state.currentModelId = msg.currentModelId;
        modelBtn.textContent = msg.currentModelId || "grok-build";
        const m = (msg.models || []).find((x) => x.modelId === msg.currentModelId);
        if (m?.totalContextTokens) state.contextWindow = m.totalContextTokens;
        updateDonut(0);
        break;
      }
      case "modelChanged":
        state.currentModelId = msg.modelId;
        modelBtn.textContent = msg.modelId;
        break;
      case "modeChanged":
        state.currentModeId = msg.modeId;
        modeBtn.textContent = `mode: ${msg.modeId}`;
        modeBtn.classList.toggle("plan-active", msg.modeId === "plan");
        break;
      case "effortChanged":
        state.effort = msg.effort;
        effortBtn.textContent = `effort: ${state.effort}`;
        break;
      case "chips":
        state.chips = msg.chips;
        renderChips();
        break;
      case "commandsUpdate":
        state.commands = msg.commands || [];
        break;
      case "userMessage":
        addMessage("user", msg.text);
        break;
      case "agentStart":
        hint.textContent = "thinking...";
        break;
      case "thoughtChunk":
        appendThought(msg.text);
        break;
      case "messageChunk":
        appendAgent(msg.text);
        break;
      case "toolCall":
        addToolCard(msg.call);
        break;
      case "toolCallUpdate": {
        // capture diffs by tool call id so we can offer "open diff preview" on the permission card
        const c = msg.call?.content;
        if (Array.isArray(c)) {
          for (const item of c) {
            if (item?.type === "diff") {
              state.pendingDiffByToolCallId.set(msg.call.toolCallId, {
                path: item.path,
                oldText: item.oldText ?? "",
                newText: item.newText ?? "",
              });
            }
          }
        }
        break;
      }
      case "permissionRequest":
        addPermissionCard(msg.req);
        break;
      case "exitPlanRequest":
        addPlanCard(msg.req);
        break;
      case "promptComplete":
        if (msg.meta?.totalTokens) updateDonut(msg.meta.totalTokens);
        hint.textContent = msg.meta?.totalTokens
          ? `${msg.meta.inputTokens || 0} in · ${msg.meta.outputTokens || 0} out`
          : "";
        state.busy = false;
        sendBtn.disabled = false;
        state.activeAgentEl = null;
        state.activeThoughtEl = null;
        break;
      case "agentError":
        addError(msg.text);
        hint.textContent = "error";
        state.busy = false;
        sendBtn.disabled = false;
        break;
      case "agentEnd":
        state.busy = false;
        sendBtn.disabled = false;
        break;
      case "exit":
        addError(`Grok exited (code ${msg.code}). Press "+ new" to restart.`);
        state.busy = false;
        sendBtn.disabled = false;
        break;
      case "error":
        addError(msg.text);
        break;
      case "xaiNotification":
        // currently rendered as-needed by the specific update kinds
        break;
    }
  });

  // ---------- wire ----------

  sendBtn.onclick = send;
  newBtn.onclick = () => {
    messagesEl.innerHTML = "";
    state.welcomeVisible = false;
    state.pendingDiffByToolCallId.clear();
    vscode.postMessage({ type: "newSession" });
  };
  modelBtn.onclick = () => vscode.postMessage({ type: "pickModel" });
  effortBtn.onclick = () => vscode.postMessage({ type: "pickEffort" });
  modeBtn.onclick = () => vscode.postMessage({ type: "toggleMode" });

  input.addEventListener("input", updateSlash);
  input.addEventListener("keydown", (e) => {
    if (!slashPopover.hidden && state.slashFiltered.length) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        state.slashActive = (state.slashActive + 1) % state.slashFiltered.length;
        renderSlash();
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        state.slashActive =
          (state.slashActive - 1 + state.slashFiltered.length) % state.slashFiltered.length;
        renderSlash();
        return;
      }
      if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
        e.preventDefault();
        pickSlash(state.slashFiltered[state.slashActive]);
        return;
      }
      if (e.key === "Escape") {
        slashPopover.hidden = true;
        return;
      }
    }
    const sendKey = state.useCtrlEnter
      ? e.key === "Enter" && (e.metaKey || e.ctrlKey)
      : e.key === "Enter" && !e.shiftKey;
    if (sendKey) {
      e.preventDefault();
      send();
    }
  });

  document.addEventListener("dragenter", (e) => {
    e.preventDefault();
    document.body.classList.add("dragging");
  });
  document.addEventListener("dragover", (e) => e.preventDefault());
  document.addEventListener("dragleave", () => document.body.classList.remove("dragging"));
  document.addEventListener("drop", (e) => {
    e.preventDefault();
    document.body.classList.remove("dragging");
    const data = e.dataTransfer?.getData("text/uri-list");
    if (!data) return;
    const uris = data.split(/\r?\n/).filter((l) => l && !l.startsWith("#"));
    for (const uri of uris) {
      const m = uri.match(/^file:\/\/(.+)$/);
      if (!m) continue;
      vscode.postMessage({ type: "dropFile", path: decodeURIComponent(m[1]), shift: e.shiftKey });
    }
  });

  vscode.postMessage({ type: "ready" });
})();
