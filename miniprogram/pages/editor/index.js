const store = require('../../utils/store');
const { today } = require('../../utils/format');
const seed = require('../../utils/seed');
const ui = require('../../utils/ui');
Page({
  data: { type: 'weight', date: '', minDate: seed.profile.birthday, maxDate: '', kg: '', title: '', description: '', categories: ['日常', '健康', '见面', '到家', '准备', '其他'], categoryIndex: 0, saving: false, error: '' },
  onLoad(query) {
    const type = query.type === 'event' ? 'event' : 'weight';
    this.setData({ type, date: today(), maxDate: today() });
    wx.setNavigationBarTitle({ title: type === 'weight' ? '记一次体重' : '记录一件小事' });
  },
  dateChange(e) { this.setData({ date: e.detail.value, error: '' }); },
  categoryChange(e) { this.setData({ categoryIndex: Number(e.detail.value) }); },
  input(e) {
    const field = e.currentTarget.dataset.field;
    if (['kg', 'title', 'description'].includes(field)) this.setData({ [field]: e.detail.value, error: '' });
  },
  save() {
    if (this.data.saving) return;
    this.setData({ saving: true, error: '' });
    try {
      const d = this.data;
      if (d.type === 'weight') store.addWeight(d.date, d.kg);
      else store.addEvent(d.date, d.title, d.description, d.categories[d.categoryIndex]);
    } catch (e) {
      this.setData({ saving: false, error: e.message }); return;
    }
    // 保存完成才离开页面；即使路由失败也不会重复写入。
    wx.showToast({ title: '已保存', icon: 'success' });
    wx.navigateBack({ fail: () => wx.switchTab({ url: this.data.type === 'weight' ? '/pages/growth/index' : '/pages/events/index' }) });
  },
  cancel() { wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/home/index' }) }); }
});
