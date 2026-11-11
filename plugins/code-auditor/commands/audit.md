---
description: 'Run a code audit (scope: "pr" for current branch diff, "full" for the whole codebase)'
argument-hint: '[pr|full]'
---

# Code Audit Command

Requested scope: $ARGUMENTS (default to "pr" if empty)

## Step 1 — Prepare the audit input

If scope is "pr":

- Detect the base branch: use `git symbolic-ref --short refs/remotes/origin/HEAD`
  (e.g. `origin/main`); if it fails, fall back to the first existing of
  `main`, `master`, `develop`
- If the current branch is the base branch itself, or the diff is empty,
  tell the user there is nothing to audit and stop (suggest `full` instead)
- Run `git diff <base>...HEAD --stat` to list the changed files
- Run `git diff <base>...HEAD` to get the full diff
- The audit input is this diff and the list of changed files

If scope is "full":

- The audit input is the entire directory

## Step 2 — Delegate to the auditor agent

Launch the `code-auditor:auditor` agent with the following task:

- Provide it with the audit input prepared in Step 1 (paste the diff
  or the directory scope explicitly in the task description)
- Instruct it to apply the `audit-architecture` skill first,
  then the `audit-security` skill, then the `audit-quality` skill
- Instruct it to return a consolidated report ordered by priority,
  ending with a global verdict (APPROVE / REQUEST_CHANGES)

Do not perform the audit yourself in the main context — always delegate
to the agent so the review stays in an isolated context.

## Step 3 — Present the result

Relay the agent's report to the user as-is, without re-summarizing it.
