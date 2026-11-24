// 无外部依赖：结构检查及隔离的微信 API 行为验证。
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../miniprogram');
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
const all = files(root);
const config = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
const project = JSON.parse(fs.readFileSync(path.join(root, 'project.config.json'), 'utf8'));
assert.equal(project.miniprogramRoot, './');
assert.equal(project.compileType, 'miniprogram');
assert.equal(config.pages.length, 6);
assert.equal(config.tabBar.list.length, 5);
assert.equal(new Set(config.pages).size, config.pages.length);
for (const tab of config.tabBar.list) assert.ok(config.pages.includes(tab.pagePath), tab.pagePath);
for (const file of all) {
  const content = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.json')) JSON.parse(content);
  if (file.endsWith('.js')) new vm.Script(content, { filename: file });
}
const storage = new Map();
let failRead = false, failWrite = false;
const wx = {
  getStorageSync(key) { if (failRead) throw new Error('read'); return storage.has(key) ? JSON.parse(JSON.stringify(storage.get(key))) : ''; },
  setStorageSync(key, value) { if (failWrite) throw new Error('quota'); storage.set(key, JSON.parse(JSON.stringify(value))); },
  showToast() {}, setNavigationBarTitle() {},
  showModal({ success }) { success({ confirm: true }); },
  navigateBack() {}, switchTab() {}, navigateTo() {}, previewImage() {}
};
const cache = new Map();
const pageDefinitions = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} }; cache.set(file, mod);
  const context = { module: mod, exports: mod.exports, wx, Date, console,
    require: request => load(path.resolve(path.dirname(file), request + '.js')),
    Page: value => { pageDefinitions.set(file, value); }, App() {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  return mod.exports;
}
function pageAt(route) {
  load(path.join(root, route + '.js'));
  const page = Object.assign({}, pageDefinitions.get(path.join(root, route + '.js')));
  page.data = JSON.parse(JSON.stringify(page.data));
  page.setData = updates => Object.assign(page.data, updates);
  return page;
}
for (const route of config.pages) {
  for (const ext of ['.js', '.json', '.wxml', '.wxss']) assert.ok(fs.existsSync(path.join(root, route + ext)), route + ext);
  const page = pageAt(route);
  const template = fs.readFileSync(path.join(root, route + '.wxml'), 'utf8');
  for (const match of template.matchAll(/(?:bind|catch)(?::?[a-z]+)="([\w]+)"/g)) assert.equal(typeof page[match[1]], 'function', route + ' missing handler ' + match[1]);
  for (const match of template.matchAll(/<\/?([a-z][a-z-]*)\b/g)) assert.ok(['view', 'text', 'image', 'button', 'block', 'input', 'textarea', 'picker'].includes(match[1]), 'Unsupported element: ' + match[1]);
  for (const match of template.matchAll(/<image\b[^>]*>/g)) assert.match(match[0], /mode="widthFix"/, route + ' image must preserve ratio');
}
const seed = load(path.join(root, 'utils/seed.js'));
const store = load(path.join(root, 'utils/store.js'));
const format = load(path.join(root, 'utils/format.js'));
for (const item of [...seed.album, ...seed.events, ...seed.daily, { photo: seed.profile.portrait }]) {
  if (item.photo) assert.ok(fs.existsSync(path.join(root, item.photo)), 'Missing image ' + item.photo);
}
assert.equal(seed.profile.breed, '虎斑猫');
assert.match(seed.profile.introduction, /流浪蓝猫/);
assert.equal(seed.weights.length, 7);
assert.ok(!seed.weights.some(row => row.id === 'weight-0913'));
assert.equal(format.weightRows(store.merged('weights'))[1].change, '比上次增加 0.50 kg');
assert.equal(seed.events.length, 8);
assert.equal(seed.album.length, 7);
assert.equal(seed.weights[3].kg, 2);
assert.equal(seed.weights[4].date, '2026-10-31');
assert.equal(seed.weights[4].kg, 2.4);
assert.equal(seed.weights[5].date, '2026-11-08');
assert.equal(seed.weights[5].kg, 2.5);
assert.equal(seed.weights[6].date, '2026-11-19');
assert.equal(seed.weights[6].kg, 2.85);
assert.equal(format.weightRows(store.merged('weights'))[6].change, '比上次增加 0.35 kg');
assert.equal(format.weightRows(store.merged('weights'))[5].change, '比上次增加 0.10 kg');
assert.equal(format.weightRows(store.merged('weights'))[4].change, '比上次增加 0.40 kg');
assert.equal(seed.events[6].title, '第一针疫苗');
assert.equal(seed.events[7].date, '2026-11-22');
assert.equal(seed.events[7].title, '第二针疫苗');
assert.equal(seed.events[7].category, '健康');
assert.equal(format.weightRows(store.merged('weights'))[3].change, '比上次增加 0.25 kg');
assert.equal(format.isDate('2026-02-30'), false);
assert.equal(format.isDate('2028-02-29'), true);
assert.equal(format.isDate('2026-2-03'), false);
assert.equal(format.shortDate('2026-10-07'), '10.7');
assert.ok(format.daysSince(seed.profile.birthday) >= 0);
store.addWeight('2026-11-20', '2.15');
assert.equal(store.merged('weights').length, 8);
assert.equal(store.merged('weights')[7].kg, 2.15);
assert.equal(store.merged('weights')[7].custom, true);
assert.throws(() => store.addWeight('2026-10-17', '2.1'), /已有体重/);
assert.throws(() => store.addWeight('2026-11-20', '2.2'), /已有体重/);
for (const invalid of ['', '-1', '0', '31', '1.234', 'abc', '2kg', 'NaN']) assert.throws(() => store.addWeight('2026-10-19', invalid));
assert.throws(() => store.addWeight('2026-02-30', '2'), /日期/);
assert.throws(() => store.addWeight('2099-01-01', '2'), /日期/);
assert.throws(() => store.addWeight('2026-07-13', '2'), /日期/);
assert.throws(() => store.remove('weights', seed.weights[0].id), /只能删除/);
store.remove('weights', store.merged('weights')[7].id);
assert.equal(store.merged('weights').length, 7);
store.addEvent('2026-11-23', '  剪指甲  ', '  很乖  ', '日常');
assert.equal(store.merged('events').slice(-1)[0].title, '剪指甲');
assert.equal(store.merged('events').slice(-1)[0].description, '很乖');
assert.throws(() => store.addEvent('2026-11-20', ' ', '', '健康'), /事件名称/);
assert.throws(() => store.addEvent('2026-11-20', 'a'.repeat(41), '', '健康'), /事件名称/);
assert.throws(() => store.addEvent('2026-11-20', '事件', 'a'.repeat(501), '健康'), /500/);
assert.throws(() => store.addEvent('2026-11-20', '事件', '', 'unknown'), /分类/);
store.remove('events', store.merged('events').slice(-1)[0].id);
const home = pageAt('pages/home/index'); home.onShow();
assert.equal(home.data.latestWeight, '2.85');
assert.equal(home.data.recent[0].title, '第二针疫苗');
const growth = pageAt('pages/growth/index'); growth.onShow();
assert.equal(growth.data.rows.length, 7);
assert.equal(growth.data.latest.value, '2.85');
assert.ok(growth.data.chart.every(x => x.y >= 50 && x.y <= 230 && x.x >= 32 && x.x <= 528));
assert.equal(growth.data.chartSegments.length, growth.data.chart.length - 1);
assert.ok(growth.data.chartSegments.every(x => Number.isFinite(x.length) && x.length > 0 && Number.isFinite(x.angle)));
const points = growth.data.chart;
assert.ok(Math.abs((points[1].x - points[0].x) / (points[2].x - points[1].x) - 16 / 11) < 1e-10, 'point distances must follow actual elapsed days');
const ticks = growth.data.chartTicks;
for (let i = 2; i < ticks.length; i++) {
  assert.equal(Date.parse(ticks[i].date) - Date.parse(ticks[i - 1].date), Date.parse(ticks[1].date) - Date.parse(ticks[0].date), 'axis ticks must have equal time intervals');
  assert.ok(Math.abs((ticks[i].x - ticks[i - 1].x) - (ticks[1].x - ticks[0].x)) < 1e-10);
}
const events = pageAt('pages/events/index'); events.onShow();
assert.equal(events.data.filtered.length, 8);
events.filter({ currentTarget: { dataset: { filter: '健康' } } });
assert.equal(events.data.filtered.length, 4);
store.addWeight('2026-11-20', '2.80'); growth.onShow(); home.onShow();
assert.equal(growth.data.latest.change, '比上次减少 0.05 kg');
assert.equal(home.data.latestWeight, '2.80');
const ui = load(path.join(root, 'utils/ui.js'));
ui.confirmRemove(growth, 'weights', { currentTarget: { dataset: { id: growth.data.latest.id, custom: true } } });
assert.equal(growth.data.latest.value, '2.85');
const editor = pageAt('pages/editor/index'); editor.onLoad({ type: 'weight' });
editor.setData({ date: '2026-11-20', kg: '2.15' }); editor.save(); editor.save();
assert.equal(store.merged('weights').length, 8, 'double submit is prevented');
store.remove('weights', store.merged('weights').slice(-1)[0].id);
editor.setData({ saving: false, kg: '0' }); editor.save();
assert.equal(editor.data.saving, false);
assert.ok(editor.data.error);
failWrite = true;
assert.throws(() => store.addWeight('2026-11-20', '2.15'), /保存失败/);
failWrite = false;
assert.equal(store.merged('weights').length, 7, 'failed writes do not leave phantom data');
failRead = true;
assert.throws(() => store.merged('weights'), /读取/);
failRead = false;
storage.set('domi-diary-records-v1', { version: 9 });
assert.throws(() => store.merged('weights'), /格式异常/);
storage.set('domi-diary-records-v1', { version: 1, weights: [{ id: 'x', date: '2026-11-20', kg: 'bad' }], events: [] });
assert.throws(() => store.merged('weights'), /内容异常/);
const bytes = all.filter(f => !f.endsWith('README.md')).reduce((sum, f) => sum + fs.statSync(f).size, 0);
assert.ok(bytes < 2 * 1024 * 1024, 'Main package must remain under 2 MiB');
console.log('PASS: configuration, six pages, handlers, seven images and original photo ratios');
console.log('PASS: seven weights, eight events, filters, validation, local persistence, deletion, save failures and double-submit protection');
console.log('Package: ' + (bytes / 1024 / 1024).toFixed(2) + ' MiB');
