<template>
  <div class="viewer-container">
    <div id="cesiumContainer" class="h-full"></div>
    <div class="map-switch-buttons" @mouseenter="isMapButtonsHovered = true" @mouseleave="isMapButtonsHovered = false">
      <div class="map-button-group" :class="{ expanded: isMapButtonsHovered }">
        <div class="map-button" :class="{
          active: currentMapType === 'cesium',
          'top-layer': currentMapType === 'cesium'
        }" @click="switchMap('cesium')">
          <img src="@/assets/viewer/shange.png" alt="科技感地图" />
          <span>卫星图</span>
        </div>
        <div class="map-button" :class="{
          active: currentMapType === 'tech',
          'top-layer': currentMapType === 'tech'
        }" @click="switchMap('tech')">
          <img src="@/assets/viewer/blueMap.png" alt="Cesium底图" />
          <span>深色图</span>
        </div>
        <div class="map-button" :class="{
          active: currentMapType === 'tianditu',
          'top-layer': currentMapType === 'tianditu'
        }" @click="switchMap('tianditu')">
          <img src="@/assets/viewer/tianditu.png" alt="天地图" />
          <span>矢量图</span>
        </div>
      </div>
    </div>
    <VideoMonitorPanel :show="showVideoPanel" :panel-title="selectedBillboardData?.title"
      :device-data="selectedBillboardData?.deviceData" :device-code="selectedBillboardData?.deviceData?.deviceCode"
      @close="closeVideoPanel" />
    <DisplacementMonitorPanel :show="showDisplacementPanel" :panel-title="selectedBillboardData?.title"
      :device-data="selectedBillboardData?.deviceData" @close="closeDisplacementPanel" />
    <GateControlPanel :show="showGateControlPanel" :panel-title="selectedGateData?.title"
      :device-code="selectedGateData?.deviceCode" :gate-id="selectedGateData?.gateId" @close="closeGateControlPanel" @animate-gate="handleGateAnimation" />
    <GateControlModal :show="showGateControlModal" :modal-title="selectedStationData?.title"
      :gate-station-code="selectedStationData?.gateStationCode" @close="closeGateControlModal" />
    <DamDetailModal :show="showDamDetailModal" :dam-id="selectedDamData?.id" @close="closeDamDetailModal" />
    <EnvironmentMonitorPanel :show="showEnvironmentPanel" :device-data="selectedBillboardData?.deviceData" @close="closeEnvironmentPanel" />
    <PressureMonitorPanel :show="showPressurePanel" :device-data="selectedBillboardData?.deviceData" @close="closePressurePanel" />
  </div>
</template>

<script setup>
import { onMounted, ref, watch, onActivated, computed } from 'vue';
// import { useRouter } from 'vue-router'; // 如果需要路由功能，取消注释
import * as Cesium from 'cesium';
import { useStore } from '../../store/pinia';
import { storeToRefs } from 'pinia';
import VideoMonitorPanel from './viewerComponent/VideoMonitorPanel.vue'; // 引入Panel组件
import DisplacementMonitorPanel from './viewerComponent/DisplacementMonitorPanel.vue'; // 引入位移监测Panel组件
import GateControlPanel from './viewerComponent/GateControlPanel.vue'; // 引入闸门控制Panel组件
import GateControlModal from './viewerComponent/GateControlModal.vue'; // 引入闸门控制Modal组件
import DamDetailModal from '@/view/viewer/monitor/leftComponent/DamDetailModal.vue'; // 引入水坝详情弹窗
import EnvironmentMonitorPanel from './viewerComponent/EnvironmentMonitorPanel.vue'; // 引入环境监测Panel组件
import PressureMonitorPanel from './viewerComponent/PressureMonitorPanel.vue'; // 引入压力监测Panel组件
import PolylineTrailMaterialProperty from '@/cesium/PolylineTrailMaterial.js'; // 引入自定义材质
import { getReservoirPage, getReservoirDeviceManagementInfo } from '@/api/reservoir'; // 导入水库API
import { getDeviceManagementPage } from '@/api/device'; // 导入设备API
import dynamicWall from '@/utils/electronicFence';
import blueBG from '@/assets/viewer/billboard/height-bg-blue.png'
import { loadGLBModels, animateZhamenHeight, handleZhamenClick, handleStationClick, getZhamenAnimationState } from '@/utils/cesium/glbModelLoader';

