# Native WeChat starter / 原生微信小游戏示例

Import this directory as a **mini game** in WeChat DevTools. Replace touristappid
in project.config.json with your own mini-game AppID. Tourist mode is a placeholder
and may be unavailable or lack preview/upload and other APIs. No AppSecret is needed.
Use game.js + game.json; this is not a mini program or an HTML app.

在微信开发者工具中导入此目录，项目类型选择「小游戏」。将 project.config.json
里的 touristappid 换成自己的小游戏 AppID。游客模式仅为占位，可能不支持预览、
上传或部分 API；不要填写 AppSecret。本示例不需要 npm 安装或浏览器 DOM 适配。

Tap the moving circle to score; the score persists locally. Background pauses the
frame loop, resume resets time, and repeated show does not create a duplicate loop.
触摸移动圆点得分；分数本地保存。退后台暂停，回前台重置帧时钟，避免重复循环。

Run from studio root / 在工作室仓库根目录测试：

```bash
node --test tests/wechat/*.test.js
```

The tests use wx mocks. Real DevTools/iOS/Android behavior is not verified by them.
测试使用 wx mock；仍需开发者工具和 iOS/Android 真机验证。示例固定竖屏，不包含
横屏/动态旋转、登录、广告、支付或联网；启用这些功能时需要额外适配。
