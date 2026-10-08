---
name: wechat-audit
description: "Audit a WeChat mini game for runtime, lifecycle, touch, package, auth, ads and device evidence; not a generic browser review."
---

# WeChat platform audit

Usage arguments: `[game-root]`

## 1. Inspect
Read AGENTS.md, .codex/docs/codex-runtime.md, docs/wechat/README.md and
.codex/rules/wechat-minigame.md. Resolve configured game_root and engine/adapter
versions. Inspect actual entry, game.json, project.config.json, dependencies and
export artifacts; identify native vs engine export and generated-source boundaries.

## 2. Check the platform contracts
Check DOM assumptions, API availability/fallbacks, logical touch coordinates,
DPR/safe area, cancel handling for gestures, one frame loop and one listener set,
hide/show clock reset and audio behavior. Verify storage/network failures and user
denial. For any login/ads/cloud feature actually used, inspect server exchange,
secret exclusion, privacy/domain config and completed-view exactly-once rewards.
Sharing is not verified reward delivery. Verify current package/subpackage policy
from official sources/console and measure the actual export; do not guess limits.
Do not invent optional backend/ads requirements for a game that does not use them.

## 3. Execute and report
Run the game's own tests and actual DevTools/device scenarios. The bundled mock
suite only proves the bundled example's code contracts. Retain screenshot/log,
SDK versions, startup time, frame/memory data and tested device details. Missing
hardware/backend access is NOT ASSESSED, never PASS. Findings include file/line,
reproduction, impact and the smallest fix. Return PASS/CONCERNS/NOT ASSESSED for
each tested category and a release readiness verdict; no aggregate PASS with
unassessed required device checks. Follow with $wechat-release when evidence exists.
