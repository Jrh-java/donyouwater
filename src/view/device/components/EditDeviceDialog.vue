<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑设备"
    width="80%"
    :before-close="handleClose"
    :lock-scroll="false"
    class="edit-device-dialog"
  >
    <div class="dialog-content" v-loading="loading">
      <!-- 左侧表单 -->
      <div class="form-section">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          class="device-form"
        >
          <el-form-item label="设备名称" prop="deviceName" required>
            <el-input v-model="form.deviceName" placeholder="输入内容" />
          </el-form-item>
          
          <el-form-item label="设备编号" prop="deviceCode" required>
            <el-input v-model="form.deviceCode" placeholder="输入内容" />
          </el-form-item>
          
          <el-form-item label="设备分类" prop="deviceCategory" required>
            <el-select 
              v-model="form.deviceCategory" 
              placeholder="请选择设备分类" 
              style="width: 100%"
              :teleported='false'
            >
              <el-option
                v-for="item in deviceCategoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="监测类型" prop="mcsType" required>
            <el-select 
              v-model="form.mcsType" 
              placeholder="请选择监测类型" 
              style="width: 100%"
              :teleported="false"
            >
              <el-option
                v-for="item in mcsTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="位置" prop="selectedNodeId" required>
            <el-tree-select
              v-model="form.selectedNodeId"
              :data="reservoirTreeData"
              :props="{ label: 'label', children: 'children', value: 'id' }"
              placeholder="请选择水库或闸站"
              style="width: 100%"
              check-strictly
              :render-after-expand="false"
              @change="handleReservoirChange"
              :teleported="false"
              default-expand-all
            />
          </el-form-item>
          
          <el-form-item label="位置坐标" prop="lonLat" required>
            <el-input v-model="form.lonLat" placeholder="单击右侧地图后自动生成" readonly />
          </el-form-item>
          
          <el-form-item label="安装时间" prop="installTime" required>
            <el-date-picker
              v-model="form.installTime"
              type="datetime"
              placeholder="选择时间"
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss"
              :teleported="false"
            />
          </el-form-item>
          
          <!-- <el-form-item label="设备状态" prop="status" required>
            <el-select v-model="form.status" placeholder="请选择设备状态" style="width: 100%">
              <el-option label="在线" value="T" />
              <el-option label="离线" value="F" />
            </el-select>
          </el-form-item> -->
          
          <!-- <el-form-item label="激活状态" prop="isActive" required>
            <el-select v-model="form.isActive" placeholder="请选择激活状态" style="width: 100%">
              <el-option label="激活" value="T" />
              <el-option label="未激活" value="F" />
            </el-select>
          </el-form-item> -->
          
          <el-form-item label="设备图片">
            <div class="image-upload-container">
              <!-- 图片预览 -->
              <div v-if="form.imageUrl" class="image-preview">
                <img :src="form.imageUrl" alt="设备图片" class="preview-image" />
                <el-icon class="delete-icon" @click="removeImage">
                  <Close />
                </el-icon>
              </div>
              <!-- 上传按钮 -->
              <div v-else class="upload-area" @click="triggerFileInput">
                <el-icon class="upload-icon">
                  <Plus />
                </el-icon>
                <div class="upload-text">上传图片</div>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png"
                style="display: none"
                @change="handleFileChange"
              />
            </div>
            <div class="upload-tip">支持JPG/PNG图片，且大小不超过2MB</div>
          </el-form-item>
          
          <el-form-item label="设备备注">
            <el-input
              v-model="form.remarks"
              type="textarea"
              placeholder="输入内容"
              :rows="4"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 右侧地图 -->
      <div class="map-section">
        <div id="editDeviceMap" class="cesium-container"></div>
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElDatePicker, ElButton, ElIcon, ElMessage, ElSelect, ElOption, ElTreeSelect } from 'element-plus'
import { Plus, Close } from '@element-plus/icons-vue'
import * as Cesium from 'cesium'
import { getDeviceDetail, updateDevice, uploadFileWithPermanentUrl, deleteFile } from '@/api/device'
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
  reservoirManagementId: string
  deviceAttachmentInfoVOS: Array<{
    id: string
    deviceId: string
    file: string
  }>
}

