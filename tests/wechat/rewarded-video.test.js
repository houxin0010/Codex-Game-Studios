const test = require('node:test');
const assert = require('node:assert/strict');
const { createRewardedVideo } = require('../../examples/wechat-minigame/src/rewarded-video.js');

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function harness() {
  const ads = [];
  const options = [];
  const wx = { createRewardedVideoAd: option => {
    options.push(option);
    const listeners = {};
    const load = deferred();
    const show = deferred();
    const ad = { listeners, loadResult: load, showResult: show, loads: 0, shows: 0, destroyed: 0,
      load: () => { ad.loads++; return load.promise; },
      show: () => { ad.shows++; return show.promise; },
      destroy: () => { ad.destroyed++; },
    };
    for (const event of ['Close', 'Error']) {
      ad[`on${event}`] = fn => { listeners[event] = fn; };
      ad[`off${event}`] = fn => { assert.equal(listeners[event], fn); delete listeners[event]; };
    }
    ads.push(ad); return ad;
  } };
  const video = createRewardedVideo(wx, { adUnitId: 'mock-ad-unit' });
  return { wx, ads, options, video };
}
async function loaded(ad) {
  ad.loadResult.resolve();
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
}

test('complete view rewards only on close, settles once and releases listeners', async () => {
  const h = harness(); const result = h.video.show(); const ad = h.ads[0];
  assert.equal(h.video.getState(), 'loading');
  assert.deepEqual(h.options, [{ adUnitId: 'mock-ad-unit', multiton: true }]);
  await loaded(ad); assert.equal(h.video.getState(), 'showing');
  ad.showResult.resolve(); await Promise.resolve();
  assert.equal(h.video.getState(), 'showing');
  const close = ad.listeners.Close;
  close({ isEnded: true }); close({ isEnded: true });
  assert.deepEqual(await result, { status: 'completed', rewarded: true });
  assert.equal(h.video.getState(), 'idle'); assert.equal(ad.destroyed, 1);
  assert.deepEqual(ad.listeners, {}); h.video.destroy();
});

for (const response of [{ isEnded: false }, undefined, {}, { isEnded: 'true' }]) {
  test('early or unconfirmed close awards nothing: ' + JSON.stringify(response), async () => {
    const h = harness(); const result = h.video.show(); await loaded(h.ads[0]);
    h.ads[0].listeners.Close(response);
    assert.deepEqual(await result, { status: 'incomplete', rewarded: false }); h.video.destroy();
  });
}

test('load rejection awards nothing, skips show and allows a fresh retry', async () => {
  const h = harness(); const result = h.video.show(); const error = Error('no fill');
  h.ads[0].loadResult.reject(error);
  assert.deepEqual(await result, { status: 'load-failed', rewarded: false, error });
  assert.equal(h.ads[0].shows, 0); assert.equal(h.video.getState(), 'error');
  const retry = h.video.show(); await loaded(h.ads[1]); h.ads[1].listeners.Close({ isEnded: true });
  assert.equal((await retry).rewarded, true); h.video.destroy();
});

test('onError followed by rejection and late close cannot reward or settle twice', async () => {
  const h = harness(); const result = h.video.show(); const ad = h.ads[0];
  const close = ad.listeners.Close; const fail = ad.listeners.Error; const error = { errCode: 1004 };
  await Promise.resolve(); // The SDK load is now in flight and owns this Promise.
  fail(error); ad.loadResult.reject(error); close({ isEnded: true }); fail(error);
  assert.deepEqual(await result, { status: 'load-failed', rewarded: false, error });
  assert.equal(ad.shows, 0); assert.equal(ad.destroyed, 1); h.video.destroy();
});

test('show rejection and playback onError award nothing', async () => {
  for (const event of ['reject', 'error']) {
    const h = harness(); const result = h.video.show(); const ad = h.ads[0]; await loaded(ad);
    const close = ad.listeners.Close; const error = Error('show failed');
    if (event === 'reject') ad.showResult.reject(error); else ad.listeners.Error(error);
    assert.deepEqual(await result, { status: 'show-failed', rewarded: false, error });
    close({ isEnded: true }); assert.equal(h.video.getState(), 'error'); h.video.destroy();
  }
});

