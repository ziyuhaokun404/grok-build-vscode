import * as vscode from "vscode";
import { GrokSidebar } from "./sidebar";

const FIRST_RUN_KEY = "grok.firstRunMovedToAuxBar";

async function moveToSecondarySideBarOnFirstRun(
  context: vscode.ExtensionContext,
  output: vscode.OutputChannel,
): Promise<void> {
  if (context.globalState.get<boolean>(FIRST_RUN_KEY)) return;
  // Set the flag up front — we only attempt this once even if the move fails,
  // so we never fight a user who deliberately drags the view back.
  await context.globalState.update(FIRST_RUN_KEY, true);
  try {
    await vscode.commands.executeCommand("vscode.moveViews", {
      viewIds: [GrokSidebar.viewId],
      destinationId: "workbench.view.auxiliary",
    });
  } catch (err) {
    output.appendLine(
      `[first-run] could not auto-move Grok view to secondary side bar: ${String(err)}`,
    );
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel("Grok");
  const sidebar = new GrokSidebar(context, output);
  void moveToSecondarySideBarOnFirstRun(context, output);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(GrokSidebar.viewId, sidebar, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    output,
    { dispose: () => sidebar.dispose() },
    vscode.commands.registerCommand("grok.open", () =>
      vscode.commands.executeCommand("workbench.view.extension.grokSidebar"),
    ),
    vscode.commands.registerCommand("grok.newSession", () => sidebar.newSession()),
    vscode.commands.registerCommand("grok.compact", () => {
      // emulated by sending the slash command as a prompt; CLI handles it
      vscode.window.showInformationMessage(
        "Type /compact in the composer to compress the conversation.",
      );
    }),
    vscode.commands.registerCommand("grok.pickModel", () => sidebar.pickModel()),
    vscode.commands.registerCommand("grok.pickEffort", () => sidebar.pickEffort()),
    vscode.commands.registerCommand("grok.toggleMode", () => sidebar.toggleMode()),
    vscode.commands.registerCommand("grok.sendSelection", () =>
      sidebar.insertActiveMention({ selection: true }),
    ),
    vscode.commands.registerCommand(
      "grok.sendFile",
      (uri?: vscode.Uri) => sidebar.insertActiveMention({ uri }),
    ),
    vscode.commands.registerCommand("grok.insertAtMention", () =>
      sidebar.insertActiveMention(),
    ),
    vscode.commands.registerCommand("grok.showLogs", () => output.show()),
  );
}

export function deactivate(): void {
  // disposables handle cleanup
}
