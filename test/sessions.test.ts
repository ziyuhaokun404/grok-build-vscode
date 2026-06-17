import { describe, it, expect } from "vitest";
import * as path from "node:path";
import {
  FsLike,
  SessionMetaOverrides,
  carrySessionName,
  clearSessions,
  deleteSessionDir,
  fallbackName,
  indexSessions,
  listSessions,
  readSessionEntries,
  sessionsDirFor,
} from "../src/sessions";

interface FileEntry {
  isDir: boolean;
  content?: string;
  mtimeMs?: number;
}

function buildFs(files: Record<string, FileEntry>): FsLike {
  const removed = new Set<string>();
  const exists = (p: string) => !removed.has(p) && files[p] !== undefined;
  return {
    existsSync: exists,
    readdirSync: (p) => {
      if (!exists(p)) throw new Error(`ENOENT: ${p}`);
      const prefix = p.endsWith("/") || p.endsWith("\\") ? p : p + path.sep;
      const names = new Set<string>();
      for (const fp of Object.keys(files)) {
        if (removed.has(fp)) continue;
        const altPrefix = p + (p.endsWith("/") ? "" : "/");
        if (fp.startsWith(prefix) || fp.startsWith(altPrefix)) {
          const rest = fp.startsWith(prefix) ? fp.slice(prefix.length) : fp.slice(altPrefix.length);
          const first = rest.split(/[\\/]/)[0];
          if (first) names.add(first);
        }
      }
      return Array.from(names);
    },
    readFileSync: (p) => {
      const f = files[p];
      if (!f || removed.has(p)) throw new Error(`ENOENT: ${p}`);
      return f.content ?? "";
    },
    statSync: (p) => {
      const f = files[p];
      if (!f || removed.has(p)) throw new Error(`ENOENT: ${p}`);
      return { isDirectory: () => f.isDir, mtimeMs: f.mtimeMs ?? 0 };
    },
    rmSync: (p) => {
      for (const fp of Object.keys(files)) {
        if (fp === p || fp.startsWith(p + "/") || fp.startsWith(p + path.sep)) {
          removed.add(fp);
        }
      }
    },
    rmdirSync: (p) => {
      for (const fp of Object.keys(files)) {
        if (fp === p || fp.startsWith(p + "/") || fp.startsWith(p + path.sep)) {
          removed.add(fp);
        }
      }
    },
  };
}

const grokHome = "/home/user/.grok";
const cwd = "/tmp/project";

function dirFor(id: string): string {
  return path.join(sessionsDirFor(grokHome, cwd), id);
}

describe("sessionsDirFor", () => {
  it("URL-encodes the cwd path like grok does", () => {
    expect(sessionsDirFor("/h/.grok", "/tmp")).toBe(path.join("/h/.grok", "sessions", "%2Ftmp"));
  });

  it("URL-encodes a nested cwd path", () => {
    const out = sessionsDirFor("/h/.grok", "/work/space");
    expect(out).toBe(path.join("/h/.grok", "sessions", "%2Fwork%2Fspace"));
  });
});

describe("fallbackName", () => {
  it("uses the summary when available", () => {
    expect(fallbackName("Fix login bug", 0)).toBe("Fix login bug");
  });

  it("truncates very long summaries", () => {
    const long = "x".repeat(100);
    const out = fallbackName(long, 0);
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out.endsWith("…")).toBe(true);
  });

  it("falls back to formatted date when summary is empty", () => {
    const ts = Date.UTC(2026, 4, 22, 12, 30);
    const out = fallbackName("", ts);
    expect(out.startsWith("Untitled (")).toBe(true);
  });

  it("returns 'Untitled' on invalid updatedAt", () => {
    expect(fallbackName("", NaN)).toMatch(/Untitled/);
  });
});

