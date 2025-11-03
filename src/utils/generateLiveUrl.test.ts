/**
 * generateLiveUrl 函数测试文件
 * 用于验证闸站直播地址URL生成功能
 */

import {
  generateLiveUrl,
  generateLiveUrlTemplate,
  generateMultipleLiveUrls,
  isValidDeviceSerial,
  isValidChannelNo,
  getGateStationName,
  getAllGateStations,
  GATE_STATIONS,
  CHANNEL_RANGE
} from './generateLiveUrl';

// 测试用的访问令牌
const TEST_ACCESS_TOKEN = 'at.2k2l8829cqc9iq0s7bhzq8xd50fgrts7-1ovuiu5u3n-1ek14dn-knctipl8g';

/**
 * 运行所有测试
 */
export function runTests() {
  console.log('🧪 开始运行 generateLiveUrl 函数测试...\n');

  try {
    testValidDeviceSerial();
    testValidChannelNo();
    testGetGateStationName();
    testGenerateLiveUrl();
    testGenerateLiveUrlTemplate();
    testGenerateMultipleLiveUrls();
    testGetAllGateStations();
    testErrorHandling();
    
    console.log('✅ 所有测试通过！');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

/**
 * 测试设备序列号验证
 */
function testValidDeviceSerial() {
  console.log('📋 测试设备序列号验证...');
  
  // 有效的设备序列号
  const validDevices = Object.keys(GATE_STATIONS);
  validDevices.forEach(device => {
    if (!isValidDeviceSerial(device)) {
      throw new Error(`设备序列号 ${device} 应该是有效的`);
    }
  });
  
  // 无效的设备序列号
  const invalidDevices = ['FT0000000', 'INVALID', '', 'FT123'];
  invalidDevices.forEach(device => {
    if (isValidDeviceSerial(device)) {
      throw new Error(`设备序列号 ${device} 应该是无效的`);
    }
  });
  
  console.log('  ✓ 设备序列号验证测试通过');
}

/**
 * 测试通道号验证
 */
function testValidChannelNo() {
  console.log('📋 测试通道号验证...');
  
  // 有效的通道号
  for (let i = CHANNEL_RANGE.MIN; i <= CHANNEL_RANGE.MAX; i++) {
    if (!isValidChannelNo(i)) {
      throw new Error(`通道号 ${i} 应该是有效的`);
    }
  }
  
  // 无效的通道号
  const invalidChannels = [0, 5, -1, 1.5, NaN, Infinity];
  invalidChannels.forEach(channel => {
    if (isValidChannelNo(channel)) {
      throw new Error(`通道号 ${channel} 应该是无效的`);
    }
  });
  
  console.log('  ✓ 通道号验证测试通过');
}

/**
 * 测试获取闸站名称
 */
function testGetGateStationName() {
  console.log('📋 测试获取闸站名称...');
  
  // 测试有效设备
  Object.entries(GATE_STATIONS).forEach(([deviceSerial, expectedName]) => {
    const actualName = getGateStationName(deviceSerial);
    if (actualName !== expectedName) {
      throw new Error(`设备 ${deviceSerial} 的名称应该是 ${expectedName}，实际是 ${actualName}`);
    }
  });
  
  // 测试无效设备
  const invalidDevice = 'FT0000000';
  const result = getGateStationName(invalidDevice);
  if (result !== null) {
    throw new Error(`无效设备 ${invalidDevice} 应该返回 null`);
  }
  
  console.log('  ✓ 获取闸站名称测试通过');
}

/**
 * 测试生成直播地址URL
 */
function testGenerateLiveUrl() {
  console.log('📋 测试生成直播地址URL...');
  
  // 测试有效参数
  const deviceSerial = 'FT8680213';
  const channelNo = 1;
  const url = generateLiveUrl(deviceSerial, channelNo, TEST_ACCESS_TOKEN);
  
  const expectedUrl = `https://open.ys7.com/api/lapp/v2/live/address/get?accessToken=${TEST_ACCESS_TOKEN}&deviceSerial=${deviceSerial}&channelNo=${channelNo}&protocol=4&supportH265=0`;
  
  if (url !== expectedUrl) {
    throw new Error(`生成的URL不正确:\n期望: ${expectedUrl}\n实际: ${url}`);
  }
  
  console.log('  ✓ 生成直播地址URL测试通过');
  console.log(`  📄 示例URL: ${url.substring(0, 80)}...`);
}

/**
 * 测试生成URL模板
 */
function testGenerateLiveUrlTemplate() {
  console.log('📋 测试生成URL模板...');
  
  const deviceSerial = 'FT8680213';
  const channelNo = 2;
  const template = generateLiveUrlTemplate(deviceSerial, channelNo);
  
  const expectedTemplate = `https://open.ys7.com/api/lapp/v2/live/address/get?accessToken={{accessToken}}&deviceSerial=${deviceSerial}&channelNo=${channelNo}&protocol=4&supportH265=0`;
  
  if (template !== expectedTemplate) {
    throw new Error(`生成的URL模板不正确:\n期望: ${expectedTemplate}\n实际: ${template}`);
  }
  
  console.log('  ✓ 生成URL模板测试通过');
}

/**
 * 测试批量生成URL
 */
function testGenerateMultipleLiveUrls() {
  console.log('📋 测试批量生成URL...');
  
  const configs = [
    { deviceSerial: 'FT8680213', channelNo: 1 },
    { deviceSerial: 'FT4489367', channelNo: 2 },
    { deviceSerial: 'FT8680159', channelNo: 3 }
  ];
  
  const results = generateMultipleLiveUrls(configs, TEST_ACCESS_TOKEN);
  
  if (results.length !== configs.length) {
    throw new Error(`结果数量不正确，期望 ${configs.length}，实际 ${results.length}`);
  }
  
  results.forEach((result, index) => {
    const config = configs[index];
    if (result.deviceSerial !== config.deviceSerial || result.channelNo !== config.channelNo) {
      throw new Error(`结果 ${index} 的配置不匹配`);
    }
    if (!result.url.includes(config.deviceSerial)) {
      throw new Error(`结果 ${index} 的URL不包含设备序列号`);
    }
    if (!result.stationName || result.stationName === '未知闸站') {
      throw new Error(`结果 ${index} 的闸站名称无效`);
    }
  });
  
  console.log('  ✓ 批量生成URL测试通过');
}

/**
 * 测试获取所有闸站信息
 */
function testGetAllGateStations() {
  console.log('📋 测试获取所有闸站信息...');
  
  const stations = getAllGateStations();
  const expectedCount = Object.keys(GATE_STATIONS).length;
  
  if (stations.length !== expectedCount) {
    throw new Error(`闸站数量不正确，期望 ${expectedCount}，实际 ${stations.length}`);
  }
  
  stations.forEach(station => {
    if (!station.deviceSerial || !station.name || !Array.isArray(station.channels)) {
      throw new Error('闸站信息结构不正确');
    }
    if (station.channels.length !== 4) {
      throw new Error(`通道数量应该是4，实际是 ${station.channels.length}`);
    }
  });
  
  console.log('  ✓ 获取所有闸站信息测试通过');
  console.log(`  📊 共找到 ${stations.length} 个闸站`);
}

/**
 * 测试错误处理
 */
function testErrorHandling() {
  console.log('📋 测试错误处理...');
  
  // 测试无效设备序列号
  try {
    generateLiveUrl('INVALID', 1, TEST_ACCESS_TOKEN);
    throw new Error('应该抛出无效设备序列号错误');
  } catch (error: any) {
    if (!error.message.includes('无效的设备序列号')) {
      throw new Error('错误信息不正确');
    }
  }
  
  // 测试无效通道号
  try {
    generateLiveUrl('FT8680213', 5, TEST_ACCESS_TOKEN);
    throw new Error('应该抛出无效通道号错误');
  } catch (error: any) {
    if (!error.message.includes('无效的通道号')) {
      throw new Error('错误信息不正确');
    }
  }
  
  // 测试空访问令牌
  try {
    generateLiveUrl('FT8680213', 1, '');
    throw new Error('应该抛出空访问令牌错误');
  } catch (error: any) {
    if (!error.message.includes('访问令牌不能为空')) {
      throw new Error('错误信息不正确');
    }
  }
  
  console.log('  ✓ 错误处理测试通过');
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  runTests();
}