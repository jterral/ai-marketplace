---
name: git-conventional-commit
description: Conventional Commits format for commit messages, including scope and breaking changes. Use when writing, amending, or reviewing a git commit message.
---

## Prerequisites

- **Git**: Must be installed and configured with `user.name` and `user.email`
- **Pre-commit hooks** *(optional)*: If `.pre-commit-config.yaml` exists, hooks will enforce the type list automatically

## Format

- `<type>(<scope>): <description>`
- **Scope is mandatory** — never omit it
- Scope: a functional noun describing the area of the codebase affected (e.g., `auth`, `parser`, `ci`)
- Description: imperative, lowercase, no period

## Types

Only these five types are allowed — never use any other (`perf`, `ci`, `test`, `build`, `style`, `revert`...):

| Type       | Use for                             | Version bump |
| ---------- | ----------------------------------- | ------------ |
| `feat`     | New functionality                   | minor        |
| `fix`      | Bug fix                             | patch        |
| `chore`    | Maintenance, tooling, CI, deps      | none         |
| `docs`     | Documentation only                  | none         |
| `refactor` | Code change without behavior change | none         |

Branch names use the same types, except `feat` is spelled `feature` (see `git-branch-naming`).

## Breaking changes

A breaking change triggers a **major** version bump. Signal it in one of two ways:

- Add `!` after the scope: `feat(api)!: remove the v1 endpoints`
- Add a `BREAKING CHANGE:` footer, separated from the description by a blank line:

```txt
feat(api): rename the user endpoint

BREAKING CHANGE: /users/{id} is now /accounts/{id}
```

Never mark a change as breaking unless existing consumers must change something to keep working.

## Examples

- `feat(parser): add ability to parse arrays`
- `fix(auth): correct password validation`
- `chore(ci): migrate to github actions`
- `docs(api): update endpoint documentation`
- `refactor(database): simplify connection pooling`
- `feat(api)!: remove the v1 endpoints`
