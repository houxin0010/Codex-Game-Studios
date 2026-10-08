# Codex runtime contract

Verified against official documentation on 2026-10-09. Target: current local
Codex releases with project-scoped standalone TOML custom agents (CLI 0.148.0
used for validation). Older clients may require upgrading or manually passing
role instructions; do not assume they load this format.

| Upstream Claude mechanism | Codex implementation |
|---|---|
| CLAUDE.md and @path imports | AGENTS.md and explicit reads |
| .claude/agents/*.md | .codex/agents/*.toml: name, description, developer_instructions |
| Slash skills | .agents/skills/*/SKILL.md; invoke with $name in CLI/IDE or select in app |
| !`command` preprocessing | Explicit fenced shell command; run and inspect before using output |
| allowed-tools, context: fork, model aliases | Removed from skill metadata; do not enforce runtime permissions |
| Agent/Task tool | The current client's native subagent tools; roles keep their ownership model |
| AskUserQuestion/task tools | Available clarification tool or conversation; a local task checklist |
| Auto-imported path rules | Root AGENTS.md explicitly selects matching rule files |
| Claude event hooks, status line | Removed; validation and session checkpoints are explicit |
| Project agent memory | No automatic memory; only user-authorized notes/checkpoints |

The parent model and reasoning effort are inherited. No Anthropic model alias,
model subscription, MCP server, global skill installation or permission bypass
is required by this template. `.codex/config.toml` caps spawned concurrency at 3;
this is not a hierarchy depth setting. A specialist needing another role returns
the request to the orchestrator when nesting is unavailable.

Skills are progressive instructions. Their frontmatter contains only name and
description; usage arguments are ordinary text. Codex does not preload other
skills merely because an upstream role referred to a `skills:` field. Read
needed skills explicitly. Tool names surviving in workflow prose describe intent,
not exact APIs; never invent a tool or assume Bash/WebSearch is granted.

Start in the repository root and review/trust the project using your client's
normal controls. Trust influences project config loading. The repository does
not change your global config or permissions. Instructions about approval in
inherited workflows apply only to a decision outside existing authorization;
prior approval for the same scope remains valid. Named task outputs are not
permission to write outside the delegated task.

## Validation and honest evidence

- `python3 tools/validate_studio.py`: TOML/skill metadata, migration residues,
  shell syntax, catalog coverage, helper resolution and local Markdown links.
- `node --test tests/wechat/*.test.js`: mock SDK checks of Canvas/touch and lifecycle.
- `.codex/scripts/`: explicit upstream configuration and artifact observations.
- `production/session-state/active.md`: explicit, gitignored checkpoint.

No Claude JSON tool-event adapter is shipped, and no automatic hook enforcement
is claimed. Real DevTools, device, backend auth, advertisements and package upload
checks must be reported as NOT ASSESSED until actually observed. The inherited
behavioral specs are review scenarios, not evidence of executed model runs.

Sources:
- https://developers.openai.com/codex/subagents
- https://developers.openai.com/codex/skills
- https://developers.openai.com/codex/guides/agents-md
- https://developers.openai.com/codex/config-reference
