# AI Marketplace

A Claude Code plugin marketplace of reusable skills, rules, commands, and agents: git workflow, code auditing, API testing, and .NET and Flutter conventions.

## 📋 Overview

This repository provides a curated set of skills, consumable two ways:

- **Claude Code plugins**: five plugins (git-workflow, code-auditor, bruno, dotnet, flutter) served from this repo's own marketplace
- **APM packages**: each skill can be pulled individually via [APM (Agent Package Manager)](https://github.com/github/awesome-copilot)

## 🎯 Available plugins

| Plugin         | Description                                                          | Docs                              |
| -------------- | -------------------------------------------------------------------- | --------------------------------- |
| `bruno`        | Run Bruno API tests and generate `.bru` request files                | [Plugin](./plugins/bruno/)        |
| `code-auditor` | Architecture, security and quality audits via `/audit` and `auditor` | [Plugin](./plugins/code-auditor/) |
| `dotnet`       | C# and .NET coding conventions                                       | [Plugin](./plugins/dotnet/)       |
| `flutter`      | Feature-first architecture, Apple-compliant styling, Orient UI usage | [Plugin](./plugins/flutter/)      |
| `git-workflow` | Branch naming, Conventional Commits and pull request formatting      | [Plugin](./plugins/git-workflow/) |

### 🧪 bruno

| Skill                                                                | Description                   |
| -------------------------------------------------------------------- | ----------------------------- |
| [`bruno-e2e`](./plugins/bruno/skills/bruno-e2e/SKILL.md)             | Run Bruno API tests           |
| [`bruno-generator`](./plugins/bruno/skills/bruno-generator/SKILL.md) | Generate `.bru` request files |

### 🔍 code-auditor

| Item                                                                              | Description                                         |
| --------------------------------------------------------------------------------- | --------------------------------------------------- |
| [`/audit`](./plugins/code-auditor/commands/audit.md)                              | Run an audit on the current PR or the full codebase |
| [`auditor`](./plugins/code-auditor/agents/auditor.md)                             | Autonomous read-only audit agent                    |
| [`audit-architecture`](./plugins/code-auditor/skills/audit-architecture/SKILL.md) | Tech-agnostic Clean Architecture audit              |
| [`audit-security`](./plugins/code-auditor/skills/audit-security/SKILL.md)         | Secret leak and vulnerability detection             |
| [`audit-quality`](./plugins/code-auditor/skills/audit-quality/SKILL.md)           | Demanding code quality audit                        |

### 🟣 dotnet

| Skill                                                                       | Description                    |
| --------------------------------------------------------------------------- | ------------------------------ |
| [`csharp-conventions`](./plugins/dotnet/skills/csharp-conventions/SKILL.md) | C# and .NET coding conventions |

### 🦋 flutter

| Skill                                                                            | Description                                                       |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [`flutter-architecture`](./plugins/flutter/skills/flutter-architecture/SKILL.md) | Enforce Flutter architecture best practices                       |
| [`flutter-style`](./plugins/flutter/skills/flutter-style/SKILL.md)               | Enforce Flutter styling conventions                               |
| [`flutter-orient-ui`](./plugins/flutter/skills/flutter-orient-ui/SKILL.md)       | Feature-first structure, Apple-compliant styling, Orient UI usage |

### 🔖 git-workflow

| Skill                                                                                               | Description                                    |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [`git-branch-naming`](./plugins/git-workflow/skills/git-branch-naming/SKILL.md)                     | Standardized Git practices for branch naming   |
| [`git-conventional-commit`](./plugins/git-workflow/skills/git-conventional-commit/SKILL.md)         | Standardized Git practices for commit messages |
| [`git-pull-request-formatting`](./plugins/git-workflow/skills/git-pull-request-formatting/SKILL.md) | Standardized Git practices for PR formatting   |

## 📁 Project Structure

```txt
ai-marketplace/
├── plugins/                         # All plugins (each self-contained)
│   ├── bruno/
│   │   ├── .claude-plugin/plugin.json
│   │   └── skills/bruno-e2e/, bruno-generator/
│   ├── code-auditor/
│   │   ├── .claude-plugin/plugin.json
│   │   ├── commands/audit.md
│   │   ├── agents/auditor.md
│   │   └── skills/audit-architecture/, audit-security/, audit-quality/
│   ├── dotnet/
│   │   ├── .claude-plugin/plugin.json
│   │   └── skills/csharp-conventions/
│   ├── flutter/
│   │   ├── .claude-plugin/plugin.json
│   │   └── skills/flutter-architecture/, flutter-orient-ui/, flutter-style/
│   └── git-workflow/
│       ├── .claude-plugin/plugin.json
│       └── skills/git-branch-naming/, git-conventional-commit/, git-pull-request-formatting/
├── .claude-plugin/
│   └── marketplace.json             # Claude Code marketplace (5 plugins)
└── ...
```

## 🔌 Use as Claude Code Plugins

This repository is a [Claude Code plugin marketplace](https://docs.claude.com/en/docs/claude-code/plugins) exposing five plugins that can be installed independently. From a Claude Code session:

```txt
/plugin marketplace add jterral/ai-marketplace
/plugin install git-workflow@ai-marketplace
/plugin install code-auditor@ai-marketplace
/plugin install bruno@ai-marketplace
/plugin install dotnet@ai-marketplace
/plugin install flutter@ai-marketplace
```

Once installed, skills are namespaced by plugin (e.g. `git-workflow:git-conventional-commit`, `code-auditor:auditor`).

## 📦 Use with APM

Skills follow the [APM (Agent Package Manager)](https://microsoft.github.io/apm/) layout and can be pulled individually into any project's `apm.yml`:

```yaml
dependencies:
  apm:
    - jterral/ai-marketplace/plugins/git-workflow
    - jterral/ai-marketplace/plugins/dotnet
```

Then run `apm update` to install them.

## 🤝 Contributing

When contributing to this project:

1. Follow [Conventional Commits](plugins/git-workflow/skills/git-conventional-commit/SKILL.md) for all commits
2. Follow established code quality standards
3. Update documentation as needed

## 📄 License

See [LICENSE](LICENSE) file for full details.

## 🔗 Resources

- [Claude Code Plugins Documentation](https://docs.claude.com/en/docs/claude-code/plugins)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [mise Documentation](https://mise.jdx.dev/)
- [GitVersion Documentation](https://gitversion.net/)
