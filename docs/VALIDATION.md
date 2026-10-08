# Validation record — 2026-10-09

Port baseline: upstream be8993bbc5a1f016bc770b2846ce06272d284526.

| Check | Result | Scope |
|---|---|---|
| Framework validator | PASS | 50 TOML roles, 77 skill metadata files, catalog, local Markdown hyperlinks, shell syntax, JSON |
| Configuration helper | PASS | minimal/standard/full, local review override, six engine roots, nested native game root |
| Validator negative tests | 2 passed | Malformed role TOML and legacy tool-grant metadata cannot pass |
| WeChat mock tests | 6 passed | Canvas DPR/safe area, touch/storage, interruption, delta clamp, duplicate resume, SDK fallback and cleanup |
| Native Codex skills/list | PASS | CLI 0.148.0 app-server actually discovered 77 project skills with zero errors |
| Native project role execution | NOT ASSESSED | Requires trusting the new project in the user's client; TOML schema parsing is verified separately |
| Model behavioral scenarios | NOT ASSESSED | Inherited and new review cases are available; no claim of executing every role/workflow |
| WeChat DevTools/iOS/Android | NOT ASSESSED | No registered mini-game AppID/device session used for this port |
| Login/ads/backend/upload | NOT ASSESSED | Not implemented in the starter; real platform evidence is required for games that add them |

Commands (Python 3.11+, Node.js 18+):

```bash
python3 tools/validate_studio.py
python3 -m unittest discover -s tests/studio -v
node --test tests/wechat/*.test.js
```

The host's default Python/Node may be older; use an installed runtime satisfying
these requirements. Validation used Python 3.12 and Node.js 24.18.0. Native role
format and configuration follow the official sources listed in codex-runtime.md.
No global Codex trust/configuration was changed for the discovery probe.

This is a studio-template release, not a WeChat game release. Mock/test PASS does
not establish device compatibility, platform review approval or production readiness.
