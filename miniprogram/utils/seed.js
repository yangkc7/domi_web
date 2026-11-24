// 内容依据“网站”聊天及网站现有数据，日期统一为 2026 年。
const profile = {
  name: '哆咪', englishName: 'Domi', breed: '虎斑猫',
  birthday: '2026-07-14', homeDate: '2026-09-05',
  portrait: '/assets/profile-photo.jpg',
  introduction: '一只在夏天出生的小虎斑猫。妈妈曾是一只流浪蓝猫，2026 年 9 月 5 日，我带着好奇心走进了新的家。'
};
const weights = [
  { id: 'weight-0910', date: '2026-09-10', kg: 0.90 },
  { id: 'weight-0926', date: '2026-09-26', kg: 1.40 },
  { id: 'weight-1007', date: '2026-10-07', kg: 1.75 },
  { id: 'weight-1017', date: '2026-10-17', kg: 2.00 },
  { id: 'weight-1031', date: '2026-10-31', kg: 2.40 },
  { id: 'weight-1108', date: '2026-11-08', kg: 2.50 },
  { id: 'weight-1119', date: '2026-11-19', kg: 2.85 }
];
const events = [
  { id: 'event-0714', date: '2026-07-14', category: '出生', title: '来到这个世界', description: '妈妈是一只勇敢的流浪蓝猫。', photo: '' },
  { id: 'event-0904', date: '2026-09-04', category: '准备', title: '小猫用品就位', description: '小窝、餐具和玩具，家里开始有了哆咪的位置。', photo: '/assets/9.4.jpg' },
  { id: 'event-0905', date: '2026-09-05', category: '到家', title: '欢迎回家，哆咪', description: '第一次踏进新家，从此被温柔接住。', photo: '/assets/9.5.jpg' },
  { id: 'event-0912', date: '2026-09-12', category: '见面', title: '认识了新朋友', description: '第一次见到来家里的朋友，认真观察中。', photo: '/assets/9.12.jpg' },
  { id: 'event-0913', date: '2026-09-13', category: '健康', title: '第一次 PCR 检查', description: '去宠物医院检查打喷嚏的问题，勇敢完成检查。', photo: '/assets/9.13.jpg' },
  { id: 'event-0926', date: '2026-09-26', category: '健康', title: '第一次驱虫', description: '完成第一次驱虫，体重也长到了 1.40 kg。', photo: '/assets/9.26.jpg' },
  { id: 'event-1017', date: '2026-10-17', category: '健康', title: '第一针疫苗', description: '接种第一针疫苗。', photo: '' },
  { id: 'event-1122', date: '2026-11-22', category: '健康', title: '第二针疫苗', description: '接种第二针疫苗。', photo: '' }
];
const daily = [{
  id: 'daily-01', title: '妈妈给 Domi 喂奶', photo: '/assets/casual-1.jpg',
  description: '被妈妈护在怀里的时光，是哆咪最初、也最柔软的记忆。'
}];
const album = [
  { id: 'photo-01', photo: '/assets/profile-photo.jpg', title: '初见 · DOMI' },
  { id: 'photo-02', photo: '/assets/9.4.jpg', title: '期待见面' },
  { id: 'photo-03', photo: '/assets/9.5.jpg', title: '到家的第一天' },
  { id: 'photo-04', photo: '/assets/casual-1.jpg', title: '妈妈的怀抱' },
  { id: 'photo-05', photo: '/assets/9.12.jpg', title: '认识新朋友' },
  { id: 'photo-06', photo: '/assets/9.13.jpg', title: '勇敢的小猫' },
  { id: 'photo-07', photo: '/assets/9.26.jpg', title: '第一次驱虫' }
];
module.exports = { profile, weights, events, daily, album };
