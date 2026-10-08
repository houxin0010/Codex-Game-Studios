---
name: wechat-release
description: "Prepare a WeChat mini-game release using real DevTools, iOS/Android evidence and current console requirements; never upload implicitly."
---

# WeChat release preparation

Usage arguments: `[game-root] [version]`

## 1. Read the release evidence
Read AGENTS.md, .codex/docs/codex-runtime.md, docs/wechat/README.md and the latest
$wechat-audit report. Confirm the actual mini-game AppID, game_root, version,
engine/export adapter, base library, orientation and current distribution plan.
Inspect the real exported package and console size/subpackage policy. AppID is
public identity; AppSecret and upload private keys remain outside the repository.

## 2. Gate the package
Require DevTools launch and screenshots, iOS/Android device startup, safe-area
input, background/resume and applicable offline/login/ad/privacy scenarios. Record
measured performance on named devices. Remove debug configuration and verify
assets/licenses, legal request domains, privacy declarations, backend release
compatibility and rollback plan for features present. Missing required evidence
means NOT READY / NOT ASSESSED. Mocks or a browser screenshot cannot pass this gate.

## 3. Prepare the handoff
Write a release evidence checklist with version, tested commit/export, device
matrix, package measurements, backend dependencies, remaining risks and rollback.
If the user explicitly asks to upload, use their existing DevTools or configured
CI credential path; first prepare and validate the artifact, then perform only
that authorized upload. Upload is not review approval or production publication.
Never fabricate QR codes, device logs or platform approval. Report exact status
and next console action. Follow $release-checklist for non-platform deliverables.
