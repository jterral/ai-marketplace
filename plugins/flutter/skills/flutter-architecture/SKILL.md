---
name: flutter-architecture
description: "Flutter project architecture rules. Use automatically when creating or modifying Dart files, screens, widgets, providers, or repositories. Enforces feature-first structure, widget extraction, Riverpod without code generation, and file placement conventions."
---

# Flutter Architecture

## When to use this skill

Whenever a Flutter task involves creating new files, widgets, screens, providers, or deciding where to place code in the project.

---

## Project structure

```
lib/
├── app/                          # App-level config
│   ├── app.dart                  # MaterialApp / entry point
│   ├── app.style.dart            # Design tokens / style
│   └── app.router.dart           # Navigation / routing
│
├── features/{feature_name}/      # Feature modules
│   ├── application/              # Providers (Riverpod)
│   ├── data/                     # Repositories, data sources
│   ├── domain/                   # Entities, models
│   └── presentation/
│       ├── widgets/              # Feature-specific widgets (ALWAYS here)
│       └── {feature}_screen.dart # Screen file (thin orchestrator)
│
└── shared/                       # Cross-app low-level utilities
    ├── error/
    └── widgets/                  # Only truly shared, low-level components
```

---

## Widget extraction rule

**Never** define widget classes inline in a screen file. Every widget — even small ones — gets its own file in the feature's `presentation/widgets/` folder.

### Bad: widget defined in the screen file

```dart
// ❌ city_selection_screen.dart — 200+ lines, hard to navigate
class CitySelectionScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(children: [
      _CityHeader(...),  // private widget buried at line 150
      _CityList(...),
    ]);
  }
}

class _CityHeader extends StatelessWidget { ... }  // 40 lines
class _CityList extends StatelessWidget { ... }    // 60 lines
```

### Good: widgets extracted to dedicated files

```dart
// ✅ city_selection_screen.dart — thin, only orchestration
import 'widgets/city_header.dart';
import 'widgets/city_list.dart';

class CitySelectionScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(children: [
      CityHeader(...),
      CityList(...),
    ]);
  }
}
```

```dart
// ✅ presentation/widgets/city_header.dart
class CityHeader extends StatelessWidget { ... }
```

```dart
// ✅ presentation/widgets/city_list.dart
class CityList extends StatelessWidget { ... }
```

### When to put a widget in `shared/widgets/`

Only when **all** of these are true:

- Used by 2+ features
- Generic enough to have no feature-specific logic
- Low-level UI primitive (button, card, popup, toast, spinner…)

If in doubt → keep it in the feature's `presentation/widgets/`. Move to `shared/` later if reuse actually happens.

---

## Screen files: thin orchestrators

A screen file should:

- Import and compose widgets from `widgets/`
- Watch providers / manage state
- Handle navigation

A screen file should **not**:

- Define widget classes (extract them)
- Contain complex layout logic (extract to a widget)
- Exceed ~80 lines

---

## Riverpod: no code generation

This project uses **Riverpod without `riverpod_generator`**. Do not use `@riverpod` annotations or `part` files.

### Bad: generated provider

```dart
// ❌ Do not use code generation
import 'package:riverpod_annotation/riverpod_annotation.dart';
part 'city_provider.g.dart';

@riverpod
class CityNotifier extends _$CityNotifier { ... }
```

### Good: hand-written provider

```dart
// ✅ Hand-written, explicit, readable
final cityProvider = StateNotifierProvider<CityNotifier, CityState>((ref) {
  return CityNotifier(ref.watch(cityRepositoryProvider));
});

class CityNotifier extends StateNotifier<CityState> {
  CityNotifier(this._repository) : super(const CityState.loading());
  final CityRepository _repository;
  // ...
}
```

### Provider file placement

Providers live in `features/{feature}/application/`:

```
features/city_selection/application/
├── city_selection_provider.dart
└── default_city_provider.dart
```

---

## Naming conventions

| Type                  | Pattern                            | Example                             |
| --------------------- | ---------------------------------- | ----------------------------------- |
| Screen                | `{feature}_screen.dart`            | `city_selection_screen.dart`        |
| Widget                | `{descriptive_name}.dart`          | `city_card.dart`, `city_empty.dart` |
| Provider              | `{feature}_provider.dart`          | `city_selection_provider.dart`      |
| Repository (abstract) | `{entity}_repository.dart`         | `city_repository.dart`              |
| Repository (impl)     | `default_{entity}_repository.dart` | `default_city_repository.dart`      |
| Entity                | `{entity}.dart`                    | `city.dart`                         |
| Entity (impl)         | `default_{entity}.dart`            | `default_city.dart`                 |

---

## Gotchas

- **Never** create a widget as a private class (`_MyWidget`) in a screen file "because it's small" — extract it. File count is cheap; cognitive load in a 300-line screen is expensive.
- **Never** add `riverpod_generator`, `riverpod_annotation`, or `build_runner` dependencies for Riverpod. Hand-written providers are the project standard.
- **`shared/widgets/` is not a dump** — only truly generic, reusable, low-level components belong there. A `CityCard` is feature-specific even if it seems generic.
- **One public widget per file** — a file can contain private helpers used by that widget, but not multiple public widgets.
- **Screens are not widgets** — a screen is a route destination. Don't nest screens inside other screens; compose with widgets instead.
