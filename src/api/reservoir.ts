import request from '@/utils/request';

// 渗压数据接口响应类型
export interface OsmoticPressureData {
  daily: string
  maxWaterPressure: number
}

// 获取渗压周最大值数据
export const getOsmoticPressureWeekMaxApi = async (gateStationCode: string): Promise<OsmoticPressureData[]> => {
  const formData = new FormData()
  formData.append('gateStationCode', gateStationCode)
  
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirEnvMcs/osmoticPressureWeekMax',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 监控设备数据接口
export interface MonitorDevice {
  id: string
  reservoirManagementNo: string
  gateStationCode: string
  deviceName: string
  deviceCode: string
  devicePosition: string
  lonLat: string
  status: string
  isActive: string
  deviceCategory: string
  mcsType: string
  installTime: string | null
  remarks: string | null
  crtTime: string
  crtUser: string | null
  crtName: string | null
  updTime: string | null
  updUser: string | null
  updName: string | null
  deviceAttachmentInfoVOS: any
}

// 根据闸站编码获取监控设备
export const getMonitorDevicesByGateStationCodeApi = async (gateStationCode: string): Promise<MonitorDevice[]> => {
  return request({
    url: '/authApi/reservoir/device/deviceMcsVideo/getByGateStationCode',
    method: 'post',
    data: {
      id: gateStationCode
    }
  })
}

// 发送设备控制命令
export const sendDeviceCommandApi = async (topic: string, payloadStr: string) => {
  const formData = new FormData()
  formData.append('topic', topic)
  formData.append('payloadStr', payloadStr)
  
  return request({
    url: '/authApi/reservoir/device/deviceMcsVideo/sendCommand',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 发送视频回放命令
export const sendBackCommandApi = async (topic: string, status: number, startTime: string = '', endTime: string = '') => {
  const formData = new FormData()
  formData.append('topic', topic)
  formData.append('status', status.toString())
  formData.append('startTime', startTime)
  formData.append('endTime', endTime)
  
  return request({
    url: '/authApi/reservoir/device/deviceMcsVideo/sendBackCommand',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取大坝目录列表
 */
export function getDamDirectoryListApi() {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirEnvMcs/getDamDirectotyList', // 使用authApi代理
    method: 'get',
  });
} 

/**
 * 环境监管主体概况
 */
export function getEnvMcvTitleCollect(data: {
  id: string;
}) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirEnvMcs/getEnvMcvTitleCollect',
    method: 'post',
    data
  });
}

/**
 * 添加水库
 */
export function addReservoir(data: any) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirManagementInfo/save',
    method: 'post',
    data
  });
}

/**
 * 删除水库
 */
export function deleteReservoir(data: any) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirManagementInfo/delete',
    method: 'post',
    data
  });
}

/**
 * 获取水库详情
 */
export function getReservoirDetail(data: any) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirManagementInfo/get',
    method: 'post',
    data
  });
}

/**
 * 更新水库
 */
export function updateReservoir(data: any) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirManagementInfo/update',
    method: 'post',
    data
  });
}

/**
 * 获取水库管理信息分页列表
 */
export function getReservoirPage(data: any) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirManagementInfo/page',
    method: 'post',
    data
  });
}

/**
 * 获取文件预签名URL
 */
export function getPresignedObjectUrl(data: any) {
  return request({
    url: '/authApi/file/getPresignedObjectUrl',
    method: 'get',
    params: data
  });
} 

/**
 * 获取水位监测分析数据
 */
export function getWaterLevelMcsAnalyse(data: any) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirEnvMcs/getWaterLevelMcsAnalyse',
    method: 'post',
    data
  });
}

/**
 * 获取温湿度监测分析数据
 */
export function getTemperatureHumidityMcsAnalyse(data: any) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirEnvMcs/getTemperatureHumidityMcsAnalyse',
    method: 'post',
    data
  });
}

/**
 * 获取降水量监测分析数据
 */
export function getPrecipitationMcsAnalyse(data: any) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirEnvMcs/getPrecipitationMcsAnalyse',
    method: 'post',
    data
  });
}

/**
 * 获取渗压监测分页数据
 */
export function getOsmoticPressurePage(data: any) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirEnvMcs/osmoticPressurePage',
    method: 'post',
    data
  });
}

/**
 * 应力监测数据导出
 */
export function exportStressData(formData: FormData) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirEnvMcs/stressMvcExport',
    method: 'post',
    data: formData,
    responseType: 'blob'
  });
}

/**
 * 获取顺河向/逆河向位移平均值列表
 */
export function getForwardDisplaceAvgList(data: any) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirEnvMcs/getForwardDisplaceAvgList',
    method: 'post',
    data
  });
}

/**
 * 获取位移监测分页数据
 */
