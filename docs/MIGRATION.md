# Claude Code → Codex migration

Upstream: https://github.com/Donchitos/Claude-Code-Game-Studios
Baseline commit: be8993bbc5a1f016bc770b2846ce06272d284526 (main, 2026-10-09).
The MIT license and upstream Git history are preserved; this is an independent
adaptation, not an official OpenAI, Anthropic or Tencent product.

## What the upstream provides

49 director/lead/specialist roles, 74 reusable workflows, seven production phases,
three rigor tiers, engine-aware source roots, design/architecture templates,
gate verdict contracts, QA evidence protocols and a skill testing catalog.
It is a studio instruction template, not a bundled engine or autonomous game maker.
The port keeps these domain responsibilities and progressive reference files.

## Port decisions

Native project-scoped TOML roles replace agent Markdown metadata; portable skills
live under .agents/skills; AGENTS.md explicitly reads rules and references.
Dynamic !-backtick shell blocks become explicit steps; model aliases and tool
allowlists are removed. Roles inherit the parent model and client permissions.
Original automatic hook, statusline, memory and team-session features are not
claimed. Configuration/artifact helpers remain explicit and have smoke checks.
See .codex/docs/codex-runtime.md for the capability mapping and official sources.

WeChat adds one platform specialist and three workflows (setup, audit, release),
a native Canvas example and tests. Engine enum/root resolution includes WeChat,
Cocos and LayaAir; platform selection also works with Unity's existing engine.
Native is the dependency-free baseline; engine exports need their vendor adapter
and real WeChat validation. No generic DOM shim or payment/backend is invented.

## Acceptance and commands

- All 50 role TOMLs parse; all 77 portable skills have name/description.
- No active Claude paths, shell preprocessing or model aliases survive.
- Configuration helper preserves rigor/local overrides and detects code roots.
- Catalog covers all roles/skills; local Markdown links resolve.
- `python3 tools/validate_studio.py` passes; `node --test tests/wechat/*.test.js`
  exercises lifecycle, duplicate resume, delta clamp, safe area, touch and storage.
- English/Chinese README provide the same setup and validation limits.
- GitHub main and codex-v0.1.0 release match the tested commit.

Behavioral specs are inherited review cases, not executed LLM tests. Device and
DevTools validation requires AppID, devices and human platform access; this port
must not report those checks as performed by the mock suite.

## Upgrade an existing game

Back up/commit your game first. Merge AGENTS.md, .codex, .agents, framework docs
and tools with your existing customizations; do not overwrite your game sources,
project.yaml or project.local.yaml. Remove obsolete .claude only after comparing
its custom changes. Keep your real engine reference pinned. Re-run validation;
configure/trust the project in your Codex client and select a role or skill.

Upstream tags remain local provenance; this adaptation uses the `codex-v*` tag
prefix to distinguish its release line. Only the new Codex tag is published.
