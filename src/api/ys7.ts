import request from '@/utils/request';

/**
 * 萤石云API接口封装
 */

// 萤石云配置
const YS7_CONFIG = {
  appKey: '95d4b4ad2cc94ad9b9fba8499e3b0130',
  appSecret: '215679969e455979d5e373187333761c',
  deviceSerial: 'FT8680213',
  channelNo: 1
};

/**
 * 获取萤石云访问token
 */
export function getYs7TokenApi() {
  return request({
    url: `/ys7Api/api/lapp/token/get?appKey=${YS7_CONFIG.appKey}&appSecret=${YS7_CONFIG.appSecret}`,
    method: 'post',
  });
}

/**
 * 获取萤石云视频直播地址
 * @param accessToken 访问token
 * @param deviceSerial 设备序列号，默认使用配置中的设备
 * @param channelNo 通道号，默认为1
 */
export function getYs7LiveAddressApi(
  accessToken: string, 
  deviceSerial: string = YS7_CONFIG.deviceSerial,
  channelNo: number = YS7_CONFIG.channelNo
) {
  return request({
    url: `/ys7Api/api/lapp/v2/live/address/get?accessToken=${accessToken}&deviceSerial=${deviceSerial}&channelNo=${channelNo}`,
    method: 'post',
  });
}

/**
 * 获取设备信息（包括在线状态）
 * @param accessToken 访问token
 * @param deviceSerial 设备序列号
 */
export function getYs7DeviceInfoApi(
  accessToken: string,
  deviceSerial: string
) {
  return request({
    url: `/ys7Api/api/lapp/device/info?accessToken=${accessToken}&deviceSerial=${deviceSerial}`,
    method: 'post',
  });
}

/**
 * 获取设备列表（检查设备是否存在和权限）
 * @param accessToken 访问token
 * @param pageStart 分页开始位置，默认0
 * @param pageSize 分页大小，默认50
 */
export function getYs7DeviceListApi(
  accessToken: string,
  pageStart: number = 0,
  pageSize: number = 50
) {
  return request({
    url: `/ys7Api/api/lapp/device/list?accessToken=${accessToken}&pageStart=${pageStart}&pageSize=${pageSize}`,
    method: 'post',
  });
}

/**
 * 萤石云API响应数据类型定义
 */
export interface Ys7TokenResponse {
  msg: string;
  code: string;
  data: {
    accessToken: string;
    expireTime: number;
  };
}

export interface Ys7LiveAddressResponse {
  msg: string;
  code: string;
  data: {
    id: string;
    url: string;
    expireTime: string;
  };
}

export interface Ys7DeviceInfoResponse {
  msg: string;
  code: string;
  data: {
    deviceSerial: string;
    deviceName: string;
    model: string;
    status: number; // 0-离线，1-在线
    defence: number;
    isEncrypt: number;
    alarmSoundMode: number;
    offlineNotify: number;
    category: string;
    deviceType: string;
  };
}

export interface Ys7DeviceListResponse {
  msg: string;
  code: string;
  data: Array<{
    deviceSerial: string;
    deviceName: string;
    model: string;
    status: number; // 0-离线，1-在线
    defence: number;
    isEncrypt: number;
    alarmSoundMode: number;
    offlineNotify: number;
    category: string;
    deviceType: string;
  }>;
}