const seed = require('../../utils/seed');
const ui = require('../../utils/ui');
Page({
  data: { photos: seed.album },
  onShow() { ui.syncTabBar(this, 4); },
  preview(e) { ui.preview(e, seed.album.map(x => x.photo)); },
  onShareAppMessage: ui.share
});