// 删除3D Tiles加载器导入
const store = useStore();
// const router = useRouter(); // 如果需要路由功能，取消注释
let viewer;
// let cesiumCanvas; // 如果未使用，可以移除

// 计算属性：获取当前选中的节点
const selectedDamNode = computed(() => store.selectedDamNode);

const showVideoPanel = ref(false);
const showDisplacementPanel = ref(false); // 控制位移监测面板的显示
const showGateControlPanel = ref(false); // 控制闸门控制面板的显示
const showGateControlModal = ref(false); // 控制闸站控制弹窗的显示
const showDamDetailModal = ref(false); // 控制水坝详情弹窗的显示
const showEnvironmentPanel = ref(false); // 控制环境监测面板的显示
const showPressurePanel = ref(false); // 控制压力监测面板的显示
const selectedBillboardData = ref(null); // 用于视频和位移监测
const selectedDamData = ref(null); // 用于水坝详情
const selectedGateData = ref(null); // 用于闸门控制
const selectedStationData = ref(null); // 用于闸站控制

// 地图按钮堆叠状态
const isMapButtonsHovered = ref(false);

// 经纬度转换：118°34′, 26°56′
const targetLongitude = 118 + 34 / 60;
const targetLatitude = 26 + 56 / 60;
const targetHeight = 0; // Billboards are typically placed on the surface or at a specific height if needed.

// 设备类型映射
const deviceCategoryMap = {
  'env': '环境监测',
  'stress': '应力监测',
  'displacement': '位移监测',
  'pressure': '渗压监测',
  'seepage': '渗流监测',
  'flow': '流量监测',
  'water': '水位监测',
  'temp': '温度监测'
};

// 监测设备数据（从API获取）
const billboardData = ref([]);

// 修改为响应式数据，从API获取
const damBillboardData = ref([]);



// 添加地图类型状态
const currentMapType = ref('cesium');

// 天地图密钥
const TIANDITU_KEY = "cec5eeadc16a3c964451ff083266df0c";

// 切换地图函数
const switchMap = (mapType) => {
  if (!viewer || currentMapType.value === mapType) return;

  // 移除当前的影像图层
  viewer.imageryLayers.removeAll();

  // 根据类型添加新的影像图层
  switch (mapType) {
    case 'cesium':
      // 使用天地图卫星影像底图
      viewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapTileServiceImageryProvider({
          url: "http://t0.tianditu.gov.cn/img_w/wmts?tk=" + TIANDITU_KEY,
          layer: "img",
          style: "default",
          tileMatrixSetID: "w",
          format: "tiles",
          maximumLevel: 18
        })
      );

      // 添加天地图卫星影像注记
      viewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapTileServiceImageryProvider({
          url: "http://t0.tianditu.gov.cn/cia_w/wmts?tk=" + TIANDITU_KEY,
          layer: "cia",
          style: "default",
          tileMatrixSetID: "w",
          format: "tiles",
          maximumLevel: 18
        })
      );
      break;
    case 'tianditu':
      // 添加天地图底图
      viewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapTileServiceImageryProvider({
          url: "http://t0.tianditu.gov.cn/vec_w/wmts?tk=" + TIANDITU_KEY,
          layer: "vec",
          style: "default",
          tileMatrixSetID: "w",
          format: "tiles",
          maximumLevel: 18
        })
      );

      // 添加天地图边界注记
      viewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapTileServiceImageryProvider({
          url: "http://t{s}.tianditu.gov.cn/ibo_w/wmts?tk=" + TIANDITU_KEY,
          layer: "ibo",
          style: "default",
          tileMatrixSetID: "w",
          format: "tiles",
          maximumLevel: 18,
          subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
        })
      );

      // 添加天地图标注
      viewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapTileServiceImageryProvider({
          url: "http://t0.tianditu.gov.cn/cva_w/wmts?tk=" + TIANDITU_KEY,
          layer: "cva",
          style: "default",
          tileMatrixSetID: "w",
          format: "tiles",
          maximumLevel: 18
        })
      );
      break;
    case 'tech':
      viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          subdomains: ["a", "b", "c", "d"]
        })
      );
      break;
  }

  // 如果是天地图，设置图像渲染和抗锯齿
  if (mapType === 'tianditu') {
    if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
      viewer.resolutionScale = window.devicePixelRatio;
    }
    viewer.scene.postProcessStages.fxaa.enabled = true;
  }

  currentMapType.value = mapType;
};

