<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加设备"
    width="80%"
    :before-close="handleClose"
    :lock-scroll="false"
    class="add-device-dialog"
  >
    <div class="dialog-content">
      <!-- 左侧表单 -->
      <div class="form-section">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          class="device-form"
        >
          <el-form-item label="设备名称" prop="name" required>
            <el-input v-model="form.name" placeholder="输入内容" />
          </el-form-item>
          
          <el-form-item label="设备编号" prop="code" required>
            <el-input v-model="form.code" placeholder="输入内容" />
          </el-form-item>
          <el-form-item label="安装时间" prop="installTime" required>
            <el-date-picker
              v-model="form.installTime"
              type="datetime"
              placeholder="选择时间"
              style="width: 100%"
              :teleported="false"
            />
          </el-form-item>
          <el-form-item label="设备分类" prop="deviceCategory" required>
            <el-select 
              v-model="form.deviceCategory" 
              placeholder="请选择设备分类" 
              style="width: 100%"
              :teleported="false"
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
              :props="{ label: 'label', children: 'children' ,value: 'id'}"
              default-expand-all
              placeholder="请选择水库或闸站"
              style="width: 100%"
              check-strictly
              :render-after-expand="false"
              @change="handleReservoirChange"
              :teleported="false"
            />
          </el-form-item>
          
          <el-form-item label="位置坐标" prop="coordinates" required>
            <el-input v-model="form.coordinates" placeholder="单击右侧地图后自动生成" readonly />
          </el-form-item>
          
        
          
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
              v-model="form.remark"
              type="textarea"
              placeholder="输入内容"
              :rows="4"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 右侧地图 -->
      <div class="map-section">
        <div  id='addDeviceMap' class="cesium-container"></div>
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
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElDatePicker, ElButton, ElIcon, ElMessage, ElTreeSelect, ElSelect, ElOption } from 'element-plus'
import { Plus, Close } from '@element-plus/icons-vue'
import * as Cesium from 'cesium'
import { addDevice, uploadFileWithPermanentUrl, deleteFile } from '@/api/device'
import { getDamDirectoryListApi } from '@/api/reservoir'
import { getDictOptions } from '@/api/dict'
import dynamicWall from '@/utils/electronicFence'

interface DeviceForm {
  name: string
  code: string
  reservoirManagementNo: string
  gateStationCode: string
  selectedNodeId: string // 用于绑定树选择器的值
  coordinates: string
  installTime: string | Date | undefined
  imageUrl: string
  imageInfo: any // 存储上传文件的完整信息
  remark: string
  deviceCategory: string
  mcsType: string
}

interface ReservoirNode {
  id: number
  label: string
  children?: ReservoirNode[]
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': [data: DeviceForm]
}>()

const dialogVisible = ref(false)
const formRef = ref()
const fileInput = ref()
const cesiumContainer = ref()
const reservoirTreeData = ref<ReservoirNode[]>([])

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

let viewer: Cesium.Viewer | null = null

const form = reactive<DeviceForm>({
  name: '',
  code: '',
  reservoirManagementNo: '',
  gateStationCode: '',
  selectedNodeId: '',
  coordinates: '',
  installTime: undefined,
  imageUrl: '',
  imageInfo: null,
  remark: '',
  deviceCategory: '',
  mcsType: ''
})

