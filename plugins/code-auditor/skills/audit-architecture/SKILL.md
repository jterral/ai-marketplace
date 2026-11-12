---
name: audit-architecture
description: Technology-agnostic Clean Architecture audit checking layer boundaries, dependency direction, domain isolation, and coupling. Part of the /audit workflow, applied by the code-auditor agent first; not for ad-hoc reviews.
---

# Architecture Audit Skill

## Overview

Audit code structure against Clean Architecture principles without assuming any specific language or framework. Findings must be based on observed dependencies (imports, references, folder structure), not on naming alone.

## When to Use This Skill

- Running as part of `/audit` on a PR diff or a codebase, for structural and layering violations
- Assessing whether business logic is properly isolated from frameworks and transport
- Evaluating coupling, cohesion, and dependency direction before a merge

## Core Rules to Verify

### 1. The Dependency Rule

Dependencies must point inward, toward the domain:

```txt
transport/UI → application/use-cases → domain
infrastructure → application/use-cases → domain
```

- The domain (entities, business rules) depends on **nothing** outside itself
- Use cases depend only on the domain and on abstractions (ports/interfaces)
- Infrastructure (DB, HTTP clients, messaging, file system) implements those abstractions — it is depended *upon* only through interfaces
- Flag any import/reference from domain or use-case code to a framework, ORM, HTTP library, or vendor SDK

### 2. Domain Isolation

- Entities and business rules contain no persistence annotations, serialization attributes, or framework base classes
- Domain types are not reused as transport DTOs or database models when that couples them to external concerns
- Business invariants live in the domain, not in controllers, handlers, or UI code

### 3. Boundaries and Contracts

- Layers communicate through explicit interfaces (ports) implemented by adapters
- Inversion of dependency: the inner layer owns the interface, the outer layer implements it
- Data crossing a boundary is mapped (DTO ↔ domain), not leaked raw

## Detection Heuristics (Language-Agnostic)

Use Glob/Grep on structure and imports; adapt patterns to the language found:

1. **Map the layers**: infer them from the folder structure (e.g., `domain/`, `core/`, `application/`, `usecases/`, `infrastructure/`, `api/`, `controllers/`, `ui/`, `data/`). If no layering is visible at all, report it as a finding.
2. **Scan inner-layer imports**: grep import/using/require/include statements in domain and use-case folders; flag any reference to frameworks, ORMs, HTTP, or outer-layer namespaces.
3. **Locate business logic**: look in controllers/handlers/endpoints/widgets for conditionals, calculations, or state transitions that encode business rules — these belong in the domain or a use case.
4. **Check persistence coupling**: entities carrying ORM annotations/attributes, queries embedded in domain code, repositories returning ORM types instead of domain types.
5. **Spot god classes/modules**: files mixing many responsibilities (transport + validation + business rules + persistence), oversized classes that several layers depend on.
6. **Trace one feature end-to-end**: pick a representative flow and verify each hop crosses a boundary through an abstraction.

## Severity Guidance

- 🔴 Critical: dependency pointing outward from domain/use cases; business rules living in transport or infrastructure code
- 🟠 Warning: missing abstraction at a boundary, domain types leaked as API contracts, persistence details bleeding into use cases
- 🟡 Suggestion: unclear layer naming, low cohesion, opportunistic refactoring toward clearer boundaries

## Gotchas

- **Do not enforce folder names.** Clean Architecture is about dependency direction, not directory labels — a repo may use hexagonal, onion, or feature-first layouts and still comply.
- **Small projects may legitimately collapse layers.** Flag missing layering as a finding only when the codebase size or the diff complexity justifies it; otherwise note it as a suggestion.
- **Framework code at the edges is normal.** Controllers, ORM configs, and DI wiring are *supposed* to know about frameworks — only flag framework knowledge that crosses into the inner layers.

## Output

For each finding: `file:line`, the violated rule, the observed dependency or misplaced logic, and a concrete relocation/abstraction recommendation.
