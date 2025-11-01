<template>
  <el-dialog
    v-model="dialogVisible"
    title="查看设备"
    width="80%"
    :before-close="handleClose"
    class="view-device-dialog"
        :lock-scroll="false"
  >
    <div class="dialog-content" v-loading="loading">
      <!-- 左侧表单 -->
      <div class="form-section">
        <el-form
          :model="form"
          label-width="100px"
          class="device-form"
        >
          <el-form-item label="设备名称">
            <el-input v-model="form.deviceName" readonly />
          </el-form-item>
          
          <el-form-item label="设备编号">
            <el-input v-model="form.deviceCode" readonly />
          </el-form-item>
          
          <el-form-item label="设备分类">
            <el-input v-model="form.deviceCategory" readonly />
          </el-form-item>
          
          <el-form-item label="监测类型">
            <el-input v-model="form.mcsType" readonly />
          </el-form-item>
          
          <el-form-item label="位置">
            <el-input v-model="form.reservoirLabel" readonly />
          </el-form-item>
          
          <el-form-item label="位置坐标">
            <el-input v-model="form.lonLat" readonly />
          </el-form-item>
          
          <el-form-item label="安装时间">
            <el-input v-model="form.installTime" readonly />
          </el-form-item>
          
          <!-- <el-form-item label="设备状态">
            <el-input v-model="form.statusText" readonly />
          </el-form-item> -->
          
          <!-- <el-form-item label="激活状态">
            <el-input v-model="form.activeText" readonly />
          </el-form-item> -->
          
          <el-form-item label="设备图片">
            <div class="image-view-container">
              <div v-if="form.imageUrl" class="image-preview">
                <img :src="form.imageUrl" alt="设备图片" class="preview-image" />
              </div>
              <div v-else class="no-image">
                暂无图片
              </div>
            </div>
          </el-form-item>
          
          <el-form-item label="设备备注">
            <el-input
              v-model="form.remarks"
              type="textarea"
              :rows="4"
              readonly
            />
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 右侧地图 -->
      <div class="map-section">
        <div id="viewDeviceMap" class="cesium-container"></div>
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import * as Cesium from 'cesium'
import { getDeviceDetail } from '@/api/device'
import { getDamDirectoryListApi, getPresignedObjectUrl } from '@/api/reservoir'
import { getDictOptions } from '@/api/dict'

interface DeviceDetail {
  id: string
  deviceName: string
  deviceCode: string
  devicePosition: string
  lonLat: string
  status: string
  isActive: string
  installTime: string
  remarks: string
  reservoirManagementNo: string
  deviceCategory: string
  mcsType: string
  deviceAttachmentInfoVOS: Array<{
    id: string
    deviceId: string
    file: string
  }>
}

const props = defineProps<{
  visible: boolean
  deviceId: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const dialogVisible = ref(false)
const loading = ref(false)
const reservoirTreeData = ref<any[]>([])

let viewer: Cesium.Viewer | null = null

// 设备分类选项
const deviceCategoryOptions = ref<Array<{ value: string, label: string }>>([])

// 监测类型选项
const mcsTypeOptions = ref([
  { value: 'env', label: '环境监测' },
  { value: 'stress', label: '应力监测' },
  { value: 'displacement', label: '位移监测' },
  { value: 'pressure', label: '渗压监测' },
  { value: 'seepage', label: '渗流监测' },
  { value: 'safemvs', label: '安防监测' },
 { value: 'gate', label: '闸门管理' },
   { value: 'gateStation', label: '闸站管理' },
])

const form = reactive({
  deviceName: '',
  deviceCode: '',
  reservoirLabel: '',
  selectedNodeId: '',
  lonLat: '',
  installTime: '',
        // statusText: '',  
        // activeText: '',
  imageUrl: '',
  remarks: '',
  deviceCategory: '',
  mcsType: ''
})

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal && props.deviceId) {
    fetchReservoirData()
    fetchDeviceCategoryOptions()
    nextTick(() => {
      initCesiumMap()
      // 确保地图初始化完成后再获取设备详情
      setTimeout(() => {
        fetchDeviceDetail()
      }, 200)
    })
  }
})

