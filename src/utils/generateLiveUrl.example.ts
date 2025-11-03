/**
 * generateLiveUrl 函数使用示例
 * 展示如何使用闸站直播地址URL生成工具
 */

import generateLiveUrl, {
  generateLiveUrlTemplate,
  generateMultipleLiveUrls,
  getAllGateStations,
  getGateStationName,
  isValidDeviceSerial,
  isValidChannelNo,
  GATE_STATIONS
} from './generateLiveUrl';

// 示例访问令牌
const ACCESS_TOKEN = 'at.2k2l8829cqc9iq0s7bhzq8xd50fgrts7-1ovuiu5u3n-1ek14dn-knctipl8g';

/**
 * 基本使用示例
 */
export function basicUsageExample() {
  console.log('=== 基本使用示例 ===\n');

  try {
    // 生成单个闸站的直播地址
    const deviceSerial = 'FT8680213'; // 松溪左岸3号闸站
    const channelNo = 1;
    
    const liveUrl = generateLiveUrl(deviceSerial, channelNo, ACCESS_TOKEN);
    
    console.log(`闸站: ${getGateStationName(deviceSerial)}`);
    console.log(`设备序列号: ${deviceSerial}`);
    console.log(`通道号: ${channelNo}`);
    console.log(`直播地址: ${liveUrl}\n`);
    
  } catch (error: any) {
    console.error('生成直播地址失败:', error.message);
  }
}

/**
 * 批量生成示例
 */
export function batchGenerationExample() {
  console.log('=== 批量生成示例 ===\n');

  try {
    // 定义多个闸站配置
    const configs = [
      { deviceSerial: 'FT4489367', channelNo: 1 }, // 松溪右岸2号闸站
      { deviceSerial: 'FT4489479', channelNo: 2 }, // 松溪右岸1号闸站
      { deviceSerial: 'FT8680159', channelNo: 3 }, // 松溪左岸1号闸站
      { deviceSerial: 'FT4489510', channelNo: 4 }, // 松溪左岸2号闸站
      { deviceSerial: 'FT8680213', channelNo: 1 }  // 松溪左岸3号闸站
    ];

    const results = generateMultipleLiveUrls(configs, ACCESS_TOKEN);

    console.log(`成功生成 ${results.length} 个直播地址:\n`);
    
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.stationName}`);
      console.log(`   设备: ${result.deviceSerial}, 通道: ${result.channelNo}`);
      console.log(`   地址: ${result.url.substring(0, 80)}...\n`);
    });

  } catch (error: any) {
    console.error('批量生成失败:', error.message);
  }
}

/**
 * 模板生成示例
 */
export function templateGenerationExample() {
  console.log('=== 模板生成示例 ===\n');

  try {
    const deviceSerial = 'FT8680213';
    const channelNo = 2;
    
    const template = generateLiveUrlTemplate(deviceSerial, channelNo);
    
    console.log(`闸站: ${getGateStationName(deviceSerial)}`);
    console.log(`URL模板: ${template}\n`);
    console.log('注意: 模板中的 {{accessToken}} 需要替换为实际的访问令牌\n');
    
  } catch (error: any) {
    console.error('生成模板失败:', error.message);
  }
}

/**
 * 获取所有闸站信息示例
 */
export function getAllStationsExample() {
  console.log('=== 获取所有闸站信息示例 ===\n');

  const stations = getAllGateStations();
  
  console.log(`共有 ${stations.length} 个闸站:\n`);
  
  stations.forEach((station, index) => {
    console.log(`${index + 1}. ${station.name}`);
    console.log(`   设备序列号: ${station.deviceSerial}`);
    console.log(`   支持通道: ${station.channels.join(', ')}\n`);
  });
}

/**
 * 参数验证示例
 */
export function validationExample() {
  console.log('=== 参数验证示例 ===\n');

  // 验证设备序列号
  const testDevices = ['FT8680213', 'FT0000000', 'INVALID'];
  console.log('设备序列号验证:');
  testDevices.forEach(device => {
    const isValid = isValidDeviceSerial(device);
    const name = getGateStationName(device);
    console.log(`  ${device}: ${isValid ? '✓ 有效' : '✗ 无效'} ${name ? `(${name})` : ''}`);
  });

  console.log('\n通道号验证:');
  const testChannels = [1, 2, 3, 4, 0, 5, -1, 1.5];
  testChannels.forEach(channel => {
    const isValid = isValidChannelNo(channel);
    console.log(`  ${channel}: ${isValid ? '✓ 有效' : '✗ 无效'}`);
  });
  console.log();
}

/**
 * 错误处理示例
 */
export function errorHandlingExample() {
  console.log('=== 错误处理示例 ===\n');

  // 无效设备序列号
  try {
    generateLiveUrl('INVALID_DEVICE', 1, ACCESS_TOKEN);
  } catch (error: any) {
    console.log('❌ 无效设备序列号错误:', error.message);
  }

  // 无效通道号
  try {
    generateLiveUrl('FT8680213', 5, ACCESS_TOKEN);
  } catch (error: any) {
    console.log('❌ 无效通道号错误:', error.message);
  }

  // 空访问令牌
  try {
    generateLiveUrl('FT8680213', 1, '');
  } catch (error: any) {
    console.log('❌ 空访问令牌错误:', error.message);
  }
  console.log();
}

/**
 * 实际应用场景示例
 */
export function practicalUsageExample() {
  console.log('=== 实际应用场景示例 ===\n');

  // 场景1: 根据用户选择生成直播地址
  function generateUrlForUserSelection(stationName: string, channelNo: number) {
    // 根据闸站名称查找设备序列号
    const deviceSerial = Object.entries(GATE_STATIONS)
      .find(([_, name]) => name === stationName)?.[0];
    
    if (!deviceSerial) {
      throw new Error(`未找到闸站: ${stationName}`);
    }
    
    return generateLiveUrl(deviceSerial, channelNo, ACCESS_TOKEN);
  }

  try {
    const url = generateUrlForUserSelection('松溪左岸3号闸站', 2);
    console.log('用户选择场景:');
    console.log(`  闸站: 松溪左岸3号闸站`);
    console.log(`  通道: 2`);
    console.log(`  地址: ${url.substring(0, 80)}...\n`);
  } catch (error: any) {
    console.error('用户选择场景失败:', error.message);
  }

  // 场景2: 生成所有闸站的第1通道地址
  console.log('所有闸站第1通道地址:');
  const allStations = getAllGateStations();
  allStations.forEach(station => {
    try {
      const url = generateLiveUrl(station.deviceSerial, 1, ACCESS_TOKEN);
      console.log(`  ${station.name}: ${url.substring(0, 60)}...`);
    } catch (error: any) {
      console.error(`  ${station.name}: 生成失败 - ${error.message}`);
    }
  });
  console.log();
}

/**
 * 运行所有示例
 */
export function runAllExamples() {
  console.log('🚀 闸站直播地址URL生成工具使用示例\n');
  
  basicUsageExample();
  batchGenerationExample();
  templateGenerationExample();
  getAllStationsExample();
  validationExample();
  errorHandlingExample();
  practicalUsageExample();
  
  console.log('✅ 所有示例运行完成！');
}

// 如果直接运行此文件，执行所有示例
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  runAllExamples();
}