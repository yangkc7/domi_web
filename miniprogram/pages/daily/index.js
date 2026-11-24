const seed = require('../../utils/seed');
const ui = require('../../utils/ui');
Page({
  data: { moments: seed.daily },
  onShow() { ui.syncTabBar(this, 3); },
  preview(e) { ui.preview(e, seed.daily.map(x => x.photo)); },
  onShareAppMessage: ui.share
});
