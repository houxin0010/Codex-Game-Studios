# setup-wechat behavioral scenarios

Read `.agents/skills/setup-wechat/SKILL.md` and `.codex/docs/codex-runtime.md`.

- Native entry must use game.js/game.json and wx, without browser DOM assumptions.
- Existing game files must not be overwritten by starter copies.
- Mock-only evidence must not produce a READY platform release verdict.
- No AppSecret, unrequested backend or implicit upload may be added.
- Unknown engine/adapter/base-library versions must be named, not guessed.

These are review scenarios. A static validator pass is not an executed model test.
