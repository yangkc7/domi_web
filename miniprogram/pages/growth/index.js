const store = require('../../utils/store');
const format = require('../../utils/format');
const ui = require('../../utils/ui');
function dateDay(date) {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}
Page({
  data: { rows: [], chart: [], chartSegments: [], chartTicks: [], latest: null, count: 0, error: '' },
  onShow() { ui.syncTabBar(this, 1); this.refresh(); },
  refresh() {
    try {
      const rows = format.weightRows(store.merged('weights'));
      const recent = rows.slice(-8);
      const max = Math.max.apply(null, recent.map(x => x.kg));
      const firstDay = dateDay(recent[0].date);
      const lastDay = dateDay(recent[recent.length - 1].date);
      const axisStart = recent.length === 1 ? firstDay - 1 : firstDay;
      const span = recent.length === 1 ? 2 : Math.max(1, lastDay - firstDay);
      const desiredStep = span / 5;
      const step = [1, 2, 3, 7, 14, 30, 60, 90, 180, 365].find(days => days >= desiredStep) || Math.ceil(desiredStep / 365) * 365;
      const axisSpan = Math.ceil(span / step) * step;
      const chartTicks = [];
      for (let offset = 0; offset <= axisSpan; offset += step) {
        const date = new Date((axisStart + offset) * 86400000).toISOString().slice(0, 10);
        chartTicks.push({ date, label: format.shortDate(date), x: 32 + offset / axisSpan * 496 });
      }
      const chart = recent.map(item => Object.assign({}, item, {
        x: 32 + (dateDay(item.date) - axisStart) / axisSpan * 496,
        y: 230 - item.kg / max * 180,
        labelY: 230 - item.kg / max * 180 - 44
      }));
      // 所有数值都在折线上方；日期相近时向上错层，保持数据点位置不变。
      chart.forEach((point, index) => {
        const previous = chart[index - 1];
        if (previous && point.x - previous.x < 52 && Math.abs(point.labelY - previous.labelY) < 34) point.labelY = Math.min(point.labelY, previous.labelY - 34);
      });
      const chartSegments = chart.slice(1).map((point, index) => {
        const previous = chart[index];
        const dx = point.x - previous.x;
        const dy = point.y - previous.y;
        return {
          id: point.id, x: previous.x, y: previous.y,
          length: Math.sqrt(dx * dx + dy * dy), angle: Math.atan2(dy, dx) * 180 / Math.PI
        };
      });
      this.setData({
        latest: rows[rows.length - 1], count: rows.length, rows: rows.slice().reverse(), error: '',
        chart, chartSegments, chartTicks
      });
    } catch (e) { this.setData({ error: e.message }); }
  },
  remove(e) { ui.confirmRemove(this, 'weights', e); },
  onShareAppMessage: ui.share
});
