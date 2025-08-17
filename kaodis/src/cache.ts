import fs from "fs";
import path from "path";

function ensureDir(p: string) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function debounce(fn: () => void, ms: number) {
  let t: NodeJS.Timeout | null = null;
  return () => {
    if (t) clearTimeout(t);
    t = setTimeout(fn, ms);
    if (t.unref) t.unref();
  };
}

export class Cache {
  private store: Record<string, any> = {};
  private file: string;
  private saveNow: () => void;

  constructor(file: string, autosaveMs = 150) {
    this.file = file;
    this.saveNow = debounce(() => this._persist(), autosaveMs);
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.file)) {
        const txt = fs.readFileSync(this.file, "utf-8");
        this.store = txt ? JSON.parse(txt) : {};
        console.log(`Cache restored from ${this.file}`);
      } else {
        this.store = {};
      }
    } catch (e) {
      console.error("Failed to load cache file:", e);
      this.store = {};
    }
  }

  private _persist() {
    try {
      ensureDir(this.file);
      fs.writeFileSync(this.file, JSON.stringify(this.store, null, 2));
      console.log(`Cache persisted to ${this.file}`);
    } catch (e) {
      console.error("Failed to write cache file:", e);
    }
  }

  /** Force sync save (used on shutdown) */
  save() {
    this._persist();
  }

  set(key: string, value: any) {
    this.store[key] = value;
    this.saveNow();
  }

  get(key: string): any | undefined {
    return this.store[key];
  }

  delete(key: string): boolean {
    const existed = key in this.store;
    if (existed) {
      delete this.store[key];
      this.saveNow();
    }
    return existed;
  }

  clear() {
    this.store = {};
    this.saveNow();
  }

  keys(): string[] {
    return Object.keys(this.store);
  }
}
