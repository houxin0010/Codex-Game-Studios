# Context management

Use progressive reads: root AGENTS.md, effective project.yaml values, the relevant
skill and its named references, then domain role/rules and the actual affected code.
Do not load every studio prompt into a single task.

## Checkpoint

Read production/session-state/active.md when resuming if it exists. Within the
user-authorized task, create/update it using .codex/docs/templates/session-state.md.
The compact checkpoint records current task, next step, modified files, blocked
inputs, open decisions and commands/results. Keep it short enough for a cold
reader to resume. No session-start/statusline/compaction hook reads it automatically.
Preserve older narrative entries; use .codex/scripts/rotate-session-state.sh with
--dry-run before a user-authorized rotation. The checkpoint and logs are ignored.

## Observations, not invented verdicts

Helpers in .codex/scripts emit filesystem/config observations. A helper cannot
see every workflow tier, user override or device condition, so the skill owns the
verdict. Missing code roots, artifacts or evidence must be disclosed as NOT
ASSESSED when required by the gate, not treated as successful empty scans.

## Role handoffs

Pass bounded inputs, output path, acceptance criteria and file ownership. Return
concise evidence and unresolved facts. Read referenced files explicitly; @path
imports and automatic skill preloads are not supported by this port. No automatic
persistent agent memory is enabled; record memory only on the user's request.