// 监听dialogVisible变化
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
  if (!newVal && viewer) {
    viewer.destroy()
    viewer = null
  }
})

// 获取设备分类选项
const fetchDeviceCategoryOptions = async () => {
  try {
    const options = await getDictOptions('device_category')
    deviceCategoryOptions.value = options
  } catch (error) {
    console.error('获取设备分类选项失败:', error)
    ElMessage.error('获取设备分类选项失败')
  }
}

// 获取水库数据
const fetchReservoirData = async () => {
  try {
    const response = await getDamDirectoryListApi()
    const transformedData = (response as any).map((provinceData: any, provinceIndex: number) => ({
      id: `province_${provinceIndex}`,
      label: provinceData.province,
      disabled: true, // 省份节点不可选择
      children: provinceData.envMcsCityVOS.map((cityData: any, cityIndex: number) => ({
        id: `city_${provinceIndex}_${cityIndex}`,
        label: cityData.city,
        disabled: true, // 城市节点不可选择
        children: cityData.envMcsAreaVOS.map((areaData: any, areaIndex: number) => ({
          id: `area_${provinceIndex}_${cityIndex}_${areaIndex}`,
          label: areaData.area,
          disabled: true, // 区域节点不可选择
          children: areaData.envMcsTownVOS.map((townData: any, townIndex: number) => ({
            id: `town_${provinceIndex}_${cityIndex}_${areaIndex}_${townIndex}`,
            label: townData.town,
            disabled: true, // 镇节点不可选择
            children: townData.reservoirInfoVOS.map((reservoir: any) => ({
              id: reservoir.reservoirCode,
              label: reservoir.reservoirName,
              reservoirCode: reservoir.reservoirCode,
              reservoirName: reservoir.reservoirName,
              disabled: false, // 水库节点可选择
              children: reservoir.deviceGateStationInfoNodeVOS?.map((gateStation: any) => ({
                id: gateStation.gateStationCode,
                label: gateStation.gateStationName,
                gateStationCode: gateStation.gateStationCode,
                gateStationName: gateStation.gateStationName,
                reservoirManagementNo: gateStation.reservoirManagementNo,
                disabled: false // 闸站节点也可选择
              })) || []
            }))
          }))
        }))
      }))
    }))
    reservoirTreeData.value = transformedData
  } catch (error) {
    console.error('获取水库数据失败:', error)
  }
}

