# WeChat mini-game adaptation / 微信小游戏适配

English quick start: [root README](../../README.md). 中文入口：[中文 README](../../README.zh-CN.md).

## Supported routes / 支持路径

| Route / 路径 | Source / 源码 | Export / 产物 | Boundary / 边界 |
|---|---|---|---|
| Native JS Canvas / 原生 | src/ (starter: examples/wechat-minigame/src) | game.js + game.json | Bundled dependency-free example / 仓库提供无依赖示例 |
| Cocos Creator | assets/ | Vendor WeChat mini-game export | Pin Creator/adapter versions / 固定引擎和适配器版本 |
| LayaAir | src/ | Vendor WeChat mini-game export | Verify current engine plugin / 核验插件兼容性 |
| Unity / 团结 | Assets/ | Tencent conversion/export SDK | Verify actual SDK/version compatibility / 核验转换方案 |
| Godot / Unreal | Engine-specific | Not promised / 不承诺 | Requires separately proven adapter / 需另行证明适配路径 |

The studio adds platform guidance and a native starter, not an engine-export
converter. A web build is not automatically a mini game. 游戏工作室提供原生示例及
平台开发流程，不包含引擎导出转换器；Web 构建不能直接视为小游戏产物。

## Setup / 开始开发

1. Invoke `$setup-wechat native` or select cocos/layaair/unity with the actual
   installed engine and output directory. 调用对应技能，核验实际引擎与导出目录。
2. For the example, import examples/wechat-minigame into WeChat DevTools, choose
   mini game, and configure your AppID. 导入示例、选择小游戏并配置自己的 AppID。
3. Merge [project.example.yaml](project.example.yaml) into project.yaml only when
   targeting WeChat. The general template stays unconfigured for `$start`.
4. Pin actual DevTools, base-library, engine and export-adapter versions in your
   project notes. Unsupported wx APIs need feature checks and useful failure UI.
5. Run tests, then observe DevTools and devices. Use `$wechat-audit` and
   `$wechat-release` for evidence and release preparation.

The starter fixes portrait orientation, uses wx.createCanvas, scales pixels with
DPR, places input inside the safe area, pauses on wx.onHide, resumes once on
wx.onShow and reports storage failures without stopping gameplay. Native SDK
requestAnimationFrame is supplied by game.js; no window/document shim is needed.
示例固定竖屏；旋转、音频、拖拽取消及引擎生命周期需按实际游戏补充验证。

## Platform contracts / 平台约束

- **Runtime / 运行时**: game.js/game.json, wx APIs, native touch events and no DOM.
  Mini-program app.js/WXML are a different product. 引擎产物从源码项目修改后重导出。
- **Lifecycle / 生命周期**: stop timers/audio/network work as appropriate on hide;
  reset elapsed time on show, register listeners once, release them when destroyed.
- **Layout/input / 布局触控**: logical coordinates, DPR, safe area, aspect ratios,
  multi-touch and cancel paths must agree. DevTools alone misses device behavior.
- **Networking/auth / 网络登录**: configure legal domains/TLS and privacy needs;
  exchange wx.login codes on a server. Never embed AppSecret/session secrets or
  trust a client purchase or identity assertion. 示例不包含后端。
- **Ads/rewards / 广告奖励**: reward only a verified completed view, settle once;
  load/show errors and early close award nothing. Sharing completion is not proof
  of reward eligibility. 缺少广告位及真实回调时不得声称完成广告验收。
- **Packages / 包体**: measure the actual build; source current main/subpackage,
  remote-asset and SDK constraints from official docs/console rather than stale
  hardcoded thresholds. 核验分包、远程资源、缓存、冷启动及低内存设备。
- **Release / 发布**: confirm licenses, privacy/consent, domain settings, AppID,
  version, evidence and rollback. Upload, review submission and production release
  are separate states and require the corresponding user instruction.

## Required evidence / 必需证据

| Check / 检查 | Evidence / 证据 |
|---|---|
| DevTools launch and visible gameplay | Version, screenshot, logs / 工具版本、截图、日志 |
| iOS and Android | Device/OS/base-library, touch/safe-area, hide/show / 真机矩阵 |
| Cold start/frame/memory | Measured values on named devices / 实测，不能估算为通过 |
| Offline/storage/API failures | Reproduction and recovery / 重现步骤和恢复结果 |
| Login/ads/cloud if present | Real server/SDK callbacks without exposed secrets / 真实链路 |
| Export/package | Actual artifact, version, size, current policy / 实际产物和平台规则 |

Mock tests establish code contracts only. Missing actual required evidence is
NOT ASSESSED and blocks a READY release verdict. 无设备、AppID、后端或广告位时，
逐项记录未验证内容；不能用静态检查代替平台验收。

## Official references / 官方参考

Verified/read 2026-10-09; re-check for your actual versions:
- [WeChat development guide](https://developers.weixin.qq.com/minigame/dev/guide/)
- [Native tutorial](https://developers.weixin.qq.com/minigame/dev/guide/develop/start.html)
- [Engine adaptation](https://developers.weixin.qq.com/minigame/dev/guide/game-engine/engine-overview.html)
- [Project config](https://developers.weixin.qq.com/minigame/dev/devtools/projectconfig.html)
- [wx.onHide](https://developers.weixin.qq.com/minigame/dev/api/base/app/life-cycle/wx.onHide.html)
- [Mini-game APIs](https://developers.weixin.qq.com/minigame/dev/api/)
