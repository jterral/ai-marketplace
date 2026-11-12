#!/usr/bin/env node
// Validates the marketplace structure. Dependency-free: runs with any Node >= 18.
// Usage: node scripts/validate-marketplace.mjs

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const fail = (file, message) => errors.push(`${relative(root, file) || "."}: ${message}`);
const read = (file) => readFileSync(file, "utf8");
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const subdirs = (p) => (isDir(p) ? readdirSync(p).filter((n) => isDir(join(p, n))) : []);

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (e) {
    fail(file, `invalid JSON (${e.message})`);
    return null;
  }
}

// Minimal frontmatter parser: top-level `key: value` pairs, with support for
// folded/literal block scalars (`>` / `|`). Enough for name/description checks.
function frontmatter(file) {
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

// --- Marketplace manifest ---------------------------------------------------

const marketplaceFile = join(root, ".claude-plugin", "marketplace.json");
const marketplace = existsSync(marketplaceFile) ? readJson(marketplaceFile) : (fail(marketplaceFile, "missing"), null);
const plugins = marketplace?.plugins ?? [];
if (marketplace && !marketplace.name) fail(marketplaceFile, 'missing "name"');
if (marketplace && plugins.length === 0) fail(marketplaceFile, 'no "plugins" declared');

const declared = new Set();
const allSkills = []; // { plugin, name }

for (const entry of plugins) {
  const label = `plugin "${entry.name}"`;
  if (!entry.name) fail(marketplaceFile, 'a plugin entry has no "name"');
  if (declared.has(entry.name)) fail(marketplaceFile, `${label} declared twice`);
  declared.add(entry.name);
  if (!entry.description) fail(marketplaceFile, `${label} has no description`);

  if (typeof entry.source !== "string" || !entry.source.startsWith("./")) {
    fail(marketplaceFile, `${label} source must be a relative path starting with "./"`);
    continue;
  }
  const dir = resolve(root, entry.source);
  if (!isDir(dir)) {
    fail(marketplaceFile, `${label} source "${entry.source}" does not exist`);
    continue;
  }

  // --- plugin.json ---
  const manifestFile = join(dir, ".claude-plugin", "plugin.json");
  if (!existsSync(manifestFile)) {
    fail(manifestFile, "missing");
  } else {
    const manifest = readJson(manifestFile);
    if (manifest) {
      if (manifest.name !== entry.name) fail(manifestFile, `name "${manifest.name}" does not match marketplace entry "${entry.name}"`);
      if (!manifest.description) fail(manifestFile, "missing description");
    }
  }
  if (dir.split(sep).pop() !== entry.name) fail(dir, `directory name does not match plugin name "${entry.name}"`);

  // --- skills ---
  for (const skill of subdirs(join(dir, "skills"))) {
    const file = join(dir, "skills", skill, "SKILL.md");
    if (!existsSync(file)) {
      fail(join(dir, "skills", skill), "missing SKILL.md");
      continue;
    }
    const fm = frontmatter(file);
    if (!fm) {
      fail(file, "missing frontmatter");
      continue;
    }
    if (fm.name !== skill) fail(file, `frontmatter name "${fm.name}" does not match directory "${skill}"`);
    if (!fm.description) fail(file, "missing description");
    else if (fm.description.length > 1024) fail(file, `description is ${fm.description.length} chars (max 1024)`);
    allSkills.push({ plugin: entry.name, name: skill });
  }

  // --- commands & agents ---
  for (const kind of ["commands", "agents"]) {
    const folder = join(dir, kind);
    if (!isDir(folder)) continue;
    for (const f of readdirSync(folder).filter((n) => n.endsWith(".md"))) {
      const file = join(folder, f);
      const fm = frontmatter(file);
      if (!fm) fail(file, "missing frontmatter");
      else if (!fm.description) fail(file, "missing description");
      else if (kind === "agents" && fm.name !== f.replace(/\.md$/, "")) fail(file, `agent name "${fm.name}" does not match file name`);
    }
  }
}

// Plugin directories not declared in the marketplace are never published.
for (const dirName of subdirs(join(root, "plugins"))) {
  if (!declared.has(dirName)) fail(join(root, "plugins", dirName), "plugin directory is not declared in marketplace.json");
}

// --- Documentation drift ------------------------------------------------------

for (const docName of ["README.md", "CLAUDE.md"]) {
  const docFile = join(root, docName);
  if (!existsSync(docFile)) continue;
  const doc = read(docFile);
  for (const name of declared) if (!doc.includes(name)) fail(docFile, `plugin "${name}" is not mentioned`);
  for (const { name } of allSkills) if (!doc.includes(name)) fail(docFile, `skill "${name}" is not mentioned`);

  // Relative markdown links must resolve.
  for (const m of doc.matchAll(/\]\((?!https?:|#|mailto:)([^)\s#]+)(?:#[^)]*)?\)/g)) {
    if (!existsSync(resolve(dirname(docFile), m[1]))) fail(docFile, `broken link "${m[1]}"`);
  }
}

// --- Result -------------------------------------------------------------------

if (errors.length > 0) {
  console.error(`Marketplace validation failed (${errors.length} problem${errors.length > 1 ? "s" : ""}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Marketplace valid: ${declared.size} plugins, ${allSkills.length} skills.`);
