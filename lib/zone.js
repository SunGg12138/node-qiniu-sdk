// 区域详情
exports.list = [
  { zh: '华东', zone: 'z0' },
  { zh: '华北', zone: 'z1' },
  { zh: '华南', zone: 'z2' },
  { zh: '北美', zone: 'na0' },
  { zh: '东南亚', zone: 'as0' },
];

// 区域列表
exports.zones = [ 'z0', 'z1', 'z2', 'na0', 'as0' ];

// 验证用户输入的区域是否有效
// 七牛云有可能新增区域，在这里只是发出警告
exports.warn = function(zone){
  if (!this.zones.includes(zone)) {
    console.warn('⚠️ 七牛云没有 ' + zone + ' 这个区域');
  }
};