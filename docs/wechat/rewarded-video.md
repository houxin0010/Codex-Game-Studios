# Rewarded video / 激励视频适配

## Scope / 范围

This dependency-free CommonJS adapter uses the same injected wx and Node test
style as the native starter. No real ad unit, real request, revenue measurement,
DevTools run or device observation was used. **Only Mock logic is verified.**

- Adapter: `examples/wechat-minigame/src/rewarded-video.js`.
- Config: `examples/wechat-minigame/src/config.js`; blank `adUnitId` disables ads.
- Game API: `game.watchRewardedVideo()`; completed views add `rewardPoints` once
  through the existing local score/save path. Default is 5, configurable at creation.
- Existing entry, Canvas, target hit-testing and lifecycle stay unchanged. No new
  button is drawn and no ad is triggered automatically. Add a separate player
  action and result UI before a real integration; see the
  [example README](../../examples/wechat-minigame/README.md).

## Adapter contract / 调用约定

```js
const { createRewardedVideo } = require('../../examples/wechat-minigame/src/rewarded-video');
const video = createRewardedVideo(wx, { adUnitId: 'YOUR_APPROVED_AD_UNIT_ID' });
// Only call from an explicit player action, not startup/onShow.
async function onWatchButton() {
  const result = await video.show();
  if (result.rewarded) {
    // Apply your local demo reward here exactly once.
    // When using game.watchRewardedVideo(), the game already applies its score reward.
  }
  // Use result.status for appropriate UI feedback.
}
// When the owner is disposed:
// video.destroy();
```

`show()` returns a Promise of `{ status, rewarded, error? }`. Operational SDK
failures resolve with `rewarded: false`; errors are retained for the caller's
controlled diagnostics. The Promise waits for close/error, not merely successful
`RewardedVideoAd.show()`. `getState()` exposes the current state. `destroy()` is
idempotent, cancels a pending attempt without reward, and prevents future shows.

| State | Transition / 状态变化 |
|---|---|
| `disabled` | Blank ID; no SDK call / 空广告位不调用 SDK |
| `unsupported` | Missing create API; no request / 缺少创建 API |
| `idle` | `show()` creates one fresh instance and enters `loading` |
| `loading` | `load()` Promise resolves → transient `ready` → `showing`; error → `error` |
| `ready` | Internal transient state immediately before `show()`; no separate preload API |
| `showing` | Close → `idle`; SDK error/show rejection → `error` |
| `error` | A new player action may retry with a fresh instance; no automatic retries |
| `destroyed` | Terminal; all subsequent calls return without reward |

| Result status | Reward / 奖励 |
|---|---|
| `completed` | Only strict `response.isEnded === true` while showing |
| `incomplete` | None: false, undefined, missing or non-boolean completion flag |
| `create-failed`, `load-failed`, `show-failed` | None; includes synchronous throws and Promise rejection |
| `disabled`, `unsupported`, `busy`, `destroyed` | None |
| `paused`, `invalid-reward` | Game API only; none, no new ad request |

`onLoad` is deliberately not a state authority: creation/automatic loading may
emit it out of order. The explicit `load()` Promise and session guard control
progress. A close during loading is ignored. Without any close/error or rejected
SDK Promise, the attempt remains pending and further calls are busy; owner
`destroy()` releases it without reward. There is no timer-based reward or
background-triggered retry. Hide/show does not itself prove completion or cancel
an ad; the game's existing frame lifecycle remains active. A completed callback
while hidden can update the local score, without restarting the frame loop.

## Exactly-once boundary / 防重复边界

Each attempt creates `wx.createRewardedVideoAd({ adUnitId, multiton: true })`.
Concurrent requests resolve `busy`, rather than sharing a successful Promise
that separate game handlers might both reward. Every terminal callback/Promise
checks the active session and a settled flag. Settlement marks it final before
removing its exact listeners and destroying the instance; cleanup exceptions
cannot reopen settlement. Late/duplicate close, error and Promise callbacks are
ignored, including after a subsequent attempt begins. A singleton instance
returned again is rejected instead of reusing callbacks across attempts.

