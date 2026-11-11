// Shared helpers for the marketplace scripts. Dependency-free (Node >= 18).

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const read = (file) => readFileSync(file, "utf8");
export const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
export const subdirs = (p) => (isDir(p) ? readdirSync(p).filter((n) => isDir(join(p, n))).sort() : []);
export const markdownFiles = (p) => (isDir(p) ? readdirSync(p).filter((n) => n.endsWith(".md")).sort() : []);

// Minimal frontmatter parser: top-level `key: value` pairs, with support for
// folded/literal block scalars (`>` / `|`). Enough for name/description checks.
export function frontmatter(file) {
  const text = read(file).replace(/\r\n/g, "\n");
  const match = text.match(/^---\n([\s\S]*?)\n---(\n|$)/);
  if (!match) return null;
  const fields = {};
  const lines = match[1].split("\n");
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (/^[>|][+-]?$/.test(value)) {
      const block = [];
      while (i + 1 < lines.length && /^\s+\S|^\s*$/.test(lines[i + 1])) block.push(lines[++i].trim());
      value = block.join(" ").trim();
    }
    fields[kv[1]] = value.replace(/^(['"])(.*)\1$/, "$2");
  }
  return fields;
}

export function readJson(file) {
  return JSON.parse(read(file));
}

// Everything the generated docs are derived from: marketplace.json for the plugin
// list, and the plugin directories for skills, commands and agents.
export function loadCatalog() {
  const marketplace = readJson(join(root, ".claude-plugin", "marketplace.json"));
  const plugins = marketplace.plugins.map((entry) => {
    const dir = resolve(root, entry.source);
    const skills = subdirs(join(dir, "skills")).map((name) => ({
      name,
      description: frontmatter(join(dir, "skills", name, "SKILL.md"))?.description ?? "",
    }));
    const commands = markdownFiles(join(dir, "commands")).map((f) => ({
      name: f.replace(/\.md$/, ""),
      description: frontmatter(join(dir, "commands", f))?.description ?? "",
    }));
    const agents = markdownFiles(join(dir, "agents")).map((f) => ({
      name: f.replace(/\.md$/, ""),
      description: frontmatter(join(dir, "agents", f))?.description ?? "",
    }));
    return { name: entry.name, description: entry.description, source: entry.source, skills, commands, agents };
  });
  return { marketplaceName: marketplace.name, plugins };
}
