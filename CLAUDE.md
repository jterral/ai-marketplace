# AI Marketplace — Claude Code Guide

## Project Overview

The **AI Marketplace** is a Claude Code plugin marketplace: a centralized collection of skills, rules, commands, and agents. It provides standardized guidance for code review, workflow automation, development practices, and quality standards, designed to be reusable across multiple projects (.NET, Flutter, ...).

## Directory Structure

- `plugins/{name}/` — one directory per plugin: `.claude-plugin/plugin.json`, plus `skills/`, `commands/` and `agents/` as needed (auto-discovered)
- `.claude-plugin/marketplace.json` — the marketplace manifest; **single source of truth** for the plugin list
- `scripts/` — `validate-marketplace.mjs` (structure checks) and `generate-docs.mjs` (generates the plugin catalog in `README.md`)
- `.github/workflows/` — CI/CD pipelines
- `apm.yml`, `mise.toml` — dependency and tool version management

The list of plugins, skills, commands and agents is **not** maintained by hand anywhere: browse `plugins/`, or read the generated catalog in `README.md`.

## Skill Framework

### What is a Skill?

A skill is a reusable, self-contained capability that can be invoked from Claude Code or GitHub Copilot. Each skill is defined as a `SKILL.md` file containing:

- **YAML Frontmatter**: Metadata about the skill
- **Content**: Step-by-step instructions or guidelines

### SKILL.md Format

```yaml
---
name: skill-identifier
description: Brief description of what the skill does and when to use it
---
# Step-by-step instructions or guidelines here
```

### Adding to a plugin

Skills, commands and agents are auto-discovered from their plugin directory. When adding a skill, no change to `marketplace.json` is needed. A new plugin needs a `plugins/{name}/.claude-plugin/plugin.json` and an entry in `marketplace.json` (`source: ./plugins/{name}`).

After any change to a plugin, run `node scripts/generate-docs.mjs` to refresh the `README.md` catalog.

### Conventions

#### English-Only Content

All skill content must be in English. Non-English text is not permitted.

#### Scope

- **Commits**: Use functional `scope` (e.g., `feat(auth): add login`)
  - File: `plugins/git-workflow/skills/git-conventional-commit/SKILL.md`
  - Why: Helps group related changes by domain
- **Pull Requests**: Use functional `scope` (e.g., `feat(auth): add login`)
  - File: `plugins/git-workflow/skills/git-pull-request-formatting/SKILL.md`
  - Why: Helps group related changes by domain

Both patterns are valid; use the appropriate one based on context.

#### Prerequisites

Each skill should document:

- Required CLI tools (e.g., `bru`, `dotnet`, `git`)
- Environment variables or configuration
- Access requirements (Jira credentials, etc.)

## Contributing

### Adding a New Skill

1. Choose the relevant plugin under `plugins/{plugin-name}/skills/`
2. Create a new directory: `plugins/{plugin-name}/skills/{skill-name}/`
3. Add `SKILL.md` with frontmatter and content (the first sentence of the `description` appears in the generated README catalog)
4. Use this template:

```yaml
---
name: skill-name
description: One-line description of the skill's purpose and when to use it
---

## Overview
Brief explanation of what the skill does and when to use it.

## Prerequisites
- CLI/tool requirements
- Environment setup
- Access requirements

## Steps
1. Step one
2. Step two
...
```

1. Ensure content is English-only
2. Test the skill in Claude Code
3. Run `node scripts/validate-marketplace.mjs` and `node scripts/generate-docs.mjs`
4. Create a PR with your new skill

### Updating Dependencies

AI Marketplace uses APM (Agent Package Manager) to pull base instructions from `github/awesome-copilot`:

```bash
apm update  # Update dependencies from apm.yml
```

Changes are tracked in `apm.lock.yaml`.

## Tooling

### Pre-commit Hooks

Conventional Commits are enforced via pre-commit hooks (`.pre-commit-config.yaml`):

```bash
pre-commit install      # Install hooks
pre-commit run --all    # Validate all files
```

### Tool Versions

Managed via `mise.toml`:

```bash
mise install            # Install all tools from mise.toml
mise sync               # Update tool versions
```

### CI/CD

GitHub Actions workflows in `.github/workflows/`:

- `ci.yml` — On pull requests: run pre-commit hooks, validate the marketplace and check that the README catalog is up to date
- `pr-lint.yml` — Enforce conventional commits on PRs
- `release.yml` — Automated releases

## Validation

### SKILL.md Metadata Schema

All `SKILL.md` files must include:

- `name` — Kebab-case identifier matching directory name
- `description` — Concise one-line description stating what the skill does and when to use it

Optional fields:

- `license` — Reference to license terms or SPDX identifier
- `allowed-tools` — Restrict which tools are available while the skill is active (use sparingly)

### Pre-publication Checklist

- [ ] Content is English-only (no non-English text)
- [ ] File is named `SKILL.md` (not `README.md`)
- [ ] Frontmatter includes: `name`, `description`
- [ ] `name` matches directory name (kebab-case)
- [ ] Prerequisites section included (if applicable)
- [ ] Steps are numbered and clear
- [ ] Examples provided where helpful
- [ ] No console credentials or secrets included
- [ ] No French or other non-English content

## Maintenance

### Audit & Review

This marketplace undergoes regular reviews to:

- Verify all skills use English-only content
- Remove duplicate files and consolidate utilities
- Update documentation for directory structure changes
- Standardize metadata formats
- Ensure prerequisites are clearly documented

### Troubleshooting

**Skill not appearing in Claude Code?**

- Check skill `name` is correct (kebab-case) and matches the directory name
- Verify file is at `skills/{name}/SKILL.md`
- Ensure the `description` states when to use the skill (it drives automatic activation)

## Related Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Claude Code Plugins Documentation](https://docs.claude.com/en/docs/claude-code/plugins)
- [APM (Agent Package Manager)](https://github.com/github/awesome-copilot)
