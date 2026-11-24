const seed = require('./seed');
const { isDate, today } = require('./format');
const KEY = 'domi-diary-records-v1';
function blank() { return { version: 1, weights: [], events: [] }; }
function validateDate(date) {
  if (!isDate(date) || date < seed.profile.birthday || date > today()) throw new Error('请选择生日至今天之间的日期');
}
function read() {
  let data;
  try { data = wx.getStorageSync(KEY); } catch (e) { throw new Error('暂时无法读取本机记录，请稍后重试'); }
  if (data === '' || data === undefined || data === null) return blank();
  if (data.version !== 1 || !Array.isArray(data.weights) || !Array.isArray(data.events)) throw new Error('本机记录格式异常，请先备份微信数据');
  if (data.weights.some(x => !x || typeof x.id !== 'string' || !isDate(x.date) || typeof x.kg !== 'number' || !Number.isFinite(x.kg) || x.kg <= 0 || x.kg > 30) ||
      data.events.some(x => !x || typeof x.id !== 'string' || !isDate(x.date) || typeof x.title !== 'string' || typeof x.description !== 'string' || typeof x.category !== 'string')) {
    throw new Error('本机记录内容异常，请先备份微信数据');
  }
  return data;
}
function write(data) {
  try { wx.setStorageSync(KEY, data); } catch (e) { throw new Error('保存失败，本机空间可能不足，请重试'); }
}
function merged(type) {
  return seed[type].map(x => Object.assign({}, x, { custom: false }))
    .concat(read()[type].map(x => Object.assign({}, x, { custom: true })))
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}
function addWeight(date, input) {
  validateDate(date);
  if (typeof input !== 'string' || !/^\d{1,2}(\.\d{1,2})?$/.test(input.trim())) throw new Error('请输入有效体重，最多保留两位小数');
  const kg = Number(input);
  if (!Number.isFinite(kg) || kg <= 0 || kg > 30) throw new Error('体重需大于 0 且不超过 30 kg');
  if (merged('weights').some(x => x.date === date)) throw new Error('这一天已有体重记录，请选择其他日期');
  const data = read();
  data.weights.push({ id: 'custom-weight-' + Date.now(), date, kg });
  write(data);
}
function addEvent(date, title, description, category) {
  validateDate(date);
  title = String(title || '').trim(); description = String(description || '').trim();
  if (!title || title.length > 40) throw new Error('请填写 1—40 字的事件名称');
  if (description.length > 500) throw new Error('事件内容请控制在 500 字以内');
  if (!['日常', '健康', '见面', '到家', '准备', '其他'].includes(category)) throw new Error('请选择事件分类');
  const data = read();
  data.events.push({ id: 'custom-event-' + Date.now(), date, title, description, category, photo: '' });
  write(data);
}
function remove(type, id) {
  if (!['weights', 'events'].includes(type)) throw new Error('记录类型有误');
  const data = read();
  if (!data[type].some(x => x.id === id)) throw new Error('只能删除在本机新增的记录');
  data[type] = data[type].filter(x => x.id !== id);
  write(data);
}
module.exports = { merged, addWeight, addEvent, remove };