describe("listSessions", () => {
  const dir = sessionsDirFor(grokHome, cwd);

  it("returns [] when sessions dir does not exist", () => {
    const fs = buildFs({});
    const out = listSessions({ fs, grokHome, cwd, overrides: {} });
    expect(out).toEqual([]);
  });

  it("returns entries sorted by updatedAt desc", () => {
    const fs = buildFs({
      [dir]: { isDir: true },
      [dirFor("a")]: { isDir: true },
      [dirFor("b")]: { isDir: true },
      [path.join(dirFor("a"), "summary.json")]: {
        isDir: false,
        content: JSON.stringify({
          info: { id: "a", cwd },
          session_summary: "first",
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
          num_messages: 4,
        }),
      },
      [path.join(dirFor("b"), "summary.json")]: {
        isDir: false,
        content: JSON.stringify({
          info: { id: "b", cwd },
          session_summary: "second",
          created_at: "2026-02-01T00:00:00Z",
          updated_at: "2026-02-01T00:00:00Z",
          num_messages: 2,
        }),
      },
    });
    const out = listSessions({ fs, grokHome, cwd, overrides: {} });
    expect(out.map((s) => s.id)).toEqual(["b", "a"]);
  });

  it("prefers customName override over session_summary", () => {
    const fs = buildFs({
      [dir]: { isDir: true },
      [dirFor("a")]: { isDir: true },
      [path.join(dirFor("a"), "summary.json")]: {
        isDir: false,
        content: JSON.stringify({
          info: { id: "a", cwd },
          session_summary: "raw summary",
          updated_at: "2026-01-01T00:00:00Z",
          num_messages: 3,
        }),
      },
    });
    const overrides: SessionMetaOverrides = { a: { customName: "My session" } };
    const out = listSessions({ fs, grokHome, cwd, overrides });
    expect(out[0].displayName).toBe("My session");
    expect(out[0].customName).toBe("My session");
    expect(out[0].rawSummary).toBe("raw summary");
  });

  it("falls back to date when summary is empty and no customName", () => {
    const fs = buildFs({
      [dir]: { isDir: true },
      [dirFor("a")]: { isDir: true },
      [path.join(dirFor("a"), "summary.json")]: {
        isDir: false,
        content: JSON.stringify({
          info: { id: "a", cwd },
          session_summary: "",
          updated_at: "2026-01-01T12:00:00Z",
          num_messages: 0,
        }),
      },
    });
    const out = listSessions({ fs, grokHome, cwd, overrides: {} });
    expect(out[0].displayName).toMatch(/Untitled/);
  });

  it("tolerates malformed summary.json by skipping the entry", () => {
    const fs = buildFs({
      [dir]: { isDir: true },
      [dirFor("a")]: { isDir: true },
      [dirFor("b")]: { isDir: true },
      [path.join(dirFor("a"), "summary.json")]: {
        isDir: false,
        content: "{ not json",
      },
      [path.join(dirFor("b"), "summary.json")]: {
        isDir: false,
        content: JSON.stringify({
          info: { id: "b", cwd },
          session_summary: "ok",
          updated_at: "2026-01-01T00:00:00Z",
          num_messages: 1,
        }),
      },
    });
    const out = listSessions({ fs, grokHome, cwd, overrides: {} });
    expect(out.map((s) => s.id)).toEqual(["b"]);
  });

  it("skips entries with missing summary.json", () => {
    const fs = buildFs({
      [dir]: { isDir: true },
      [dirFor("ghost")]: { isDir: true },
    });
    const out = listSessions({ fs, grokHome, cwd, overrides: {} });
    expect(out).toEqual([]);
  });

  it("extracts model id and num_messages from summary", () => {
    const fs = buildFs({
      [dir]: { isDir: true },
      [dirFor("a")]: { isDir: true },
      [path.join(dirFor("a"), "summary.json")]: {
        isDir: false,
        content: JSON.stringify({
          info: { id: "a", cwd },
          session_summary: "hi",
          current_model_id: "grok-build",
          num_messages: 7,
          updated_at: "2026-01-01T00:00:00Z",
        }),
      },
    });
    const out = listSessions({ fs, grokHome, cwd, overrides: {} });
    expect(out[0].modelId).toBe("grok-build");
    expect(out[0].numMessages).toBe(7);
  });
});

