// Native WeChat mini-game starter; no DOM or browser adapter required.
const { createRewardedVideo } = require('./rewarded-video');
const defaultConfig = require('./config');

/** Create the starter; optional config.rewardedVideo enables player-triggered rewards. */
function createGame(wx, frames, warn = message => console.warn(message), config = defaultConfig) {
  const adConfig = config.rewardedVideo || {};
  const rewardPoints = adConfig.rewardPoints;
  const video = createRewardedVideo(wx, adConfig);
  const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
  const width = info.windowWidth;
  const height = info.windowHeight;
  const dpr = Math.min(info.pixelRatio || 1, 3);
  const safe = info.safeArea || { left: 0, top: 0, right: width, bottom: height };
  const canvas = wx.createCanvas();
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const radius = Math.min(28, (safe.right - safe.left) / 4, (safe.bottom - safe.top) / 4);
  const centerX = (safe.left + safe.right) / 2;
  const centerY = (safe.top + safe.bottom) / 2;
  const amplitude = Math.max(0, (safe.right - safe.left) / 2 - radius - 8);
  let score = 0;
  try {
    const saved = wx.getStorageSync('studio-demo-score');
    if (Number.isSafeInteger(saved) && saved >= 0) score = saved;
  } catch (error) { warn('Score could not be loaded: ' + error.message); }
  let running = false;
  let destroyed = false;
  let frameId = null;
  let previous = null;
  let elapsed = 0;
  let targetX = centerX;

  function draw() {
    ctx.fillStyle = '#101827'; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#e5eefc'; ctx.font = '20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Tap the moving circle', centerX, safe.top + 40);
    ctx.fillText('Score: ' + score, centerX, safe.top + 72);
    ctx.fillStyle = '#45d4a8'; ctx.beginPath();
    ctx.arc(targetX, centerY, radius, 0, Math.PI * 2); ctx.fill();
  }
  function tick(time) {
    if (!running) return;
    frameId = null;
    const dt = previous === null ? 0 : Math.max(0, Math.min((time - previous) / 1000, 0.05));
    previous = time; elapsed += dt;
    targetX = centerX + Math.sin(elapsed * 0.8) * amplitude;
    draw(); frameId = frames.request(tick);
  }
  function start() {
    if (running || destroyed) return;
    running = true; previous = null; frameId = frames.request(tick);
  }
  function pause() {
    running = false; previous = null;
    if (frameId !== null) frames.cancel(frameId);
    frameId = null;
  }
  function touch(event) {
    if (!running || !event.touches || !event.touches.length) return;
    const { clientX, clientY } = event.touches[0];
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return;
    if (Math.hypot(clientX - targetX, clientY - centerY) > radius) return;
    addScore(1);
  }
  function addScore(points) {
    score += points;
    try { wx.setStorageSync('studio-demo-score', score); }
    catch (error) { warn('Score could not be saved: ' + error.message); }
    draw();
  }
  /** Call from an explicit player action; completed video adds configured points once. */
  async function watchRewardedVideo() {
    if (destroyed) return { status: 'destroyed', rewarded: false };
    if (!running) return { status: 'paused', rewarded: false };
    if (!Number.isSafeInteger(rewardPoints) || rewardPoints <= 0 ||
        !Number.isSafeInteger(score + rewardPoints)) {
      return { status: 'invalid-reward', rewarded: false };
    }
    const result = await video.show();
    if (destroyed) return { status: 'destroyed', rewarded: false };
    if (result.rewarded) {
      if (!Number.isSafeInteger(score + rewardPoints)) {
        return { status: 'invalid-reward', rewarded: false };
      }
      addScore(rewardPoints);
    }
    return result;
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true; pause(); video.destroy();
    wx.offShow(start); wx.offHide(pause); wx.offTouchStart(touch);
  }
  wx.onShow(start); wx.onHide(pause); wx.onTouchStart(touch);
  return { start, pause, destroy, watchRewardedVideo };
}
module.exports = { createGame };