test('concurrent requests are busy; old callbacks cannot award a later session', async () => {
  const h = harness(); const first = h.video.show(); const old = h.ads[0];
  assert.deepEqual(await h.video.show(), { status: 'busy', rewarded: false });
  await loaded(old); const close = old.listeners.Close; const fail = old.listeners.Error;
  close({ isEnded: true }); await first;
  const second = h.video.show(); await loaded(h.ads[1]);
  close({ isEnded: true }); fail(Error('stale')); old.showResult.reject(Error('late rejection'));
  await Promise.resolve(); assert.equal(h.video.getState(), 'showing');
  h.ads[1].listeners.Close({ isEnded: false });
  assert.equal((await second).rewarded, false); assert.equal(h.ads.length, 2); h.video.destroy();
});

for (const phase of ['loading', 'showing']) {
  test('destroy during ' + phase + ' settles without reward and ignores late work', async () => {
    const h = harness(); const result = h.video.show(); const ad = h.ads[0];
    const close = ad.listeners.Close;
    if (phase === 'showing') await loaded(ad);
    h.video.destroy(); h.video.destroy(); close({ isEnded: true }); await loaded(ad);
    assert.deepEqual(await result, { status: 'destroyed', rewarded: false });
    assert.equal(h.video.getState(), 'destroyed'); assert.equal(ad.destroyed, 1);
    assert.equal(ad.shows, phase === 'showing' ? 1 : 0);
    assert.deepEqual(await h.video.show(), { status: 'destroyed', rewarded: false });
  });
}

test('missing configuration or API makes no ad request', async () => {
  const h = harness(); const disabled = createRewardedVideo(h.wx);
  assert.deepEqual(await disabled.show(), { status: 'disabled', rewarded: false });
  assert.equal(h.ads.length, 0); assert.equal(disabled.getState(), 'disabled'); disabled.destroy();
  const unsupported = createRewardedVideo({}, { adUnitId: 'mock' });
  assert.deepEqual(await unsupported.show(), { status: 'unsupported', rewarded: false }); unsupported.destroy();
});

test('synchronous create/load/show failures resolve without rewards', async () => {
  const error = Error('SDK failure');
  const failed = createRewardedVideo({ createRewardedVideoAd: () => { throw error; } }, { adUnitId: 'mock' });
  assert.deepEqual(await failed.show(), { status: 'create-failed', rewarded: false, error }); failed.destroy();
  for (const method of ['load', 'show']) {
    const h = harness(); const create = h.wx.createRewardedVideoAd;
    h.wx.createRewardedVideoAd = option => { const ad = create(option); ad[method] = () => { throw error; }; return ad; };
    const result = h.video.show(); if (method === 'show') await loaded(h.ads[0]);
    assert.deepEqual(await result, { status: method + '-failed', rewarded: false, error }); h.video.destroy();
  }
});

test('close while loading is not proof of a completed view', async () => {
  const h = harness(); const result = h.video.show(); const ad = h.ads[0];
  ad.listeners.Close({ isEnded: true }); assert.equal(h.video.getState(), 'loading');
  await loaded(ad); ad.listeners.Close({ isEnded: false });
  assert.equal((await result).rewarded, false); h.video.destroy();
});

test('singleton SDK reuse is rejected to isolate old callbacks', async () => {
  const h = harness(); const first = h.video.show(); const ad = h.ads[0]; await loaded(ad);
  ad.listeners.Close({ isEnded: true }); await first;
  h.wx.createRewardedVideoAd = () => ad;
  const next = await h.video.show(); assert.equal(next.status, 'create-failed');
  assert.equal(next.rewarded, false); assert.equal(ad.destroyed, 1); h.video.destroy();
});

test('cleanup exceptions cannot prevent final settlement or cause another award', async () => {
  const h = harness(); const result = h.video.show(); const ad = h.ads[0]; await loaded(ad);
  const close = ad.listeners.Close;
  ad.offClose = () => { throw Error('native cleanup'); };
  ad.destroy = () => { throw Error('native destroy'); };
  close({ isEnded: true }); close({ isEnded: true });
  assert.equal((await result).rewarded, true); assert.equal(h.video.getState(), 'idle'); h.video.destroy();
});
