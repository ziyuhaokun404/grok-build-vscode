// DOM-level tests for the two v1.4.0 webview render paths that the pure-helper
// suites can't reach: generated-media inlining (addGeneratedMedia) and the
// subagent card (addSubagentCard). These drive the REAL media/chat.js so the
// host→webview contract for `{type:"media"}` and a subagent `{type:"toolCall"}`
// is exercised end-to-end, not just the classifiers in webview-helpers.
//
//   1. /imagine  -> {media:"image", src:<data: URI>, path} renders a clickable <img>
//   2. /imagine-video -> {media:"video", src:<data: URI>} renders <video controls>
//   3. remote link (no src, just url) renders an "open ↗" button, not an <img>
//   4. a spawn_subagent tool call renders a "Subagent: <type>" card and is
//      diverted away from the generic tool group
import { describe, it, expect } from "vitest";
import { bootWebview, dispatch, click } from "./webview-harness";

const messages = (doc: Document) => doc.getElementById("messages") as HTMLElement;

const IMG_DATA = "data:image/jpeg;base64,/9j/AAAQSkZJRg==";
const VIDEO_DATA = "data:video/mp4;base64,AAAAIGZ0eXBpc29t";

describe("addGeneratedMedia (/imagine image)", () => {
  it("inlines a generated image as a clickable <img> with the data: src", () => {
    const { window, posted, doc } = bootWebview();
    dispatch(window, {
      type: "media",
      media: "image",
      src: IMG_DATA,
      path: "/sessions/abc/images/cat.jpg",
    });

    const wrap = messages(doc).querySelector(".generated-image");
    expect(wrap).not.toBeNull();
    expect(wrap!.classList.contains("generated-video")).toBe(false);

    const img = wrap!.querySelector("img") as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute("src")).toBe(IMG_DATA);

    // clicking the inlined image opens its source file in VS Code
    click(window, img);
    expect(posted).toContainEqual({ type: "openFile", path: "/sessions/abc/images/cat.jpg" });
  });
});

describe("addGeneratedMedia (/imagine-video video)", () => {
  it("inlines a generated video as <video controls>, not an <img>", () => {
    const { window, doc } = bootWebview();
    dispatch(window, {
      type: "media",
      media: "video",
      src: VIDEO_DATA,
      path: "/sessions/abc/videos/clip.mp4",
    });

    const wrap = messages(doc).querySelector(".generated-image.generated-video");
    expect(wrap).not.toBeNull();

    const video = wrap!.querySelector("video") as HTMLVideoElement;
    expect(video).not.toBeNull();
    expect(video.getAttribute("src")).toBe(VIDEO_DATA);
    expect(video.controls).toBe(true);
    // a video must NOT also render an <img>
    expect(wrap!.querySelector("img")).toBeNull();
  });
});

describe("addGeneratedMedia (remote link fallback)", () => {
  it("renders an open-link button (not an <img>) when only a url is supplied", () => {
    const { window, posted, doc } = bootWebview();
    dispatch(window, { type: "media", media: "image", url: "https://x.ai/generated/cat.jpg" });

    const wrap = messages(doc).querySelector(".generated-image")!;
    expect(wrap.querySelector("img")).toBeNull();
    const link = wrap.querySelector(".preview-link") as HTMLButtonElement;
    expect(link).not.toBeNull();

    click(window, link);
    expect(posted).toContainEqual({ type: "openUrl", url: "https://x.ai/generated/cat.jpg" });
  });
});

describe("addSubagentCard (spawn_subagent tool call)", () => {
  it("renders a 'Subagent: <type>' card and skips the generic tool group", () => {
    const { window, doc } = bootWebview();
    // grok 0.2.33 confirmed shape (research/subagents.md)
    dispatch(window, {
      type: "toolCall",
      call: {
        toolCallId: "sa-1",
        title: "spawn_subagent",
        rawInput: { subagent_type: "general-purpose", prompt: "investigate the parser" },
      },
    });

    const card = messages(doc).querySelector(".subagent-card");
    expect(card).not.toBeNull();
    expect(card!.textContent).toContain("Subagent: general-purpose");
    // a subagent call must be diverted away from the generic tool group
    expect(messages(doc).querySelector(".tool-group")).toBeNull();
  });

  it("an ordinary tool call still goes to the tool group, not a subagent card", () => {
    const { window, doc } = bootWebview();
    dispatch(window, {
      type: "toolCall",
      call: { toolCallId: "t-1", title: "read_file", kind: "read", rawInput: { path: "a.ts" } },
    });

    expect(messages(doc).querySelector(".tool-group")).not.toBeNull();
    expect(messages(doc).querySelector(".subagent-card")).toBeNull();
  });
});
