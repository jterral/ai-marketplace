---
name: audit-security
description: Security audit detecting secret leaks, sensitive data in logs, injection risks, missing input validation, and authn/authz gaps. Part of the /audit workflow, applied by the code-auditor agent after the architecture audit; not for ad-hoc reviews.
---

# Security Audit Skill

## Overview

Detect secret leaks and common vulnerabilities in a diff or a codebase. Prioritize leaks: a committed credential is always a critical finding, even in test or sample files.

## When to Use This Skill

- Reviewing a PR diff before merge for leaked credentials or new vulnerabilities
- Sweeping a codebase for hardcoded secrets, injection risks, or unsafe logging
- Verifying that configuration and infrastructure files do not expose sensitive values

## 1. Secret & Credential Leaks (highest priority)

Grep for high-confidence secret patterns, then review matches in context:

| Pattern                                                                   | Indicates                                |
| ------------------------------------------------------------------------- | ---------------------------------------- |
| `AKIA[0-9A-Z]{16}`                                                        | AWS access key ID                        |
| `ghp_[A-Za-z0-9]{36}`, `github_pat_`                                      | GitHub personal access token             |
| `sk_live_`, `sk_test_`, `rk_live_`                                        | Stripe keys                              |
| `xox[baprs]-`                                                             | Slack tokens                             |
| `eyJ[A-Za-z0-9_-]+\.eyJ`                                                  | Hardcoded JWT                            |
| `-----BEGIN( RSA\| EC\| OPENSSH)? PRIVATE KEY`                            | Private key material                     |
| `(password\|passwd\|pwd\|secret\|token\|api[_-]?key)\s*[:=]\s*["'].+["']` | Generic hardcoded credential             |
| `(Server\|Data Source\|Host)=.*(Password\|Pwd)=`                          | Connection string with embedded password |
| `https?://[^/\s:]+:[^@\s]+@`                                              | Credentials embedded in URL              |

Also check:

- Committed files that should not exist in the repo: `.env`, `.env.*`, `*.pem`, `*.pfx`, `*.p12`, `*.key`, `id_rsa*`, kubeconfig, cloud credential files
- Secrets in CI/CD files, Dockerfiles (`ENV`/`ARG` with credentials), IaC files (Terraform variables with defaults), and scripts
- Real-looking secrets in test fixtures, sample configs, and documentation
- In a PR diff, secrets **removed** by the change: the value is still in git history — recommend rotation, not just deletion

**Never copy a discovered secret value into the report.** Reference it as `file:line` with the pattern type, and always recommend rotation + removal from history.

## 2. Sensitive Data Exposure

- Passwords, tokens, session IDs, or PII written to logs, traces, or error messages
- Verbose error responses leaking stack traces, SQL, or internal paths to clients
- Sensitive fields serialized into API responses unintentionally (missing DTO filtering)

## 3. Injection & Input Validation

- SQL/NoSQL built by string concatenation or interpolation instead of parameterized queries
- Shell/command execution with unsanitized input
- Path traversal: user input used in file paths without normalization checks
- Unvalidated input at trust boundaries (API endpoints, message consumers, file imports)
- Unsafe deserialization of untrusted data

## 4. Authentication & Authorization

- Endpoints or handlers missing authentication checks present on their siblings
- Authorization checked on the client/UI side only, or missing resource-ownership checks (IDOR)
- Security-sensitive operations without audit logging

## 5. Cryptography

- Custom/homemade crypto, weak algorithms (MD5/SHA1 for passwords, ECB mode), hardcoded IVs or salts
- Passwords stored with fast hashes instead of bcrypt/scrypt/argon2
- Disabled TLS verification (`verify=false`, `InsecureSkipVerify`, trust-all certs)

## Severity Guidance

- 🔴 Critical: any leaked secret, injection vector, missing authn on a sensitive endpoint, disabled TLS verification
- 🟠 Warning: sensitive data in logs, weak crypto, missing validation on a trust boundary
- 🟡 Suggestion: hardening opportunities, missing security headers, defense in depth

## Gotchas

- **A removed secret is still a finding.** Git history keeps it; rotation is the only fix.
- **Test-mode keys are lower severity.** A `sk_test_` key or a credential for a throwaway local database is 🟠 Warning, not 🔴 Critical, unless it also grants access to real data.
- **Placeholders are fine — verify before flagging.** `<your-api-key>`, `changeme`, obvious dummy values are not leaks; high-entropy realistic strings in fixtures are.
- **Do not flag parameterized queries or vetted crypto libraries** just because keywords like `password` appear nearby — confirm the actual data flow first.

## Output

For each finding: `file:line`, the issue type, the evidence (without secret values), and a concrete remediation (rotate, parameterize, validate, move to secret store, etc.).