// 获取设备数据
const getDeviceData = async (mcsType = '') => {
  try {
    const params = {
      page: 1,
      limit: 100
    };

    // 如果有设备类型过滤条件，添加到参数中
    if (mcsType) {
      params.mcsType = mcsType;
    }

    let response;
    
    // 根据节点类型调用不同的接口
    if (selectedDamNode.value?.nodeType === 'reservoir' && selectedDamNode.value?.reservoirCode) {
      // 水库节点：调用水库设备接口
      params.key = selectedDamNode.value.reservoirCode;
      response = await getReservoirDeviceManagementInfo(params);
      console.log('调用水库设备接口，水库编码:', selectedDamNode.value.reservoirCode);
    } else if (selectedDamNode.value?.nodeType === 'gateStation' && selectedDamNode.value?.gateStationCode) {
      // 闸站节点：调用闸站设备接口
      params.key = selectedDamNode.value.gateStationCode;
      response = await getDeviceManagementPage(params);
      console.log('调用闸站设备接口，闸站编码:', selectedDamNode.value.gateStationCode);
    } else {
      console.warn('未选择有效的节点或节点类型不正确');
      return;
    }

    if (response && response.list) {
      // 将API数据转换为billboardData格式
      billboardData.value = response.list
        .filter(item => item.lonLat) // 只处理有坐标的设备
        .map(item => {
          // 从lonLat字符串中拆分经纬度
          const coords = item.lonLat.split(',');
          const longitude = parseFloat(coords[0].trim());
          const latitude = parseFloat(coords[1].trim());

          // 获取设备类型对应的中文名称
          const categoryName = deviceCategoryMap[item.deviceCategory] || '未知设备';

          return {
            id: item.id,
            longitude: longitude,
            latitude: latitude,
            image: blueBG,
            // title: `${categoryName}${item.deviceName}`,
            title: item.deviceName,
            type: 'alarm', // 统一改为告警类型
            mcsType: item.mcsType,
            deviceData: {
              name: item.deviceName,
              deviceCode: item.deviceCode,
              gateStationCode: item.gateStationCode||"FJ.JODY.FH01.Z01.STATION", // 添加gateStationCode字段,eggsy:用户要求的魔改功能,暂时实现方案
              monitorItem: categoryName,
              status: item.isActive === 'T' ? '在线' : '离线',
              basicInfo: {
                area: item.reservoirName || '未知区域',
                manufacturer: '设备厂商',
                model: item.deviceCode,
                personInCharge: '设备负责人',
                contact: '联系电话',
                longitude: longitude.toFixed(6),
                latitude: latitude.toFixed(6),
                altitude: '高程信息',
                remarks: item.remarks || '设备备注信息',
              }
            }
          };
        });

      console.log('设备数据加载完成:', billboardData.value.length, '个设备');
    }
  } catch (error) {
    console.error('获取设备数据失败:', error);
  }
};

// 获取水库数据
const getReservoirData = async () => {
  try {
    const response = await getReservoirPage({
      page: 1,
      limit: 100
    });

    if (response && response.list) {
      // 将API数据转换为damBillboardData格式
      damBillboardData.value = response.list.map(item => {
        // 从lonLat字符串中拆分经纬度
        let longitude = 0;
        let latitude = 0;
        if (item.lonLat) {
          const coords = item.lonLat.split(',');
          if (coords.length === 2) {
            longitude = parseFloat(coords[0].trim());
            latitude = parseFloat(coords[1].trim());
          }
        }

        return {
          id: item.id,
          longitude: longitude,
          latitude: latitude,
          image: blueBG,
          title: item.reservoirName,
          type: 'dam',
          damName: item.reservoirName,
          location: item.address
        };
      });

      console.log('水库数据加载完成:', damBillboardData.value.length, '个水库');
    }
  } catch (error) {
    console.error('获取水库数据失败:', error);
  }
};

// 初始化所有数据
const initializeData = async () => {
  console.log('开始初始化数据...');
  // 获取当前的设备类型过滤条件
  const currentFilter = store.deviceTypeFilter || '';
  await Promise.all([
    getDeviceData(currentFilter),
    getReservoirData()
  ]);

  // 数据加载完成后，根据当前面板状态更新实体
  const { activePanel } = storeToRefs(store);
  console.log('数据加载完成，当前面板状态:', activePanel.value);

  // 强制重置为态势总览模式
  if (activePanel.value !== 'mainViewer') {
    console.log('重置面板状态为态势总览');
    store.setActivePanel('mainViewer');
  }

  updateEntities('mainViewer');
};
// GLB模型动画状态现在由 glbModelLoader 工具管理