The first terminal outcome wins. `show()` success alone never rewards. After an
error or early close, a later completed callback cannot change the outcome.
Missing completion data is treated as unconfirmed, even for older SDK behavior.

This guarantees at-most-once local settlement per adapter attempt in the current
process, **not** durable or server-authoritative reward delivery. Local score
storage may fail; the demo reports that failure and does not re-award. For
valuable/account rewards, introduce server validation and persistent unique
reward transaction IDs with an atomic idempotency constraint. Do not treat
client flags, local storage or these tests as fraud protection.

## Reproducible tests / 可复现测试

From the repository root, using Node.js with `node:test` support:

```bash
node --test tests/wechat/*.test.js
python3 tools/validate_studio.py
python3 -m unittest discover -s tests/studio -p 'test_*.py'
```

The wx Mock implements create/load/show/close/error and listener disposal; it
never makes network requests. Deferred Promises reproduce callback ordering.
Tests cover strict completion, premature/unknown close, load failure, show
failure, playback error, synchronous throws, duplicate and stale callbacks,
concurrent actions, retries, disposal during loading/showing, missing API/ID,
singleton reuse and cleanup failures. Game tests also verify one score/storage
write, background completion, disposal after close, invalid reward amounts,
storage failure and default-disabled behavior. Original gameplay tests remain.

## Remaining acceptance / 待完成验收

All rows below are **NOT ASSESSED**. These require actual platform access and
must not be reported as passing from the Node tests.

| Environment / 环境 | Required verification / 验证内容 |
|---|---|
| WeChat DevTools | Import as a mini game with your AppID; record tool/base-library versions. Confirm original gameplay still launches. Add an explicit opt-in button and loading/busy/failure feedback; verify packaging of the new CommonJS modules and API capability handling. Retain screenshots/logs. Simulator advertising behavior does not establish commercial acceptance. |
| iOS and Android devices | Record device/OS/WeChat/base-library versions. With an approved ad unit, observe actual load/show/close/error order; full watch grants once, early close/no-fill/failure grants zero. Check rapid taps, repeated attempts, network loss/recovery, hide/show, interruption, scene disposal, safe area and frame-loop recovery. Confirm multiton and listener/destroy behavior. Retain evidence without secrets. |
| Commercial integration | In the current WeChat console, verify the game's advertising eligibility, ad-unit type, AppID binding, review/enabled state and current reward/consent/privacy policies. Configure your actual ID; verify real callbacks and user reward delivery. For account/value rewards, implement and test server idempotency separately. Dashboard exposure/revenue and production approval are separate evidence; no earnings claim follows from Mock tests. |

## API source / API 依据

Checked 2026-10-10 against the WeChat-maintained
[mini-game API typings](https://github.com/wechat-miniprogram/minigame-api-typings/blob/4cae82af7f3c4339d1f11aea8e672fb16051d24a/types/wx/lib.wx.api.d.ts)
(`CreateRewardedVideoAdOption`, `RewardedVideoAd`, close result). They declare
`multiton` and `destroy()` from base library 2.8.0; confirm that capability in the
actual configured SDK. This adapter requires the modern multiton/disposal
contract and does not silently fall back to singleton reuse. The official web
pages could not be retrieved in this environment; re-check them for your target
version before platform acceptance:

- [wx.createRewardedVideoAd](https://developers.weixin.qq.com/minigame/dev/api/ad/wx.createRewardedVideoAd.html)
- [RewardedVideoAd.onClose](https://developers.weixin.qq.com/minigame/dev/api/ad/RewardedVideoAd.onClose.html)
- [Rewarded video guide](https://developers.weixin.qq.com/minigame/introduction/commercialization/ad/rewarded-video-ad.html)
