const test = require('node:test');
const assert = require('node:assert/strict');
const { createGame } = require('../../examples/wechat-minigame/src/game.js');

function harness({ storage = 0, failStorage = false, modernInfo = true, adWx = {}, config } = {}) {
  const listeners = {};
  const queued = new Map();
  const writes = [];
  const calls = [];
  let id = 0;
  const context = new Proxy({}, { get: (_, name) => (...args) => calls.push([name, ...args]), set: () => true });
  const canvas = { getContext: () => context };
  const info = { windowWidth: 320, windowHeight: 640, pixelRatio: 2, safeArea: { left: 0, top: 30, right: 320, bottom: 600 } };
  const wx = {
    ...adWx,
    createCanvas: () => canvas,
    getSystemInfoSync: () => info,
    ...(modernInfo ? { getWindowInfo: () => info } : {}),
    getStorageSync: () => { if (failStorage) throw Error('storage unavailable'); return storage; },
    setStorageSync: (key, value) => { if (failStorage) throw Error('quota'); writes.push([key, value]); },
  };
  for (const event of ['Show', 'Hide', 'TouchStart']) {
    wx[`on${event}`] = fn => { listeners[event] = fn; };
    wx[`off${event}`] = fn => { assert.equal(listeners[event], fn); delete listeners[event]; };
  }
  const frames = {
    request: fn => { queued.set(++id, fn); return id; },
    cancel: key => queued.delete(key),
  };
  const warnings = [];
  const game = createGame(wx, frames, message => warnings.push(message), config);
  function tick(time) { const [key, fn] = queued.entries().next().value; queued.delete(key); fn(time); }
  function target() { return calls.filter(call => call[0] === 'arc').at(-1).slice(1, 4); }
  return { game, wx, info, listeners, queued, writes, canvas, calls, warnings, tick, target };
}

test('Canvas scales for DPR and target respects portrait safe area', () => {
  const h = harness(); h.game.start(); h.tick(0);
  assert.equal(h.canvas.width, 640); assert.equal(h.canvas.height, 1280);
  assert.deepEqual(h.calls.find(call => call[0] === 'scale'), ['scale', 2, 2]);
  const [x, y, radius] = h.target();
  assert.ok(x >= radius && x <= 320 - radius);
  assert.ok(y - radius >= 30 && y + radius <= 600);
  h.game.destroy();
});

test('hide cancels frames; repeated show resumes exactly one loop without a time jump', () => {
  const h = harness(); h.game.start(); h.tick(0); h.tick(16);
  h.listeners.Hide(); assert.equal(h.queued.size, 0);
  h.listeners.Show(); h.listeners.Show(); assert.equal(h.queued.size, 1);
  const before = h.target()[0]; h.tick(300000);
  assert.equal(h.target()[0], before);
  h.game.destroy(); assert.equal(h.queued.size, 0); assert.deepEqual(h.listeners, {});
});

test('frame delta is clamped after a stall', () => {
  const h = harness(); h.game.start(); h.tick(0);
  const before = h.target()[0]; h.tick(10000);
  assert.ok(Math.abs(h.target()[0] - before) <= 6);
  h.game.destroy();
});

test('touch hit saves score once; misses, empty touches and background touches do not', () => {
  const h = harness({ storage: 7 }); h.game.start(); h.tick(0);
  const [x, y] = h.target();
  h.listeners.TouchStart({ touches: [] });
  h.listeners.TouchStart({ touches: [{}] });
  h.listeners.TouchStart({ touches: [{ clientX: NaN, clientY: 0 }] });
  h.listeners.TouchStart({ touches: [{ clientX: 0, clientY: 0 }] });
  assert.equal(h.writes.length, 0);
  h.listeners.TouchStart({ touches: [{ clientX: x, clientY: y }] });
  assert.deepEqual(h.writes, [['studio-demo-score', 8]]);
  h.listeners.Hide(); h.listeners.TouchStart({ touches: [{ clientX: x, clientY: y }] });
  assert.equal(h.writes.length, 1); h.game.destroy();
});