// GLB模型配置和实体创建现在由 glbModelLoader 工具管理

// 闸门动画和点击处理现在由 glbModelLoader 工具管理

// 加载GLB模型现在由 glbModelLoader 工具管理
const loadGLBModelsInViewer = async () => {
  if (!viewer) {
    console.error('Viewer未初始化，无法加载GLB模型');
    return;
  }
  
  try {
    console.log('开始加载GLB模型...');
    await loadGLBModels(viewer);
    console.log('GLB模型加载完成');
  } catch (error) {
    console.error('加载GLB模型失败:', error);
  }
};
const updateEntities = (panelType) => {
  if (!viewer) return;

  // 获取当前需要显示的实体ID列表
  let targetEntityIds = [];

  if (panelType === 'monitor') {
    // 监测模式：显示告警类型的billboard
    targetEntityIds = billboardData.value
      .filter(data => data.type === 'alarm')
      .map(data => data.id);
  } else if (panelType === 'mainViewer') {
    // 主视图模式：显示水坝闸站
    targetEntityIds = damBillboardData.value
      .filter(data => data.type === 'dam')
      .map(data => data.id);
  }

  console.log(`更新实体为 ${panelType} 模式，目标实体数量:`, targetEntityIds.length);

  // 移除不需要的实体（但保留河流线条）
  const currentEntityIds = viewer.entities.values.map(entity => entity.id);
  currentEntityIds.forEach(entityId => {
    if (!targetEntityIds.includes(entityId) && 
        entityId !== 'riverRangeLine' && 
        !entityId.includes('glbModel')) {
      viewer.entities.removeById(entityId);
    }
  });

  // 确保河流线条始终存在
  if (!viewer.entities.getById('riverRangeLine')) {
    drawRiverRangeLine();
  }
  dynamicWall(viewer)

  // 只有在有数据时才添加实体和计算包围盒
  const hasValidData = targetEntityIds.length > 0;
  if (!hasValidData) {
    console.log('没有有效数据，仅执行了实体移除操作', panelType);
    return;
  }

  // 添加需要的实体（如果不存在）
  if (panelType === 'monitor') {
    // 加载监测告警点
    billboardData.value.forEach(data => {
      if (data.type === 'alarm' && !viewer.entities.getById(data.id) && data.longitude && data.latitude) {
        viewer.entities.add({
          id: data.id,
          position: Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, targetHeight),
          label: {
            text: data.title,
            font: '14px Arial',
            fillColor: Cesium.Color.WHITE,
            pixelOffset: new Cesium.Cartesian2(0, -25),
          },
          billboard: {
            image: data.image,
            scale: 1.0,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          },
          customData: data
        });
      }
    });
  } else if (panelType === 'mainViewer') {
    // 加载水坝闸站
    damBillboardData.value.forEach(data => {
      if (data.type === 'dam' && !viewer.entities.getById(data.id)) {
        viewer.entities.add({
          id: data.id,
          position: Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, targetHeight),
          label: {
            text: data.title,
            font: '14px Arial',
            fillColor: Cesium.Color.WHITE,
            pixelOffset: new Cesium.Cartesian2(0, -20),
          },
          billboard: {
            image: data.image,
            scale: 0.8,
            width: 180,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          },
          customData: data
        });
      }
    });
  }

  // 计算所有实体的包围盒并飞行到该位置
  // 等待一小段时间确保实体已经添加到场景中
  setTimeout(() => {
    const relevantEntities = viewer.entities.values.filter(entity =>
      entity.id !== 'riverRangeLine' && targetEntityIds.includes(entity.id)
    );

    if (relevantEntities.length > 0) {
      // 初始化包围盒的最小和最大坐标
      let west = Number.POSITIVE_INFINITY;
      let south = Number.POSITIVE_INFINITY;
      let east = Number.NEGATIVE_INFINITY;
      let north = Number.NEGATIVE_INFINITY;

      // 遍历相关实体计算包围盒
      relevantEntities.forEach(entity => {
        if (entity.position) {
          const cartographic = Cesium.Cartographic.fromCartesian(entity.position.getValue());
          const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = Cesium.Math.toDegrees(cartographic.latitude);

          west = Math.min(west, longitude);
          south = Math.min(south, latitude);
          east = Math.max(east, longitude);
          north = Math.max(north, latitude);
        }
      });

      // 确保包围盒有效
      if (west !== Number.POSITIVE_INFINITY && south !== Number.POSITIVE_INFINITY &&
        east !== Number.NEGATIVE_INFINITY && north !== Number.NEGATIVE_INFINITY) {

        // 创建包围盒矩形
        const rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);

        // 添加一些边距
        const padding = 0.01; // 约1公里的边距
        const paddedRectangle = Cesium.Rectangle.fromDegrees(
          west - padding,
          south - padding,
          east + padding,
          north + padding
        );

        // 飞行到包围盒位置
        viewer.camera.flyTo({
          destination: paddedRectangle,
          duration: 3,
          complete: function () {
            console.log('飞行到实体包围盒完成，显示了', relevantEntities.length, '个实体');
          }
        });
      }
    } else {
      console.log('没有找到相关实体进行飞行');
    }
  }, 100); // 延迟100ms确保实体已添加
};