// 获取设备详情
const fetchDeviceDetail = async () => {
  try {
    loading.value = true
    const response = await getDeviceDetail({ id: props.deviceId })
    const data = (response as any)
    
    // 填充表单数据
    form.deviceName = data.deviceName || ''
    form.deviceCode = data.deviceCode || ''
    form.lonLat = data.lonLat || ''
    form.installTime = data.installTime || ''
    // form.statusText = data.status === 'T' ? '在线' : '离线'
    // form.activeText = data.isActive === 'T' ? '激活' : '未激活'
    form.remarks = data.remarks || ''
    
    // 处理设备分类显示
    const categoryOption = deviceCategoryOptions.value.find(item => item.value === data.deviceCategory)
    form.deviceCategory = categoryOption ? categoryOption.label : (data.deviceCategory || '')
    
    // 处理监测类型显示
    const typeOption = mcsTypeOptions.value.find(item => item.value === data.mcsType)
    form.mcsType = typeOption ? typeOption.label : (data.mcsType || '')
    
    // 处理水库位置显示
    if (data.gateStationCode) {
      // 如果有闸站代码，查找对应的闸站节点
      const findGateStationLabel = (nodes: any[]): string => {
        for (const province of nodes) {
          for (const city of province.children || []) {
            for (const area of city.children || []) {
              for (const town of area.children || []) {
                for (const reservoir of town.children || []) {
                  for (const gateStation of reservoir.children || []) {
                    if (gateStation.gateStationCode === data.gateStationCode) {
                      return gateStation.label
                    }
                  }
                }
              }
            }
          }
        }
        return ''
      }
      
      // 等待树数据加载完成后设置显示值
      setTimeout(() => {
        const gateStationLabel = findGateStationLabel(reservoirTreeData.value)
        form.reservoirLabel = gateStationLabel || data.devicePosition || ''
      }, 100)
    } else if (data.reservoirManagementNo) {
      // 如果没有闸站代码，查找对应的水库节点
      const findReservoirLabel = (nodes: any[]): string => {
        for (const province of nodes) {
          for (const city of province.children || []) {
            for (const area of city.children || []) {
              for (const town of area.children || []) {
                for (const reservoir of town.children || []) {
                  if (reservoir.reservoirCode === data.reservoirManagementNo) {
                    return reservoir.label
                  }
                }
              }
            }
          }
        }
        return ''
      }
      
      // 等待树数据加载完成后设置显示值
      setTimeout(() => {
        const reservoirLabel = findReservoirLabel(reservoirTreeData.value)
        form.reservoirLabel = reservoirLabel || data.devicePosition || ''
      }, 100)
    } else {
      form.reservoirLabel = data.devicePosition || ''
    }
    
    // 处理设备图片
    if (data.deviceAttachmentInfoVOS && data.deviceAttachmentInfoVOS.length > 0) {
      const attachment = data.deviceAttachmentInfoVOS[0]
      try {
        const imageUrl = attachment.file
        form.imageUrl = (imageUrl as any) || ''
      } catch (error) {
        console.error('获取图片预签名URL失败:', error)
        form.imageUrl = ''
      }
    } else {
      form.imageUrl = ''
    }
    
    // 在地图上显示位置
    if (data.lonLat && viewer) {
      const [longitude, latitude] = data.lonLat.split(',').map(Number)
      if (!isNaN(longitude) && !isNaN(latitude)) {
        const position = Cesium.Cartesian3.fromDegrees(longitude, latitude)
        
        // 清除之前的标记
        viewer.entities.removeAll()
        
        // 添加设备位置标记
        viewer.entities.add({
          position: position,
          billboard: {
            image: new URL('../../../assets/location-pin.svg', import.meta.url).href,
            scale: 1.0,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
          }
        })
        
        // 定位到设备位置
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 1000)
        })
      }
    }
    
  } catch (error) {
    console.error('获取设备详情失败:', error)
    ElMessage.error('获取设备详情失败')
  } finally {
    loading.value = false
  }
}

// 查找水库或闸站标签
const findReservoirLabel = (nodeId: string): string => {
  // 递归搜索多级树结构中的目标节点
  const searchNode = (nodes: any[]): string => {
    for (const node of nodes) {
      // 检查当前节点ID是否匹配
      if (node.id.toString() === nodeId) {
        return node.label
      }
      // 如果有子节点，递归搜索
      if (node.children && node.children.length > 0) {
        const found = searchNode(node.children)
        if (found) return found
      }
    }
    return ''
  }
  
  return searchNode(reservoirTreeData.value)
}

// 初始化Cesium地图
const initCesiumMap = () => {
  // 如果viewer已存在，先销毁
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
  
  setTimeout(() => {
    viewer = new Cesium.Viewer('viewDeviceMap', {
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      vrButton: false,
      geocoder: false
    })
    
    // 设置默认位置
    const defaultPosition = Cesium.Cartesian3.fromDegrees(118.833333, 27.25, 1000)
    viewer.camera.setView({
      destination: defaultPosition,
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0.0
      }
    })
  }, 100)
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.view-device-dialog .dialog-content {
  display: flex;
  height: 600px;
  gap: 20px;
}

.view-device-dialog .form-section {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.view-device-dialog .device-form .el-form-item {
  margin-bottom: 20px;
}

.image-view-container {
  width: 120px;
  height: 120px;
  border: 2px solid #dcdfe6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview {
  width: 100%;
  height: 100%;
}

.image-preview .preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.no-image {
  color: #8c939d;
  font-size: 14px;
}

.view-device-dialog .map-section {
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.cesium-viewer-bottom) {
  display: none;
}

#viewDeviceMap {
  width: 100%;
  height: 100%;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
}

:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: #f5f7fa;
}
</style>