describe("indexSessions", () => {
  const dir = sessionsDirFor(grokHome, cwd);

  it("returns [] when the sessions dir does not exist", () => {
    const fs = buildFs({});
    expect(indexSessions({ fs, grokHome, cwd })).toEqual([]);
  });

  it("orders ids newest-first by summary.json mtime without reading content", () => {
    let reads = 0;
    const base = buildFs({
      [dir]: { isDir: true },
      [dirFor("old")]: { isDir: true },
      [dirFor("new")]: { isDir: true },
      [dirFor("mid")]: { isDir: true },
      [path.join(dirFor("old"), "summary.json")]: { isDir: false, content: "{}", mtimeMs: 100 },
      [path.join(dirFor("new"), "summary.json")]: { isDir: false, content: "{}", mtimeMs: 300 },
      [path.join(dirFor("mid"), "summary.json")]: { isDir: false, content: "{}", mtimeMs: 200 },
    });
    const fs: FsLike = { ...base, readFileSync: (p, e) => { reads++; return base.readFileSync(p, e); } };
    const out = indexSessions({ fs, grokHome, cwd });
    expect(out.map((e) => e.id)).toEqual(["new", "mid", "old"]);
    expect(reads).toBe(0);
  });

  it("skips dirs without a summary.json", () => {
    const fs = buildFs({
      [dir]: { isDir: true },
      [dirFor("ghost")]: { isDir: true },
      [dirFor("real")]: { isDir: true },
      [path.join(dirFor("real"), "summary.json")]: { isDir: false, content: "{}", mtimeMs: 1 },
    });
    expect(indexSessions({ fs, grokHome, cwd }).map((e) => e.id)).toEqual(["real"]);
  });
});