onMounted(() => {
  console.log('Viewer onMounted 执行');
  viewer = new Cesium.Viewer('cesiumContainer', {
    animation: false,
    timeline: false,
    fullscreenButton: false,
    infoBox: false,
    homeButton: false,
    geocoder: false,
    sceneModePicker: false,
    selectionIndicator: false,
    baseLayerPicker: false,
    navigationHelpButton: false,
    // 禁用默认底图，我们手动添加天地图
    imageryProvider: false
  });

  // 立即添加天地图卫星影像底图
  viewer.imageryLayers.addImageryProvider(
    new Cesium.WebMapTileServiceImageryProvider({
      url: "http://t0.tianditu.gov.cn/img_w/wmts?tk=" + TIANDITU_KEY,
      layer: "img",
      style: "default",
      tileMatrixSetID: "w",
      format: "tiles",
      maximumLevel: 18
    })
  );

  // 添加天地图卫星影像注记
  viewer.imageryLayers.addImageryProvider(
    new Cesium.WebMapTileServiceImageryProvider({
      url: "http://t0.tianditu.gov.cn/cia_w/wmts?tk=" + TIANDITU_KEY,
      layer: "cia",
      style: "default",
      tileMatrixSetID: "w",
      format: "tiles",
      maximumLevel: 18
    })
  );

  // cesiumCanvas = viewer.scene.canvas; // 如果未使用，可以移除

  storeToRefs(store).viewer.value = viewer;
  window["viewer"] = viewer;
  viewer._cesiumWidget._creditContainer.style.display = "none";

  const { activePanel } = storeToRefs(store);

  // 初始化数据
  initializeData();
  loadGLBModelsInViewer();
  // 设置鼠标点击事件处理器
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (movement) {
    //根据movement.position获取经纬度坐标
    // 监听左键点击事件

    // 从点击位置获取世界坐标
    var windowPosition = movement.position;
    var ray = viewer.camera.getPickRay(windowPosition);
    var cartesian = viewer.scene.globe.pick(ray, viewer.scene);

    if (cartesian) {
      // 将世界坐标转换为经纬度
      var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      var longitude = Cesium.Math.toDegrees(cartographic.longitude);
      var latitude = Cesium.Math.toDegrees(cartographic.latitude);

      // 输出经纬度坐标
      console.log(longitude + ', ' + latitude);
    }

    const pickedObject = viewer.scene.pick(movement.position);
    //输出鼠标点击位置的经纬度坐标

    // 检查是否点击了闸门模型
    if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && pickedObject.id.id && pickedObject.id.id.includes('glbModel-zhamen')) {
      handleZhamenClick(pickedObject.id.id, (gateData) => {
        selectedGateData.value = gateData;
        showGateControlPanel.value = true;
      });
      return;
    }

    // 检查是否点击了闸站模型（FJ.JODY.FH01前缀）
    if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && pickedObject.id.id && pickedObject.id.id.includes('FJ.JODY.FH01') && pickedObject.id.id.includes('STATION')) {
      // 获取模型名称
      const modelName = pickedObject.id.customData?.originalConfig?.name || null;
      handleStationClick(pickedObject.id.id, (stationData) => {
        selectedStationData.value = stationData;
        showGateControlModal.value = true;
      }, modelName);
      return;
    }

    if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.id.customData)) {
      const data = pickedObject.id.customData;
      selectedBillboardData.value = data;
      selectedDamData.value = null;
      showVideoPanel.value = false;
      showDisplacementPanel.value = false;
      showDamDetailModal.value = false;

      if (data.type === 'alarm') {
        if (data.mcsType === 'safemvs') {
          // 处理安全监控视频设备
          // console.log('点击安全监控视频设备:', entity);
          selectedBillboardData.value = {
            title: data.name || '视频监控',
            deviceData: {
              name: data.name || '未知设备',
              deviceCode: data.deviceData.deviceCode || '',
              monitorItem: '视频监控',
              status: '在线'
            }
          };
          showVideoPanel.value = true;
        } else if (data.mcsType === 'displacement') {
          // 处理位移监测设备
          selectedBillboardData.value = {
            title: data.title || '位移监测',
            deviceData: data.deviceData
          };
          showDisplacementPanel.value = true;
        }else if(data.mcsType === 'env'){
          // 处理环境监测设备
          selectedBillboardData.value = {
            title: data.title || '环境监测',
            deviceData: data.deviceData
          };
          showEnvironmentPanel.value = true;
        }else if(data.mcsType === 'pressure'){
          // 处理压力监测设备
          selectedBillboardData.value = {
            title: data.title || '压力监测',
            deviceData: data.deviceData
          };
          showPressurePanel.value = true;
        }
      } else if (data.type === 'dam') {
        selectedDamData.value = data;
        showDamDetailModal.value = true;
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // 添加鼠标悬浮事件处理器
  let hoverBillboard = null;
  let hoverLabel = null;
  
  // 为所有FJ.JODY.FH01前缀的GLB模型添加常显标签
  const addPermanentLabels = () => {
    // 遍历所有实体，找到FJ.JODY.FH01前缀的GLB模型
    viewer.entities.values.forEach(entity => {
      if (entity.id && 
          entity.id.includes('FJ.JODY.FH01') && 
          entity.id.includes('STATION') &&
          entity.customData?.originalConfig?.name) {
        
        const modelName = entity.customData.originalConfig.name;
        const position = entity.position.getValue();
        
        if (position) {
          // 为每个模型添加常显标签
          viewer.entities.add({
            id: `label-${entity.id}`,
            position: position,
            label: {
              text: modelName,
              font: '14px Arial',
              fillColor: Cesium.Color.WHITE,
              pixelOffset: new Cesium.Cartesian2(0, -25),
              showBackground: true,
              backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
              backgroundPadding: new Cesium.Cartesian2(8, 4),
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
          });
        }
      }
    });
  };
  
  // 延迟执行以确保所有模型都已加载
  setTimeout(() => {
    addPermanentLabels();
  }, 2000);

  // 监听header面板切换事件
  watch(activePanel, (newPanel) => {
    console.log('面板切换到:', newPanel);
    // 只有在数据加载完成后才更新实体
    if (newPanel === 'monitor' && billboardData.value.length > 0) {
      updateEntities(newPanel);
    } else if (newPanel === 'mainViewer' && damBillboardData.value.length > 0) {
      updateEntities(newPanel);
    }
  }); // 移除 immediate: true，避免初始化时的空数据调用

  // 监听设备类型过滤条件变化
  const { deviceTypeFilter, selectedDamNode } = storeToRefs(store);
  watch(deviceTypeFilter, async (newFilter) => {
    console.log('设备类型过滤条件变化:', newFilter);
    // 重新加载设备数据
    await getDeviceData(newFilter);
    // 如果当前是监测模式，更新实体显示
    if (activePanel.value === 'monitor') {
      updateEntities('monitor');
    }
  });

  // 监听节点选择变化（闸站或水库）
   watch(selectedDamNode, async (newNode) => {
     console.log('节点选择变化:', newNode);
     // 当节点发生变化时，重新加载设备数据
     if (newNode && (newNode.gateStationCode || newNode.reservoirCode)) {
       await getDeviceData(deviceTypeFilter.value || '');
       // 如果当前是监测模式，更新实体显示
       if (activePanel.value === 'monitor') {
         updateEntities('monitor');
       }
     }
   });
});

// 添加onActivated生命周期，解决路由重复进入的问题
onActivated(() => {
  console.log('Viewer onActivated 执行 - 路由重新激活');
  // 重新初始化数据并重置为态势总览
  setTimeout(() => {
    initializeData();
  }, 100);
});

const drawRiverRangeLine = () => {
  // 检查河流线条是否已存在，避免重复添加
  if (viewer.entities.getById('riverRangeLine')) {
    return;
  }

  // viewer.entities.add({
  //   id: 'riverRangeLine', // 添加ID以便管理
  //   polyline: {
  //     positions: Cesium.Cartesian3.fromDegreesArray(riverRangeData),
  //     width: 3,
  //     material: new PolylineTrailMaterialProperty({
  //       color: Cesium.Color.CYAN.withAlpha(0.6),
  //       speed: 0.021,
  //       repeat: new Cesium.Cartesian2(20, 1),
  //     }),
  //     clampToGround: true,
  //     arcType: Cesium.ArcType.GEODESIC,
  //   }
  // });
}

const closeVideoPanel = () => {
  showVideoPanel.value = false;
  selectedBillboardData.value = null;
};

const closeDisplacementPanel = () => {
  showDisplacementPanel.value = false;
  selectedBillboardData.value = null;
};
// 关闭闸门控制面板
const closeGateControlPanel = () => {
  showGateControlPanel.value = false;
  selectedGateData.value = null;
};

// 关闭闸站控制弹窗
const closeGateControlModal = () => {
  showGateControlModal.value = false;
  selectedStationData.value = null;
};

// 处理闸门动画
const handleGateAnimation = (animationData) => {
  if (!animationData || !animationData.gateId) {
    console.warn('动画数据无效:', animationData);
    return;
  }
  
  const { isOpening, gateId } = animationData;
  
  if (isOpening === null) {
    // 停闸操作：停止当前动画
    const animationState = getZhamenAnimationState();
    animationState.isAnimating = false;
    console.log('停止闸门动画，闸门ID:', gateId);
  } else {
    // 开闸或关闸操作：执行动画
    animateZhamenHeight(viewer, isOpening, gateId);
    console.log('执行闸门动画，开闸:', isOpening, '闸门ID:', gateId);
  }
};

const closeDamDetailModal = () => {
  showDamDetailModal.value = false;
  selectedDamData.value = null;
};

// 关闭环境监测面板
const closeEnvironmentPanel = () => {
  showEnvironmentPanel.value = false;
  selectedBillboardData.value = null;
};

// 关闭压力监测面板
const closePressurePanel = () => {
  showPressurePanel.value = false;
  selectedBillboardData.value = null;
};

</script>

<style scoped>
/* #cesiumContainer {
  height: 100%;
  width: 100%;
} */
#cesiumContainer {
  width: 100vw;
  height: 100vh;
}

