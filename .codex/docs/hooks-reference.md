# Explicit checks instead of Claude hooks

The upstream event hooks and settings.json were removed: their Claude JSON
payloads and event names are not a portable Codex runtime contract. This release
does not enable automatic hooks, statusline, notifications, session logging or
agent audit events. Run `python3 tools/validate_studio.py` before publication,
inspect staged changes for secrets and run your game's real tests before a commit.
Use .codex/scripts/yaml-helper.sh to resolve configuration; other retained
scripts emit artifact observations explicitly. See codex-runtime.md.
