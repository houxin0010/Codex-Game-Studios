# Codex skill-test behavioral specification

Read .agents/skills/skill-test/SKILL.md and .codex/docs/codex-runtime.md.

## Static assertions
- Skill YAML requires name/description only; usage is body text.
- Native role TOML requires name/description/developer_instructions.
- Unsupported automatic imports, preprocessing and tool grants do not count as capabilities.
- Catalog is derived against the actual skill/role tree and names missing specs honestly.

## Cases
1. Malformed YAML/TOML: structural FAIL, never NOT ASSESSED or a guessed parse.
2. Missing named skill/role: report the exact missing path and stop that case.
3. Valid portable skill: do not fail it for absent allowed-tools/context/model fields.
4. Agent requesting another domain: evaluate escalation against actual instructions.
5. Inherited Claude-only runtime assertion: NOT ASSESSED or revise the unsupported
   assertion, never claim an exact Claude tool/model API exists in Codex.
6. Mock-only game evidence: do not assert a READY device/platform release verdict.
7. A new role/skill not in catalog: identify missing coverage from the filesystem.
8. A skipped category/model test: state why and what remains unassessed.

Deterministic metadata checks are run by tools/validate_studio.py; these cases are
model-review scenarios and are not executed merely by running that validator.