interface DeviceForm {
  id: string
  deviceName: string
  deviceCode: string
  reservoirManagementNo: string
  gateStationCode: string
  selectedNodeId: string // 用于绑定树选择器的值
  lonLat: string
  installTime: string | Date | undefined
  status: string
  isActive: string
  imageUrl: string
  imageInfo: any // 存储上传文件的完整信息
  remarks: string
  deviceCategory: string
  mcsType: string
}

const props = defineProps<{
  visible: boolean
  deviceId: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const dialogVisible = ref(false)
const formRef = ref()
const fileInput = ref()
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

const form = reactive<DeviceForm>({
  id: '',
  deviceName: '',
  deviceCode: '',
  reservoirManagementNo: '',
  gateStationCode: '',
  selectedNodeId: '',
  lonLat: '',
  installTime: undefined,
  status: 'F',
  isActive: 'T',
  imageUrl: '',
  imageInfo: null,
  remarks: '',
  deviceCategory: '',
  mcsType: ''
})

const rules = {
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  deviceCode: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  selectedNodeId: [{ required: true, message: '请选择水库或闸站', trigger: 'change' }],
  lonLat: [{ required: true, message: '请点击地图选择位置坐标', trigger: 'blur' }],
  installTime: [{ required: true, message: '请选择安装时间', trigger: 'change' }],
  status: [{ required: true, message: '请选择设备状态', trigger: 'change' }],
  isActive: [{ required: true, message: '请选择激活状态', trigger: 'change' }],
  deviceCategory: [{ required: true, message: '请选择设备分类', trigger: 'change' }],
  mcsType: [{ required: true, message: '请选择监测类型', trigger: 'change' }]
}

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
    form.id = data.id
    form.deviceName = data.deviceName || ''
    form.deviceCode = data.deviceCode || ''
    form.gateStationCode = data.gateStationCode || ''
    form.lonLat = data.lonLat || ''
    form.installTime = data.installTime || undefined
    form.status = data.status || 'F'
    form.isActive = data.isActive || 'F'
    form.remarks = data.remarks || ''
    form.deviceCategory = data.deviceCategory || ''
    form.mcsType = data.mcsType || ''
    
    // 设置reservoirManagementNo字段
    form.reservoirManagementNo = data.reservoirManagementNo || ''
    
    // 根据gateStationCode和reservoirManagementNo设置树选择器的值
    const setSelectedNode = () => {
      // 递归查找节点的函数
      const findNodeInTree = (nodes: any[], searchFn: (node: any) => boolean): any => {
        for (const node of nodes) {
          if (searchFn(node)) {
            return node
          }
          if (node.children && node.children.length > 0) {
            const found = findNodeInTree(node.children, searchFn)
            if (found) return found
          }
        }
        return null
      }
      
      if (data.gateStationCode) {
        // 如果有闸站代码，查找对应的闸站节点
        const gateStationNode = findNodeInTree(reservoirTreeData.value, (node) => 
          node.gateStationCode === data.gateStationCode
        )
        if (gateStationNode) {
          form.selectedNodeId = gateStationNode.id
        }
      } else if (data.reservoirManagementNo) {
        // 如果没有闸站代码，查找对应的水库节点
        const reservoirNode = findNodeInTree(reservoirTreeData.value, (node) => 
          node.reservoirCode === data.reservoirManagementNo
        )
        if (reservoirNode) {
          form.selectedNodeId = reservoirNode.id
        }
      }
    }
    
    // 等待树数据加载完成后设置选中值，增加延迟时间
    setTimeout(setSelectedNode, 500)
    
    // 处理设备图片
    if (data.deviceAttachmentInfoVOS && data.deviceAttachmentInfoVOS.length > 0) {
      const attachment = data.deviceAttachmentInfoVOS[0]
      try {
        const imageUrl = attachment.file
        
        form.imageUrl = (imageUrl as any) || ''
        // 为现有图片创建imageInfo，用于删除时使用
        form.imageInfo = {
          accessUrl: form.imageUrl,
          objectName: attachment.file,
          bucket: 'reservoir'
        }
      } catch (error) {
        console.error('获取图片预签名URL失败:', error)
        form.imageUrl = ''
        form.imageInfo = null
      }
    } else {
      form.imageUrl = ''
      form.imageInfo = null
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

// 处理水库选择变化
const handleReservoirChange = (value: string) => {
  console.log('选择的水库ID:', value)
  
  // 查找选中的节点
  const findSelectedNode = (nodes: any[], targetId: string): any => {
    for (const node of nodes) {
      if (node.id.toString() === targetId) {
        return node
      }
      if (node.children && node.children.length > 0) {
        const found = findSelectedNode(node.children, targetId)
        if (found) return found
      }
    }
    return null
  }
  
  const selectedNode = findSelectedNode(reservoirTreeData.value, value)
  
  if (selectedNode) {
    // 如果选择的是闸站节点（有gateStationCode属性）
    if (selectedNode.gateStationCode) {
      form.gateStationCode = selectedNode.gateStationCode
      // 查找父级水库节点的reservoirCode
      const findReservoirParent = (nodes: any[], targetId: string): any => {
        for (const province of nodes) {
          for (const city of province.children || []) {
            for (const area of city.children || []) {
              for (const town of area.children || []) {
                for (const reservoir of town.children || []) {
                  for (const gateStation of reservoir.children || []) {
                    if (gateStation.id.toString() === targetId) {
                      return reservoir
                    }
                  }
                }
              }
            }
          }
        }
        return null
      }
      
      const parentReservoir = findReservoirParent(reservoirTreeData.value, value)
      form.reservoirManagementNo = parentReservoir ? parentReservoir.reservoirCode : ''
    } else {
      // 如果选择的是水库节点
      form.gateStationCode = ''
      form.reservoirManagementNo = selectedNode.reservoirCode || value
    }
  }
  
  console.log('gateStationCode:', form.gateStationCode)
  console.log('reservoirManagementNo:', form.reservoirManagementNo)
}

// 初始化Cesium地图
const initCesiumMap = () => {
  // 如果viewer已存在，先销毁
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
  
  setTimeout(() => {
    viewer = new Cesium.Viewer('editDeviceMap', {
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
    
    // 添加地图点击事件
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      if (!viewer) return
      
      const pickedObject = viewer.scene.pick(click.position)
      if (!pickedObject) {
        const position = viewer.scene.camera.pickEllipsoid(click.position)
        if (position) {
          onMapClick(position)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }, 100)
}

// 地图点击事件处理
const onMapClick = (pickedPosition: Cesium.Cartesian3) => {
  if (!viewer) return
  
  if (pickedPosition) {
    const cartographic = Cesium.Cartographic.fromCartesian(pickedPosition)
    const longitude = Cesium.Math.toDegrees(cartographic.longitude)
    const latitude = Cesium.Math.toDegrees(cartographic.latitude)
    
    // 更新表单中的坐标信息
    form.lonLat = `${longitude.toFixed(6)},${latitude.toFixed(6)}`
    
    // 清除之前的标记
    viewer.entities.removeAll()
    
    // 添加新的标记
    viewer.entities.add({
      position: pickedPosition,
      billboard: {
        image: new URL('../../../assets/location-pin.svg', import.meta.url).href,
        scale: 1.0,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM
      }
    })
  }
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 检查文件类型
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    ElMessage.error('只支持JPG/PNG格式的图片')
    return
  }
  
  // 检查文件大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过2MB')
    return
  }
  
  // 如果有旧图片，先删除
  if (form.imageInfo) {
    try {
      await deleteFile({
        bucket: 'reservoir',
        objectName: form.imageInfo.objectName
      })
    } catch (error) {
      console.error('删除旧图片失败:', error)
    }
  }
  
  try {
    // 创建FormData
    const formData = new FormData()
    formData.append('uploadfile', file)
    formData.append('bucket', 'reservoir')
    
    // 生成唯一的objectName
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const objectName = `device/${timestamp}.${fileExtension}`
    formData.append('objectName', objectName)
    
    // 显示上传中状态
    const loadingMessage = ElMessage({
      message: '正在上传图片...',
      type: 'info',
      duration: 0
    })
    
    // 调用上传接口
    const response = await uploadFileWithPermanentUrl(formData)
    loadingMessage.close()
    
    // 保存上传结果
    form.imageUrl = (response as any).accessUrl
    form.imageInfo = response as any
    
    ElMessage.success('图片上传成功')
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败，请重试')
  }
  
  // 清空input值，以便重新选择同一文件
  target.value = ''
}

// 删除图片
const removeImage = async () => {
  if (form.imageInfo) {
    try {
      // 调用删除文件接口
      await deleteFile({
        bucket: 'reservoir',
        objectName: form.imageInfo.objectName
      })
      ElMessage.success('图片删除成功')
    } catch (error) {
      console.error('删除图片失败:', error)
      ElMessage.error('删除图片失败')
    }
  }
  
  // 清空图片信息
  form.imageUrl = ''
  form.imageInfo = null
}

// 格式化时间
const formatTime = (time: string | Date | undefined) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toISOString().replace('T', ' ').substring(0, 19)
}

// 确认更新
const handleConfirm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 按照API要求的格式构造数据
    const deviceData = {
      id: form.id,
      deviceName: form.deviceName,
      deviceCode: form.deviceCode,
      reservoirManagementNo: form.reservoirManagementNo,
      gateStationCode: form.gateStationCode || '',
      lonLat: form.lonLat,
      installTime: formatTime(form.installTime),
      deviceCategory: form.deviceCategory,
      mcsType: form.mcsType,
      isActive: form.isActive,
      status: form.status,
      remarks: form.remarks,
      deviceAttachmentInfoDTOS: form.imageInfo ? [{ file: form.imageInfo.accessUrl }] : []
    }
    
    await updateDevice(deviceData)
    emit('success')
    handleClose()
    ElMessage.success('设备更新成功')
  } catch (error) {
    console.error('更新设备失败:', error)
    ElMessage.error('更新设备失败，请重试')
  }
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    id: '',
    deviceName: '',
    deviceCode: '',
    reservoirManagementNo: '',
    gateStationCode: '',
    selectedNodeId: '',
    lonLat: '',
    installTime: undefined,
    status: 'F',
    isActive: 'F',
    imageUrl: '',
    imageInfo: null,
    remarks: '',
    deviceCategory: '',
    mcsType: ''
  })
  
  // 清除地图标记
  if (viewer) {
    viewer.entities.removeAll()
  }
}
</script>

<style scoped>
.edit-device-dialog .dialog-content {
  display: flex;
  height: 600px;
  gap: 20px;
}

.edit-device-dialog .form-section {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.edit-device-dialog .device-form .el-form-item {
  margin-bottom: 20px;
}

.image-upload-container {
  position: relative;
  width: 120px;
  height: 120px;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.image-upload-container:hover {
  border-color: #409eff;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #8c939d;
}

.upload-area .upload-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-area .upload-text {
  font-size: 14px;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-preview .preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.image-preview .delete-icon {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background-color: #f56c6c;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.image-preview .delete-icon:hover {
  background-color: #f78989;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.edit-device-dialog .map-section {
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

#editDeviceMap {
  width: 100%;
  height: 100%;
}
</style>