export function getDisplaceList(data: any) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirEnvMcs/getDisplaceList',
    method: 'post',
    data
  });
}

/**
 * 位移监测数据导出
 */
export function exportDisplacementData(formData: FormData) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirEnvMcs/displacementMvcExport',
    method: 'post',
    data: formData,
    responseType: 'blob'
  });
}

/**
 * 根据闸站编码获取闸门列表
 */
export function getGateByStationCode(data: { id: string }) {
  return request({
    url: '/authApi/reservoir/device/deviceGateInfo/getGateByStationCode',
    method: 'post',
    data
  });
}

/**
 * 获取闸门详情
 */
export function getGateDetail(data: { id: string }) {
  return request({
    url: '/authApi/reservoir/device/deviceGateInfo/get',
    method: 'post',
    data
  });
}

/**
 * 闸门开关闸和停闸操作
 */
export function gateOnOrOff(deviceCode: string, payloadStr: string) {
  return request({
    url: `/authApi/reservoir/device/deviceGateInfo/gateOnOrOff?deviceCode=${deviceCode}&payloadStr=${encodeURIComponent(payloadStr)}`,
    method: 'get'
  });
}

/**
 * 根据闸门编码获取摄像设备列表
 */
export function getCameraDevicesByGateCode(data: { id: string }) {
  return request({
    url: '/authApi/reservoir/device/deviceMcsVideo/getByGateCode',
    method: 'post',
    data
  });
}

/**
 * 根据设备编码和类别获取设备管理信息
 */
export function getDeviceManagementInfo(gateStationCode: string, deviceCategory: number) {
  const formData = new FormData();
  formData.append('gateStationCode', gateStationCode);
  formData.append('deviceCategory', deviceCategory.toString());
  
  return request({
    url: '/authApi/reservoir/device/deviceManagementInfo/getByDeviceCodeAndCategory',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 获取闸门扩展信息
 */
export function getGateExtInfo(deviceCode: string) {
  return request({
    url: '/authApi/reservoir/device/deviceGateInfo/gateExtInfo',
    method: 'get',
    params: {
      deviceCode
    }
  });
}

/**
 * 获取闸门任务计划列表
 */
export function getGateTaskList() {
  return request({
    url: '/authApi/reservoir/device/deviceGateInfo/getGateTaskList',
    method: 'get'
  });
}

/**
 * 发送任务计划命令（新增/删除）
 */
export function taskSend(deviceCode: string, payloadStr: string) {
  return request({
    url: `/authApi/reservoir/device/deviceGateInfo/taskSend?deviceCode=${deviceCode}&payloadStr=${encodeURIComponent(payloadStr)}`,
    method: 'get'
  });
}

/**
 * 获取闸门状态比率
 */
export function getGateStatusRate() {
  return request({
    url: '/authApi/reservoir/device/deviceGateInfo/getGateStatusRate',
    method: 'get'
  });
}

/**
 * 根据水库编码获取设备管理信息（分页）
 */
export function getReservoirDeviceManagementInfo(data: {
  key: string;
  limit: number;
  mcsType: string;
  page: number;
}) {
  return request({
    url: '/authApi/reservoir/device/deviceManagementInfo/reservoirPage',
    method: 'post',
    data
  })
}

// 获取当前降水量数据
export function getCurrentPrecipitation(data: {
  id: string;
}) {
  return request({
    url: '/authApi/reservoir/sys/reservoirEnvPrecipitationMcs/getCurrent',
    method: 'post',
    data
  })
}

// 获取环境监测近七日平均值数据
export function getEnvMcvTitleCollectDaily(data: {
  id: string;
}) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirEnvMcs/getEnvMcvTitleCollectDaily',
    method: 'post',
    data
  })
}

// 获取降水量近七日平均值数据
export function getPrecipitationMcsAnalyseDailyAvg(data: {
  reservoirManagementNo: string;
}) {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirEnvMcs/getPrecipitationMcsAnalyseDailyAvg',
    method: 'post',
    data
  })
}

// 位移监测指标数据接口响应类型
export interface DisplaceTitleData {
  onlineCount: number
  warnCount: number
  maxDisplaceValue: number
}/**
 * 获取位移监测指标数据
 */
export function getDisplaceTitle(): Promise<DisplaceTitleData> {
  return request({
    url: '/authApi/reservoir/warehouseGate/reservoirEnvMcs/getDisplaceTitle',
    method: 'get',
  });
}

/**
 * 闸口开度控制
 */
export function setGateOpeningRate(deviceCode: string, devpoint: string, controlVal: string) {
  return request({
    url: `/authApi/reservoir/device/deviceGateInfo/openRate?deviceCode=${deviceCode}&devpoint=${devpoint}&controlVal=${controlVal}`,
    method: 'get'
  });
}