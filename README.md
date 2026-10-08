# Codex Game Studios

[English](README.md) | [简体中文](README.zh-CN.md)

A game-development studio template for **Codex**: **50 specialist roles, 77
workflow skills**, studio coordination, engine-aware guidance and **WeChat
mini-game support**. Adapted from [Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)
under MIT, retaining the upstream Git history and author credit.

This repository provides instructions, templates, checks and an isolated starter.
It does not bundle a game engine or guarantee that an AI-generated game is shippable.
It is an independent community port, not an official OpenAI/Anthropic/Tencent product.

## What's included

| Capability | Included |
|---|---|
| Studio roles | 50 native Codex TOML agents: directors, leads, design, programming, art/audio, QA, operations, engine and WeChat specialists |
| Workflows | 77 portable skills: onboarding, design, architecture, stories, review, QA, release and team workflows |
| Coordination | Domain ownership, bounded delegation, conflict escalation and explicit evidence |
| Process weight | Minimal / standard / full rigor, with project and local overrides |
| Engines | Original Godot, Unity and Unreal guidance; WeChat native, Cocos, LayaAir and Unity export routes |
| WeChat | Setup/audit/release skills, platform specialist, native Canvas starter and SDK mock tests |
| Checks | TOML/skill metadata, catalog, Markdown links, shell syntax, JSON and config-helper smoke validation |
| Documentation | Bilingual README, engine/design/production templates and migration guide |

The upstream baseline contains **49 roles and 74 skills**. This port adds one
WeChat specialist and three platform workflows. See the full [skill and role
catalog](docs/CATALOG.md), [migration notes](docs/MIGRATION.md), and [changelog](CHANGELOG.md).

## Quick start

Requirements: current local Codex with standalone TOML custom agents (validated
with CLI 0.148.0), Git, Bash, **Python 3.11+**, and **Node.js 18+** for checks.
Your game engine is separate. WeChat work additionally needs WeChat DevTools;
real-device previews/uploads need an appropriate registered mini-game AppID.

```bash
git clone https://github.com/houxin0010/Codex-Game-Studios.git my-game
cd my-game
python3 tools/validate_studio.py
python3 -m unittest discover -s tests/studio -v
node --test tests/wechat/*.test.js
codex
```

Review/trust the repository using Codex's normal controls, then invoke **`$start`**
in the CLI/IDE chat, or select the skill in the app. Project config loading may
require trust. No global Codex configuration or skills are modified.

Examples to paste into Codex:

```text
$start
$setup-engine godot
$setup-wechat native
$brainstorm a touch-first puzzle game
$create-stories
$dev-story production/epics/<epic>/story-001.md
```

Use `$name` for skills, not Claude slash commands. The placeholder story path
must be replaced by a real generated story. Skills resolve settings explicitly;
commands printed in a skill are not automatically executed by the runtime.

## WeChat mini games

For a quick native demo:

1. Open WeChat DevTools and import **`examples/wechat-minigame`**, selecting **mini game**.
2. Replace `touristappid` in `project.config.json` with your mini-game AppID.
   Tourist mode is only a placeholder and may lack preview/upload or SDK access.
   Do not add an AppSecret.
3. Run it and tap the moving circle. Score persists locally; background pauses
   the loop and resume resets time without creating duplicate loops.
4. Use `$setup-wechat native` to configure your own game, `$wechat-audit` to check
   platform contracts, and `$wechat-release` to prepare actual release evidence.

The starter uses native `wx.createCanvas`, touch events, safe-area layout and DPR.
It is a portrait Canvas game, not a mini program, HTML page or browser DOM shim.
It has no network, login, ads, payment or backend service.

**Cocos Creator / LayaAir / Unity** use their vendor/Tencent export adapters.
The studio guides version pinning and validation; it does not implement an engine
converter. Generic web exports and Godot/Unreal WeChat compatibility are not promised.
See [WeChat guide](docs/wechat/README.md) and [project configuration example](docs/wechat/project.example.yaml).

## Configuration and coordination

`project.yaml` is the game's shared configuration; `project.local.yaml` contains
allowed personal overrides and is ignored by Git. The template starts without an
engine or modes block so onboarding can configure it. `modes.rigor` defaults to
minimal and expands process weight without seeding conflicting leaf defaults.

```text
$settings
$settings modes.rigor=standard
$settings --local modes.review_mode=solo
```

Resolve settings directly when troubleshooting:

```bash
bash .codex/scripts/yaml-helper.sh resolve_config --keys workflow,review_mode,automation,team.size
```

Default spawned concurrency is capped at three. Roles inherit your chosen model,
reasoning effort and client permissions. Only delegate when the user asks or an
invoked skill requests it; 50 roles do not mean 50 running agents. When native
subagents are unavailable, follow role instructions sequentially and disclose it.
Prior authorization for a scoped edit is sufficient; the template does not grant
permission for unrelated commits, uploads or publication.

## Project layout

```text
AGENTS.md                      Project agreements and explicit rule selection
.codex/config.toml             Project concurrency settings
.codex/agents/*.toml           Native Codex role definitions
.codex/docs/, .codex/rules/    On-demand studio references and domain standards
.codex/scripts/                Explicit configuration/artifact helpers
.agents/skills/*/SKILL.md       Portable workflow skills with progressive references
Studio Skill Testing Framework/ Behavioral review catalog and scenarios
docs/wechat/                   Platform guide and sample config
examples/wechat-minigame/      Isolated native starter (import this directory)
tests/wechat/                  Starter SDK mock tests
tools/validate_studio.py        Framework validator
project.yaml                   Shared game config, initially unconfigured
```

Game code roots remain engine-specific: Godot/native `src/`, Unity `Assets/`,
Unreal `Source/`, Cocos `assets/`, LayaAir `src/`. WeChat export output is tracked
separately as `platforms.wechat.game_root`.

## Validation and limits

```bash
python3 tools/validate_studio.py
python3 -m unittest discover -s tests/studio -v
node --test tests/wechat/*.test.js
```

The mock suite checks DPR/safe area, touch/score/storage, frame delta clamping,
hide/show, duplicate resume, SDK info fallback and listener disposal. It does
**not** prove real SDK/device behavior, startup time, performance, backend login,
ads, package upload or platform approval. Inherited behavioral scenarios are
review inputs, not evidence of executed model tests. Run the real game, retain
screenshots/logs, and validate DevTools plus iOS/Android before declaring READY.

Claude-specific automatic hooks, status line, tool allowlists, persistent agent
memory and `@path` imports were not carried over as functioning Codex features.
The port uses explicit reads and checks. See the [runtime mapping](.codex/docs/codex-runtime.md).
No permission bypass or global installation is required.

## Attribution and license

Original project © 2026 Donchitos, [Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios).
Codex/WeChat adaptation © 2026 houxin0010. Both distributed under the [MIT license](LICENSE).
Contributions: [CONTRIBUTING.md](CONTRIBUTING.md). Security: [SECURITY.md](SECURITY.md).

Detailed validation scope: [validation record](docs/VALIDATION.md).
