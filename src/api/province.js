import request from '@/utils/request'

// 获取省份列表
export function getProvinceList() {
  return request({
    url: '/authApi/reservoir/sys/sysProvince/getProvinceList',
    method: 'get'
  })
}

// 根据省份代码获取城市列表
export function getCityList(provinceCode) {
  return request({
    url: '/authApi/reservoir/sys/sysProvince/getCityList',
    method: 'get',
    params: {
      provinceCode
    }
  })
}

// 根据城市代码获取区县列表
export function getAreaList(cityCode) {
  return request({
    url: '/authApi/reservoir/sys/sysProvince/getAreaList',
    method: 'get',
    params: {
      cityCode
    }
  })
}