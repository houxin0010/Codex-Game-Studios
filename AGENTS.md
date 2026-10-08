# Codex Game Studios

This repository is a game-development studio template adapted from Donchitos's
Claude Code Game Studios. Use the configured engine and platform, not a presumed
Godot layout. User instructions and the client's permission policy take priority.

## Technology Stack

- **Engine**: [CHOOSE: Godot / Unity / Unreal / WeChat / Cocos / LayaAir]
- **Language**: [CHOOSE for the configured engine]
- **Version Control**: Git
- **Build System**: [SPECIFY after choosing engine]
- **Asset Pipeline**: [SPECIFY after choosing engine]

## Engine Version Reference

<!-- ENGINE-REFERENCE-IMPORT: setup-engine updates the explicit read below. -->
Read `docs/engine-reference/<configured-engine>/VERSION.md` on demand. There is
no @path import expansion in Codex. For WeChat read `docs/wechat/README.md`.

## Working agreements

1. Read `.codex/docs/codex-runtime.md`, `.codex/docs/coordination-rules.md` and
   `.codex/docs/coding-standards.md` before implementing a workflow.
2. Read `project.yaml` and resolve effective settings explicitly using:
   `bash .codex/scripts/yaml-helper.sh resolve_config --keys workflow,review_mode,automation,team.size`.
   Never treat a fenced shell command in a skill as already executed.
3. Use `$start` for an unconfigured project. Use `$setup-wechat` for WeChat mini
   games, including engine-exported games. Use `$setup-engine` for other engines.
4. Honor the user's authorized scope. Ask for missing product decisions or
   new destructive/external actions, not repeated permission for an authorized
   edit. No commits, pushes, uploads or releases unless the user requests them.
   An automation mode does not override client permissions.
5. Preserve existing edits and secrets. Keep app secrets and server credentials
   out of game packages; `project.private.config.json` is local and ignored.
6. Read the relevant `.codex/rules/*.md` BEFORE editing matching paths. Their
   `paths:` frontmatter is a selection hint, not a Codex enforcement feature:
   gameplay/core/AI/network/UI source → the corresponding code rule;
   design/gdd → design-docs; design/narrative → narrative; data JSON → data-files;
   shaders → shader-code; tests → test-standards; prototypes → prototype-code;
   skill/agent changes → skill-authoring. Read all matching rules when they overlap.
   WeChat changes additionally require `.codex/rules/wechat-minigame.md`.
7. A role defines expertise, not a tool grant. Read its `.codex/agents/<name>.toml`
   and send a bounded task with input, output and file ownership. Delegate when
   the user asks or the invoked skill requests it; do not start all roles.
   Use available subagent tools; if unavailable, follow the roles sequentially
   and disclose that no separate agents ran. Keep independent writes disjoint.
8. Inspect `production/session-state/active.md` if it exists after resume or
   compaction. Update it only within user authorization; no automatic session hook
   or automatic persistent agent memory is enabled.
9. Run `python3 tools/validate_studio.py` and `node --test tests/wechat/*.test.js`
   after framework/example changes. Helpers in `.codex/scripts/` emit observations,
   never gameplay verdicts. QA must name checks that did not run.
10. A visible game change requires a real launch, observation and screenshot in
    `production/qa/evidence/`. Mock tests and parse checks cannot close this gate.
    WeChat needs DevTools AND iOS/Android device evidence before a release verdict.

## Project structure

`.codex/agents` contains native TOML roles; `.agents/skills` contains portable
skills; `.codex/docs` and `.codex/rules` contain on-demand guidance. See
`.codex/docs/directory-structure.md`. The working game lives at the engine's
actual code root; `examples/wechat-minigame` is an isolated starter, not your game.
