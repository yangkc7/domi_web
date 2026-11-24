Component({
  data: {
    selected: 0,
    tabs: [
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/growth/index', text: '成长' },
      { pagePath: 'pages/events/index', text: '事件' },
      { pagePath: 'pages/daily/index', text: '日常' },
      { pagePath: 'pages/album/index', text: '相册' }
    ]
  },
  lifetimes: {
    attached() { this.syncSelection(); }
  },
  pageLifetimes: {
    show() { this.syncSelection(); }
  },
  methods: {
    syncSelection() {
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      if (!current) return;
      const selected = this.data.tabs.findIndex(tab => tab.pagePath === current.route);
      if (selected !== -1) this.setData({ selected });
    },
    switchTab(event) {
      const index = Number(event.currentTarget.dataset.index);
      const tab = this.data.tabs[index];
      if (!tab || index === this.data.selected) return;
      // 由目标页面 onShow 更新选中态，跳转失败时仍高亮原栏目。
      wx.switchTab({
        url: '/' + tab.pagePath,
        fail() { wx.showToast({ title: '切换失败，请重试', icon: 'none' }); }
      });
    }
  }
});