describe("readSessionEntries", () => {
  const dir = sessionsDirFor(grokHome, cwd);

  function buildTwo(): FsLike {
    return buildFs({
      [dir]: { isDir: true },
      [dirFor("a")]: { isDir: true },
      [dirFor("b")]: { isDir: true },
      [path.join(dirFor("a"), "summary.json")]: {
        isDir: false,
        content: JSON.stringify({
          info: { id: "a", cwd },
          session_summary: "first",
          updated_at: "2026-01-01T00:00:00Z",
          num_messages: 4,
        }),
      },
      [path.join(dirFor("b"), "summary.json")]: {
        isDir: false,
        content: JSON.stringify({
          info: { id: "b", cwd },
          session_summary: "second",
          updated_at: "2026-02-01T00:00:00Z",
          num_messages: 2,
        }),
      },
    });
  }

  it("reads only the requested ids, in the requested order", () => {
    let reads = 0;
    const base = buildTwo();
    const fs: FsLike = { ...base, readFileSync: (p, e) => { reads++; return base.readFileSync(p, e); } };
    const out = readSessionEntries({ fs, grokHome, cwd, ids: ["b"], overrides: {} });
    expect(out.map((e) => e.id)).toEqual(["b"]);
    expect(out[0].displayName).toBe("second");
    expect(reads).toBe(1); // only the one requested id was read
  });

  it("preserves the id order it was given (no internal re-sort)", () => {
    const fs = buildTwo();
    const out = readSessionEntries({ fs, grokHome, cwd, ids: ["a", "b"], overrides: {} });
    expect(out.map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("applies customName overrides", () => {
    const fs = buildTwo();
    const overrides: SessionMetaOverrides = { a: { customName: "Renamed" } };
    const out = readSessionEntries({ fs, grokHome, cwd, ids: ["a"], overrides });
    expect(out[0].displayName).toBe("Renamed");
  });

  it("skips malformed or missing summaries", () => {
    const fs = buildFs({
      [dir]: { isDir: true },
      [dirFor("bad")]: { isDir: true },
      [path.join(dirFor("bad"), "summary.json")]: { isDir: false, content: "{ not json" },
    });
    expect(readSessionEntries({ fs, grokHome, cwd, ids: ["bad", "gone"], overrides: {} })).toEqual([]);
  });
});

describe("deleteSessionDir", () => {
  it("removes the on-disk session directory", () => {
    const sessDir = dirFor("a");
    const fs = buildFs({
      [sessionsDirFor(grokHome, cwd)]: { isDir: true },
      [sessDir]: { isDir: true },
      [path.join(sessDir, "summary.json")]: { isDir: false, content: "{}" },
    });
    deleteSessionDir({ fs, grokHome, cwd, id: "a" });
    expect(fs.existsSync(sessDir)).toBe(false);
  });

  it("is a no-op when the directory is missing", () => {
    const fs = buildFs({});
    expect(() => deleteSessionDir({ fs, grokHome, cwd, id: "missing" })).not.toThrow();
  });
});

describe("clearSessions", () => {
  const dir = sessionsDirFor(grokHome, cwd);

  function buildThree(): FsLike {
    return buildFs({
      [dir]: { isDir: true },
      [dirFor("a")]: { isDir: true },
      [dirFor("b")]: { isDir: true },
      [dirFor("c")]: { isDir: true },
      [path.join(dirFor("a"), "summary.json")]: { isDir: false, content: "{}" },
      [path.join(dirFor("b"), "summary.json")]: { isDir: false, content: "{}" },
      [path.join(dirFor("c"), "summary.json")]: { isDir: false, content: "{}" },
    });
  }

  it("returns [] when the sessions dir does not exist", () => {
    const fs = buildFs({});
    expect(clearSessions({ fs, grokHome, cwd })).toEqual([]);
  });

  it("removes every session dir and returns their ids", () => {
    const fs = buildThree();
    const removed = clearSessions({ fs, grokHome, cwd });
    expect(removed.sort()).toEqual(["a", "b", "c"]);
    expect(fs.existsSync(dirFor("a"))).toBe(false);
    expect(fs.existsSync(dirFor("b"))).toBe(false);
    expect(fs.existsSync(dirFor("c"))).toBe(false);
  });

  it("keeps the exceptId session", () => {
    const fs = buildThree();
    const removed = clearSessions({ fs, grokHome, cwd, exceptId: "b" });
    expect(removed.sort()).toEqual(["a", "c"]);
    expect(fs.existsSync(dirFor("b"))).toBe(true);
    expect(fs.existsSync(dirFor("a"))).toBe(false);
    expect(fs.existsSync(dirFor("c"))).toBe(false);
  });

  it("skips non-directory entries", () => {
    const fs = buildFs({
      [dir]: { isDir: true },
      [dirFor("a")]: { isDir: true },
      [path.join(dirFor("a"), "summary.json")]: { isDir: false, content: "{}" },
      [path.join(dir, "stray.txt")]: { isDir: false, content: "x" },
    });
    const removed = clearSessions({ fs, grokHome, cwd });
    expect(removed).toEqual(["a"]);
  });
});

describe("carrySessionName", () => {
  it("moves a customName from the old id to the new and drops the old entry", () => {
    const overrides: SessionMetaOverrides = { old: { customName: "My renamed session" } };
    const next = carrySessionName(overrides, "old", "new");
    expect(next.old).toBeUndefined();
    expect(next.new).toEqual({ customName: "My renamed session" });
  });

  it("does not mutate the input overrides", () => {
    const overrides: SessionMetaOverrides = { old: { customName: "Keep me" } };
    const next = carrySessionName(overrides, "old", "new");
    expect(overrides.old).toEqual({ customName: "Keep me" });
    expect(next).not.toBe(overrides);
  });

  it("only carries customName, not plans/unread, from the abandoned session", () => {
    const overrides: SessionMetaOverrides = {
      old: { customName: "Named", unread: true, plans: [{ text: "p", verdict: "approved" }] },
    };
    const next = carrySessionName(overrides, "old", "new");
    expect(next.new).toEqual({ customName: "Named" });
  });

  it("merges the carried name into an existing override on the new id", () => {
    const overrides: SessionMetaOverrides = {
      old: { customName: "Carried" },
      new: { unread: true },
    };
    const next = carrySessionName(overrides, "old", "new");
    expect(next.new).toEqual({ unread: true, customName: "Carried" });
  });

  it("just drops the old entry when there is no customName to carry", () => {
    const overrides: SessionMetaOverrides = { old: { unread: true }, other: { customName: "x" } };
    const next = carrySessionName(overrides, "old", "new");
    expect(next.old).toBeUndefined();
    expect(next.new).toBeUndefined();
    expect(next.other).toEqual({ customName: "x" });
  });

  it("drops the old entry even when there is no target id (failed restart)", () => {
    const overrides: SessionMetaOverrides = { old: { customName: "Gone" } };
    const next = carrySessionName(overrides, "old", undefined);
    expect(next.old).toBeUndefined();
    expect(Object.keys(next)).toEqual([]);
  });

  it("treats a whitespace-only customName as nothing to carry", () => {
    const overrides: SessionMetaOverrides = { old: { customName: "   " } };
    const next = carrySessionName(overrides, "old", "new");
    expect(next.new).toBeUndefined();
  });
});
