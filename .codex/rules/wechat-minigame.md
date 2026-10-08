---
paths:
  - "examples/wechat-minigame/**"
  - "minigame/**"
  - "docs/wechat/**"
  - "**/game.js"
  - "**/game.json"
  - "**/project.config.json"
---
# WeChat mini-game rules

A mini game uses game.js/game.json and wx APIs, not the mini-program app.js,
WXML or a browser DOM. Confirm the engine export path before touching generated
files. Native code uses Canvas and SDK events; do not inject window/document.
Pin the actual SDK/engine/adapter versions and verify APIs with official sources.

Stop gameplay/audio/timers on hide and reset the frame clock on show; register
listeners once and remove them on disposal. Use logical screen coordinates,
DPR and safe area together for layout and touch hit testing. Handle touch cancel
for drag input and observe devices with notches and different aspect ratios.

Handle API failure and user denial. Client wx.login code must be exchanged on
a server; never ship AppSecret or trust client identity/purchases. Rewarded video
awards only on a confirmed completed view, with exactly-once settlement; load,
show, error and incomplete close must not award. Sharing has no reliable completed
share proof and must not be used as guaranteed reward settlement.

Record current package/subpackage limits and backend domain/privacy requirements
from the actual platform console/docs; do not embed remembered thresholds as
permanent rules. Keep debug logs/local private config out of exports. Release
requires real DevTools and iOS/Android evidence; mock PASS alone is NOT ASSESSED.
