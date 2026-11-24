function today() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}
function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const parsed = new Date(y, m - 1, d);
  return parsed.getFullYear() === y && parsed.getMonth() === m - 1 && parsed.getDate() === d;
}
function dayNumber(date) {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
}
function daysSince(date) { return Math.max(0, dayNumber(today()) - dayNumber(date)); }
function shortDate(date) { const parts = date.split('-'); return Number(parts[1]) + '.' + Number(parts[2]); }
function weightRows(records) {
  return records.map((item, index) => {
    const delta = index ? Math.round((item.kg - records[index - 1].kg) * 100) / 100 : null;
    return Object.assign({}, item, {
      value: item.kg.toFixed(2), shortDate: shortDate(item.date),
      change: delta === null ? '第一次体重记录' : delta === 0 ? '与上次持平' : (delta > 0 ? '比上次增加 ' : '比上次减少 ') + Math.abs(delta).toFixed(2) + ' kg'
    });
  });
}
module.exports = { today, isDate, daysSince, shortDate, weightRows };