const rules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  selectedNodeId: [{ required: true, message: '请选择水库或闸站', trigger: 'change' }],
  coordinates: [{ required: true, message: '请点击地图选择位置坐标', trigger: 'blur' }],
  installTime: [{ required: true, message: '请选择安装时间', trigger: 'change' }],
  deviceCategory: [{ required: true, message: '请选择设备分类', trigger: 'change' }],
  mcsType: [{ required: true, message: '请选择监测类型', trigger: 'change' }]
}

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal) {
    initCesiumMap()
    fetchReservoirData()
    fetchDeviceCategoryOptions()
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

// 初始化Cesium地图
const initCesiumMap = () => {
  // 如果viewer已存在，先销毁
  if (viewer) {
    viewer.destroy()
    viewer = null
  }

  // 设置Cesium的默认访问令牌（如果需要）
  // Cesium.Ion.defaultAccessToken = 'your-cesium-ion-token'
    setTimeout(() => {
  viewer = new Cesium.Viewer('addDeviceMap',{
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
  
  // 设置默认位置到指定坐标区域
  const defaultPosition = Cesium.Cartesian3.fromDegrees(118.6269880154706, 27.149794936215155, 5000)
  viewer.camera.setView({
    destination: defaultPosition,
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0.0
    }
  })
  
  // 添加动态墙效果
  dynamicWall(viewer)
  
  // 添加ScreenSpaceEventHandler
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    if (!viewer) return;
    
    const pickedObject = viewer.scene.pick(click.position);
    if (!pickedObject) {
      // 点击空白处时创建新Billboard
      const position = viewer.scene.camera.pickEllipsoid(click.position);
      if (position) {
        onMapClick(position);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}, 1000)
}

// 地图点击事件处理
const onMapClick = (pickedPosition: Cesium.Cartesian3) => {
  if (!viewer) return
  
  if (pickedPosition) {
    const cartographic = Cesium.Cartographic.fromCartesian(pickedPosition)
    const longitude = Cesium.Math.toDegrees(cartographic.longitude)
    const latitude = Cesium.Math.toDegrees(cartographic.latitude)
    
    // 更新表单中的坐标信息
    form.coordinates = `${longitude.toFixed(6)},${latitude.toFixed(6)}`
    
    // 清除之前的标记
    viewer.entities.removeAll()
    
    // 添加新的标记
    viewer.entities.add({
      position: pickedPosition,
      billboard: {
        image: new URL('../../../assets/location-pin.svg', import.meta.url).href, // 使用SVG图标
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
  
  try {
    // 创建FormData
    const formData = new FormData()
    formData.append('uploadfile', file)
    formData.append('bucket', 'reservoir')
    
    // 生成唯一的objectName
    // const timestamp = Date.now()
    // const fileExtension = file.name.split('.').pop()
    // const objectName = `device/${timestamp}.${fileExtension}`
    // formData.append('objectName', objectName)
    
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

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 确认添加
const handleConfirm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 格式化时间
    const formatTime = (time: string | Date | undefined) => {
      if (!time) return ''
      const date = new Date(time)
      return date.toISOString().replace('T', ' ').substring(0, 19)
    }
    
    // 按照API要求的格式构造数据
    const deviceData = {
      deviceName: form.name,
      deviceCode: form.code,
      reservoirManagementNo: form.reservoirManagementNo,
      gateStationCode: form.gateStationCode || null,
      lonLat: form.coordinates,
      installTime: formatTime(form.installTime),
      deviceCategory: form.deviceCategory,
      mcsType: form.mcsType,
      isActive: 'F', // 默认为F
      status: 'F', // 默认为离线状态
      remarks: form.remark,
      attachmentInfoDTOS: form.imageInfo ? [{ file: form.imageInfo.accessUrl }] : []
    }
    
    await addDevice(deviceData)
    emit('confirm', { ...form })
    handleClose()
    ElMessage.success('设备添加成功')
  } catch (error) {
    console.error('添加设备失败:', error)
    ElMessage.error('添加设备失败，请重试')
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    name: '',
    code: '',
    reservoirManagementNo: '',
    gateStationCode: '',
    selectedNodeId: '',
    coordinates: '',
    installTime: undefined,
    imageUrl: '',
    imageInfo: null,
    remark: '',
    deviceCategory: '',
    mcsType: ''
  })
  
  // 清除地图标记
  if (viewer) {
    viewer.entities.removeAll()
  }
}

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
    
    // 转换接口数据为六级树形结构（省-市-区-镇-水库-闸站）
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
    ElMessage.error('获取水库数据失败')
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
      const findParentReservoir = (nodes: any[], targetId: string): any => {
        for (const node of nodes) {
          if (node.children) {
            for (const child of node.children) {
              if (child.id.toString() === targetId) {
                return node
              }
              if (child.children) {
                const found = findParentReservoir(child.children, targetId)
                if (found) return found
              }
            }
          }
        }
        return null
      }
      
      // 递归查找父级水库节点
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

onUnmounted(() => {
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
})
</script>

<style scoped>
.add-device-dialog .dialog-content {
  display: flex;
  height: 600px;
  gap: 20px;
}

.add-device-dialog .form-section {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.add-device-dialog .device-form .el-form-item {
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

.add-device-dialog .map-section {
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
#addDeviceMap {
  width: 100%;
  height: 100%;
}
</style>