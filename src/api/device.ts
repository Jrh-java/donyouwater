import request from '@/utils/request';

/**
 * 获取设备管理信息分页列表
 */
export function getDeviceManagementPage(data: any) {
  return request({
    url: '/authApi/reservoir/device/deviceManagementInfo/page',
    method: 'post',
    data
  });
}

/**
 * 导出设备数据
 */
export function exportDeviceData(data: any) {
  return request({
    url: '/authApi/reservoir/device/deviceManagementInfo/deviceExport',
    method: 'post',
    data,
    responseType: 'blob' // 指定响应类型为二进制流
  });
}

/**
 * 新增设备
 */
export function addDevice(data: any) {
  return request({
    url: '/authApi/reservoir/device/deviceManagementInfo/save',
    method: 'post',
    data
  });
}

/**
 * 删除设备
 */
export function deleteDevice(data: any) {
  return request({
    url: '/authApi/reservoir/device/deviceManagementInfo/delete',
    method: 'post',
    data
  });
}

/**
 * 获取设备详情
 */
export function getDeviceDetail(data: any) {
  return request({
    url: '/authApi/reservoir/device/deviceManagementInfo/get',
    method: 'post',
    data
  });
}

/**
 * 更新设备
 */
export function updateDevice(data: any) {
  return request({
    url: '/authApi/reservoir/device/deviceManagementInfo/update',
    method: 'post',
    data
  });
}

/**
 * 上传文件并获取永久URL
 */
export function uploadFileWithPermanentUrl(formData: FormData) {
  return request({
    url: '/authApi/file/uploadfileWithPermanentUrl',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 删除文件
 */
export function deleteFile(data: any) {
  return request({
    url: '/authApi/file/deleteFile',
    method: 'get',
    params: data
  });
} 