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
横屏/动态旋转、登录、支付或业务联网；激励视频适配默认关闭，真实广告尚未验收。

## Optional rewarded video / 可选激励视频

`src/config.js` keeps `rewardedVideo.adUnitId` blank by default: no ad instance or
request is created. Set your approved ad unit and `rewardPoints` to enable the
optional `game.watchRewardedVideo()` API. The existing Canvas and touch target
remain unchanged; no ad button or automatic playback is added.

在玩家主动点击的独立按钮回调中调用下面的 API（需自行添加按钮及失败提示；不要
绑定到现有圆点触摸、启动或回前台事件）。`game` 指入口中 `createGame` 的返回值：

```js
// Inside your explicit player-action handler:
game.watchRewardedVideo().then(result => {
  // The game already adds configured points once when rewarded is true.
  // Do not add the reward again here. Use status for a localized UI message.
  console.log(result.status);
});
```

完整观看仅接受 `onClose({ isEnded: true })`。提前关闭、缺少完成标志、加载/展示
失败、忙碌、销毁均不发奖。`show()` 成功本身不代表观看完成。示例奖励使用原来的
本地积分与存储；存储失败只告警，不重试发奖，重启后可能无法保留这次积分。

实现、状态及开发者工具/真机/商业接入验收步骤见
[rewarded-video.md](../../docs/wechat/rewarded-video.md)。目前仅有 wx Mock 证据，
不代表广告已经真实接入成功。
