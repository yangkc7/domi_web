const store = require('./store');
function showError(error) { wx.showToast({ title: error.message || '操作失败，请重试', icon: 'none', duration: 3000 }); }
function preview(event, urls) {
  const current = event.currentTarget.dataset.src;
  if (current) wx.previewImage({ current, urls: urls && urls.length ? urls : [current], fail: () => showError(new Error('照片暂时无法打开')) });
}
function confirmRemove(page, type, event) {
  const { id, custom } = event.currentTarget.dataset;
  if (!custom) return;
  wx.showModal({
    title: '删除这条记录？', content: '删除后无法恢复，网站中的原始记录会保留。', confirmColor: '#4f7088',
    success(result) {
      if (!result.confirm) return;
      try { store.remove(type, id); page.refresh(); wx.showToast({ title: '已删除', icon: 'success' }); }
      catch (error) { showError(error); }
    }
  });
}
function share() { return { title: '哆咪 Domi 的成长日记', path: '/pages/home/index' }; }
function syncTabBar(page, selected) {
  if (typeof page.getTabBar !== 'function') return;
  const bar = page.getTabBar();
  if (bar) bar.setData({ selected });
}
module.exports = { showError, preview, confirmRemove, share, syncTabBar };
