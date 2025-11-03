/**
 * 配置管理工具
 * 用于动态加载和管理应用配置
 */

interface AppConfig {
  videoStreamBaseUrl: string;
  rtmpServer: string;
  rtmpPort: number;
  description?: string;
}

// 配置缓存 
let configCache: AppConfig | null = null;

/**
 * 加载应用配置
 * @returns Promise<AppConfig> 配置对象
 */
export const loadConfig = async (): Promise<AppConfig> => {
  // 如果已有缓存，直接返回
  if (configCache) {
    return configCache;
  }

  try {
    const response = await fetch('/config.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const config: AppConfig = await response.json();
    
    // 验证必要的配置项
    if (!config.videoStreamBaseUrl) {
      throw new Error('配置文件中缺少 videoStreamBaseUrl');
    }
    
    // 缓存配置
    configCache = config;
    
    console.log('配置加载成功:', config);
    return config;
  } catch (error) {
    console.error('加载配置文件失败:', error);
    
    // 返回默认配置作为后备
    const defaultConfig: AppConfig = {
      videoStreamBaseUrl: 'http://192.168.1.160:8866',
      rtmpServer: '119.3.245.90',
      rtmpPort: 1935
    };
    
    console.warn('使用默认配置:', defaultConfig);
    configCache = defaultConfig;
    return defaultConfig;
  }
};

/**
 * 获取视频流基础URL
 * @returns Promise<string> 视频流基础URL
 */
export const getVideoStreamBaseUrl = async (): Promise<string> => {
  const config = await loadConfig();
  return config.videoStreamBaseUrl;
};

/**
 * 获取RTMP服务器地址
 * @returns Promise<string> RTMP服务器地址
 */
export const getRtmpServer = async (): Promise<string> => {
  const config = await loadConfig();
  return config.rtmpServer;
};

/**
 * 获取RTMP端口
 * @returns Promise<number> RTMP端口
 */
export const getRtmpPort = async (): Promise<number> => {
  const config = await loadConfig();
  return config.rtmpPort;
};

/**
 * 清除配置缓存（用于重新加载配置）
 */
export const clearConfigCache = (): void => {
  configCache = null;
};

/**
 * 构建FLV视频流URL
 * @param deviceCode 设备编码
 * @returns Promise<string> 完整的FLV视频流URL
 */
export const buildWebSocketUrl = async (deviceCode: string): Promise<string> => {
  const baseUrl = await getVideoStreamBaseUrl();
  const rtmpServer = await getRtmpServer();
  return `${baseUrl}/live?url=rtmp://${rtmpServer}/live/${deviceCode}`;
};

// 保持向后兼容性
export const buildFlvUrl = buildWebSocketUrl;