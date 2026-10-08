---
name: setup-wechat
description: "Configure a WeChat mini game with native JavaScript, Cocos Creator, LayaAir or Unity exports; scaffold a native starter and pin platform evidence."
---

# Set up a WeChat mini game

Usage arguments: `[native|cocos|layaair|unity] [target-directory]`

## 1. Establish the target
Read AGENTS.md, .codex/docs/codex-runtime.md and docs/wechat/README.md.
Run `bash .codex/scripts/yaml-helper.sh resolve_config --keys workflow,automation,team.size`.
Confirm native vs engine export, the game directory, orientation, existing game
files, actual engine version, DevTools version and target base library. Ask only
for missing decisions; existing scope authorization covers the promised edits.
Native JS is the default for a new dependency-free starter.

## 2. Configure and scaffold
For a new native game copy examples/wechat-minigame into the explicitly selected
empty directory, excluding README.md if unnecessary. Do not overwrite existing
game files; integrate lifecycle/input patterns into the existing entry instead.
Set the mini-game AppID locally in project.config.json; never ask for AppSecret.
Tourist AppID is a placeholder and may not support preview/upload or all SDK APIs.

For Cocos/LayaAir/Unity, use the vendor's actual mini-game export and adapter,
not this native starter. Pin engine/adapter versions and the generated export path;
source edits belong in the engine project, not generated bundles.

Write project.yaml's engine.name as WeChat/Cocos/LayaAir/Unity, set engine.language,
engine.version from verified local facts (do not guess a native engine version),
and set platforms.wechat.enabled, runtime (native/cocos/layaair/unity), game_root,
base_library and orientation. Leave unknown version values unset and name them.
Update AGENTS.md's engine/platform references and the legacy technical preferences
mirror; project.yaml remains authoritative. See docs/wechat/project.example.yaml.

Route wx/platform work to wechat-minigame-specialist when delegated, and engine
work to its matching specialist. Default individual mode may work sequentially.

## 3. Validate the actual artifact
For the bundled starter run `node --test tests/wechat/*.test.js` from the studio
root; for a copied/modified game run its own checks, not only the unchanged example.
Import the actual game_root into DevTools as a mini game. Observe input, safe area,
hide/show and storage. Capture DevTools screenshot and real iOS/Android evidence
under production/qa/evidence. Report missing platform access as NOT ASSESSED.

## 4. Handoff
Report configured files, versions, output path, checks and missing AppID/device
facts. Continue with $brainstorm / $create-stories, then $wechat-audit before
$wechat-release. Do not upload or publish without the user's instruction.
