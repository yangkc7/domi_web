const store = require('../../utils/store');
const ui = require('../../utils/ui');
Page({
  data: { records: [], filtered: [], filter: '全部', error: '' },
  onShow() { ui.syncTabBar(this, 2); this.refresh(); },
  refresh() {
    try {
      const records = store.merged('events').reverse();
      this.setData({ records, error: '' }); this.applyFilter();
    } catch (e) { this.setData({ error: e.message }); }
  },
  filter(e) { this.setData({ filter: e.currentTarget.dataset.filter }); this.applyFilter(); },
  applyFilter() { this.setData({ filtered: this.data.records.filter(x => this.data.filter === '全部' || x.category === '健康') }); },
  preview(e) { ui.preview(e, this.data.filtered.map(x => x.photo).filter(Boolean)); },
  remove(e) { ui.confirmRemove(this, 'events', e); },
  onShareAppMessage: ui.share
});