test('corrupt storage resets to zero; storage failures are reported and gameplay remains usable', () => {
  const h = harness({ storage: 'bad' }); h.game.start(); h.tick(0);
  const [x, y] = h.target(); h.listeners.TouchStart({ touches: [{ clientX: x, clientY: y }] });
  assert.equal(h.writes[0][1], 1); h.game.destroy();
  const f = harness({ failStorage: true }); f.game.start(); f.tick(0);
  const [fx, fy] = f.target(); f.listeners.TouchStart({ touches: [{ clientX: fx, clientY: fy }] });
  assert.equal(f.warnings.length, 2); assert.equal(f.queued.size, 1); f.game.destroy();
});

test('older SDK window info fallback and destruction are safe', () => {
  const h = harness({ modernInfo: false }); h.game.start(); h.game.start();
  assert.equal(h.queued.size, 1); h.game.destroy(); h.game.destroy();
  h.game.start(); assert.equal(h.queued.size, 0);
});

function adHarness(options = {}) {
  const listeners = {};
  let requests = 0;
  const ad = { load: () => Promise.resolve(), show: () => Promise.resolve(), destroy: () => {},
    onClose: fn => { listeners.close = fn; }, offClose: () => { delete listeners.close; },
    onError: fn => { listeners.error = fn; }, offError: () => { delete listeners.error; },
  };
  const h = harness({ ...options,
    adWx: { createRewardedVideoAd: () => { requests++; return ad; } },
    config: { rewardedVideo: { adUnitId: 'mock', rewardPoints: options.rewardPoints ?? 5 } },
  });
  h.game.start();
  async function play() {
    const result = h.game.watchRewardedVideo();
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    return { result, close: listeners.close, error: listeners.error };
  }
  return { ...h, play, requests: () => requests };
}

test('default configuration never requests an ad and leaves scoring unchanged', async () => {
  let requests = 0;
  const h = harness({ adWx: { createRewardedVideoAd: () => { requests++; } } }); h.game.start();
  assert.deepEqual(await h.game.watchRewardedVideo(), { status: 'disabled', rewarded: false });
  assert.equal(requests, 0); assert.deepEqual(h.writes, []); h.game.destroy();
});

test('completed video saves configured reward exactly once, including background close', async () => {
  const h = adHarness({ storage: 7 }); const { result, close } = await h.play();
  assert.equal((await h.game.watchRewardedVideo()).status, 'busy');
  h.listeners.Hide(); close({ isEnded: true }); close({ isEnded: true });
  assert.equal((await result).rewarded, true);
  assert.deepEqual(h.writes, [['studio-demo-score', 12]]);
  assert.equal(h.queued.size, 0); h.listeners.Show(); assert.equal(h.queued.size, 1); h.game.destroy();
});

for (const outcome of ['incomplete', 'error', 'destroyed', 'destroy-after-close']) {
  test('game grants no score for ' + outcome, async () => {
    const h = adHarness(); const { result, close, error } = await h.play();
    if (outcome === 'incomplete') close({ isEnded: false });
    if (outcome === 'error') error(Error('playback failed'));
    if (outcome === 'destroyed') { h.game.destroy(); close({ isEnded: true }); }
    if (outcome === 'destroy-after-close') { close({ isEnded: true }); h.game.destroy(); }
    assert.equal((await result).rewarded, false); assert.deepEqual(h.writes, []); h.game.destroy();
  });
}

test('paused game and invalid reward config cannot request an ad', async () => {
  const h = adHarness(); h.game.pause();
  assert.equal((await h.game.watchRewardedVideo()).status, 'paused');
  assert.equal(h.requests(), 0); h.game.destroy();
  for (const rewardPoints of [0, -1, 1.5, Number.MAX_SAFE_INTEGER]) {
    const f = adHarness({ rewardPoints, storage: 7 });
    assert.equal((await f.game.watchRewardedVideo()).status, 'invalid-reward');
    assert.equal(f.requests(), 0); f.game.destroy();
  }
});

test('reward storage failure is reported once without retrying the award', async () => {
  const h = adHarness({ failStorage: true }); const { result, close } = await h.play();
  close({ isEnded: true }); close({ isEnded: true });
  assert.equal((await result).rewarded, true); assert.equal(h.warnings.length, 2);
  assert.equal(h.queued.size, 1); h.game.destroy();
});
