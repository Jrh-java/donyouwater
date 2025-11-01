/**
 * 闸站直播地址URL生成工具
 * 用于生成指定闸站的萤石云直播地址URL
 */

// 支持的闸站配置
export const GATE_STATIONS = {
  'FT8680159': '松溪左岸1号闸站',
  'FT4489510': '松溪左岸2号闸站',
  'FT8680213': '松溪左岸3号闸站',
  'FT4489479': '松溪右岸1号闸站',
  'FT4489367': '松溪右岸2号闸站'
} as const;

// 支持的设备序列号类型
export type DeviceSerial = keyof typeof GATE_STATIONS;

// 支持的通道号范围
export const CHANNEL_RANGE = {
  MIN: 1,
  MAX: 4
} as const;

// 萤石云API配置
export const YS7_API_CONFIG = {
  BASE_URL: 'https://open.ys7.com/api/lapp/v2/live/address/get',
  SUPPORT_H265: 0
} as const;

/**
 * 验证设备序列号是否有效
 * @param deviceSerial 设备序列号
 * @returns 是否有效
 */
export function isValidDeviceSerial(deviceSerial: string): deviceSerial is DeviceSerial {
  return deviceSerial in GATE_STATIONS;
}

/**
 * 验证通道号是否有效
 * @param channelNo 通道号
 * @returns 是否有效
 */
export function isValidChannelNo(channelNo: number): boolean {
  return Number.isInteger(channelNo) && 
         channelNo >= CHANNEL_RANGE.MIN && 
         channelNo <= CHANNEL_RANGE.MAX;
}

/**
 * 获取闸站名称
 * @param deviceSerial 设备序列号
 * @returns 闸站名称，如果设备序列号无效则返回null
 */
export function getGateStationName(deviceSerial: string): string | null {
  if (isValidDeviceSerial(deviceSerial)) {
    return GATE_STATIONS[deviceSerial];
  }
  return null;
}

/**
 * 生成闸站直播地址URL
 * @param deviceSerial 设备序列号
 * @param channelNo 通道号 (1-4)
 * @param accessToken 访问令牌
 * @returns 完整的API请求URL
 * @throws Error 当参数无效时抛出错误
 */
export function generateLiveUrl(
  deviceSerial: string, 
  channelNo: number, 
  accessToken: string
): string {
  // 验证设备序列号
  if (!isValidDeviceSerial(deviceSerial)) {
    const supportedDevices = Object.keys(GATE_STATIONS).join(', ');
    throw new Error(
      `无效的设备序列号: ${deviceSerial}。支持的设备序列号: ${supportedDevices}`
    );
  }

  // 验证通道号
  if (!isValidChannelNo(channelNo)) {
    throw new Error(
      `无效的通道号: ${channelNo}。通道号必须在 ${CHANNEL_RANGE.MIN}-${CHANNEL_RANGE.MAX} 范围内`
    );
  }

  // 验证访问令牌
  if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
    throw new Error('访问令牌不能为空');
  }

  // 构建URL参数
  const params = new URLSearchParams({
    accessToken: accessToken.trim(),
    deviceSerial: deviceSerial,
    channelNo: channelNo.toString(),
    supportH265: YS7_API_CONFIG.SUPPORT_H265.toString()
  });

  // 生成完整URL
  const fullUrl = `${YS7_API_CONFIG.BASE_URL}?${params.toString()}`;
  
  return fullUrl;
}

/**
 * 生成闸站直播地址URL（不需要accessToken，用于模板生成）
 * @param deviceSerial 设备序列号
 * @param channelNo 通道号 (1-4)
 * @returns URL模板字符串
 * @throws Error 当参数无效时抛出错误
 */
export function generateLiveUrlTemplate(
  deviceSerial: string, 
  channelNo: number
): string {
  // 验证设备序列号
  if (!isValidDeviceSerial(deviceSerial)) {
    const supportedDevices = Object.keys(GATE_STATIONS).join(', ');
    throw new Error(
      `无效的设备序列号: ${deviceSerial}。支持的设备序列号: ${supportedDevices}`
    );
  }

  // 验证通道号
  if (!isValidChannelNo(channelNo)) {
    throw new Error(
      `无效的通道号: ${channelNo}。通道号必须在 ${CHANNEL_RANGE.MIN}-${CHANNEL_RANGE.MAX} 范围内`
    );
  }

  // 构建URL模板
  const templateUrl = `${YS7_API_CONFIG.BASE_URL}?accessToken={{accessToken}}&deviceSerial=${deviceSerial}&channelNo=${channelNo}`;
  
  return templateUrl;
}

/**
 * 获取所有支持的闸站信息
 * @returns 闸站信息数组
 */
export function getAllGateStations() {
  return Object.entries(GATE_STATIONS).map(([deviceSerial, name]) => ({
    deviceSerial: deviceSerial as DeviceSerial,
    name,
    channels: Array.from(
      { length: CHANNEL_RANGE.MAX - CHANNEL_RANGE.MIN + 1 }, 
      (_, i) => i + CHANNEL_RANGE.MIN
    )
  }));
}

/**
 * 批量生成多个闸站的直播地址URL
 * @param configs 配置数组，包含设备序列号和通道号
 * @param accessToken 访问令牌
 * @returns 生成的URL数组
 */
export function generateMultipleLiveUrls(
  configs: Array<{ deviceSerial: string; channelNo: number }>,
  accessToken: string
): Array<{ deviceSerial: string; channelNo: number; url: string; stationName: string }> {
  return configs.map(config => {
    const url = generateLiveUrl(config.deviceSerial, config.channelNo, accessToken);
    const stationName = getGateStationName(config.deviceSerial) || '未知闸站';
    
    return {
      deviceSerial: config.deviceSerial,
      channelNo: config.channelNo,
      url,
      stationName
    };
  });
}

// 默认导出主要函数
export default generateLiveUrl;