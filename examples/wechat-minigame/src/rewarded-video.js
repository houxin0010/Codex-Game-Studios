/**
 * Dependency-injected rewarded-video adapter. Call show() from a player action;
 * its Promise resolves once on close/error, never merely on show() success.
 * Example: createRewardedVideo(wx, { adUnitId }).show().then(handleResult).
 * Rewards are session-local; valuable server rewards need server idempotency.
 */
function createRewardedVideo(wx, { adUnitId = '' } = {}) {
  const configured = typeof adUnitId === 'string' && adUnitId.trim().length > 0;
  const supported = typeof wx.createRewardedVideoAd === 'function';
  let state = !configured ? 'disabled' : !supported ? 'unsupported' : 'idle';
  let active = null;
  let destroyed = false;
  const usedAds = new WeakSet();

  function release(session) {
    if (!session.ad) return;
    // Cleanup must not prevent settlement even if a native cleanup call throws.
    for (const [method, callback] of [['offClose', session.close], ['offError', session.error], ['destroy']]) {
      try {
        if (typeof session.ad[method] === 'function') session.ad[method](callback);
      } catch (_) { /* Settlement remains final; stale callbacks are guarded. */ }
    }
  }
  function settle(session, status, error) {
    if (active !== session || session.settled) return;
    session.settled = true;
    active = null;
    state = destroyed ? 'destroyed' : status.endsWith('-failed') ? 'error' : 'idle';
    release(session);
    session.resolve({ status, rewarded: status === 'completed', ...(error === undefined ? {} : { error }) });
  }

  /** Load then show one fresh instance; concurrent calls resolve busy without reward. */
  function show() {
    if (destroyed) return Promise.resolve({ status: 'destroyed', rewarded: false });
    if (!configured || !supported) return Promise.resolve({ status: state, rewarded: false });
    if (active) return Promise.resolve({ status: 'busy', rewarded: false });
    let resolve;
    const result = new Promise(yes => { resolve = yes; });
    const session = { resolve, ad: null, settled: false, phase: 'create' };
    active = session; state = 'loading';
    session.close = response => {
      if (session.phase !== 'show') return;
      settle(session, response && response.isEnded === true ? 'completed' : 'incomplete');
    };
    session.error = error => settle(session, session.phase === 'show' ? 'show-failed' : 'load-failed', error);
    try {
      const ad = wx.createRewardedVideoAd({ adUnitId, multiton: true });
      // Old singleton implementations cannot isolate late callbacks across attempts.
      if (!ad || usedAds.has(ad)) throw Error('A fresh rewarded-video instance is required');
      usedAds.add(ad); session.ad = ad;
      for (const method of ['load', 'show', 'onClose', 'offClose', 'onError', 'offError', 'destroy']) {
        if (typeof ad[method] !== 'function') throw Error('Rewarded-video API unavailable: ' + method);
      }
      ad.onClose(session.close); ad.onError(session.error);
      session.phase = 'load';
      Promise.resolve().then(() => {
        if (active === session) return ad.load();
      }).then(() => {
        if (active !== session) return;
        state = 'ready';
        // Set phase before show: some SDK callbacks arrive before its Promise resolves.
        session.phase = 'show'; state = 'showing';
        return ad.show();
      }).catch(error => {
        settle(session, session.phase === 'show' ? 'show-failed' : 'load-failed', error);
      });
    } catch (error) { settle(session, 'create-failed', error); }
    return result;
  }
  /** Dispose listeners/instance and settle any outstanding attempt without reward. */
  function destroy() {
    if (destroyed) return;
    destroyed = true; state = 'destroyed';
    if (active) settle(active, 'destroyed');
  }
  /** idle/loading/ready/showing/error/disabled/unsupported/destroyed. */
  function getState() { return state; }
  return { show, getState, destroy };
}
module.exports = { createRewardedVideo };