.viewer-container {
  position: relative;
  /* 确保Panel可以正确定位 */
  width: 100%;
  height: 100%;
}

.map-switch-buttons {
  position: absolute;
  bottom: 20%;
  right: 420px;
  z-index: 1000;
}

.map-button-group {
  position: relative;
  width: 84px;
  height: 84px;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.map-button-group.expanded {
  width: 280px;
}

.map-button {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  background: rgb(118 222 255 / 15%);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  width: 84px;
  height: 84px;
  top: 0;
  left: 0;
}

/* 默认堆叠状态 - 所有按钮重叠在一起 */
.map-button:nth-child(1) {
  z-index: 3;
}

.map-button:nth-child(2) {
  z-index: 2;
  transform: translateX(2px) translateY(2px);
}

.map-button:nth-child(3) {
  z-index: 1;
  transform: translateX(4px) translateY(4px);
}

/* 展开状态 */
.map-button-group.expanded .map-button:nth-child(1) {
  left: -20px;
  transform: translateX(0) translateY(0);
}

.map-button-group.expanded .map-button:nth-child(2) {
  left: 95px;
  transform: translateX(0) translateY(0);
}

.map-button-group.expanded .map-button:nth-child(3) {
  left: 205px;
  transform: translateX(0) translateY(0);
}

.map-button:hover {
  background: rgba(118, 222, 255, 0.3);
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.map-button.active {
  border-color: #409eff;
  background: rgba(0 38 78);
}

/* 选中的按钮显示在最上层 */
.map-button.top-layer {
  z-index: 10 !important;
}

.map-button img {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  margin: 10px;
}

.map-button span {
  font-size: 12px;
  color: #FFFFFF;
  font-weight: 500;
  white-space: nowrap;
}

.map-button.active span {
  color: #409eff;
}
</style>