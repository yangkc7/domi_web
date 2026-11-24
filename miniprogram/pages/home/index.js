const seed = require('../../utils/seed');
const store = require('../../utils/store');
const format = require('../../utils/format');
const ui = require('../../utils/ui');
Page({
  data: { profile: seed.profile, age: 0, homeDays: 0, latestWeight: '—', recent: [], error: '' },
  onShow() {
    ui.syncTabBar(this, 0);
    this.setData({ age: format.daysSince(seed.profile.birthday), homeDays: format.daysSince(seed.profile.homeDate) });
    try {
      const weights = store.merged('weights');
      const latest = weights[weights.length - 1];
      this.setData({ latestWeight: latest.kg.toFixed(2), recent: store.merged('events').slice(-2).reverse(), error: '' });
    } catch (e) { this.setData({ error: e.message }); }
  },
  goGrowth() { wx.switchTab({ url: '/pages/growth/index' }); },
  goEvents() { wx.switchTab({ url: '/pages/events/index' }); },
  preview(e) { ui.preview(e); },
  onShareAppMessage: ui.share
});
