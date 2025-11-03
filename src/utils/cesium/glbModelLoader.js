import * as Cesium from 'cesium';

// GLB模型动画状态
const zhamenAnimationState = {
  isAnimating: false,
  isOpen: false, // 闸门是否打开状态
  originalHeight: -5, // 关闭状态的高度
  targetHeight: 0 // 打开状态的高度
};

/**
 * 获取GLB模型配置
 * @returns {Promise<Array>} 模型配置数组
 */
export const getGLBModelsConfig = async () => {
  try {
    const response = await fetch('/config/glbModels.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const config = await response.json();
    return config;
  } catch (error) {
    console.error('加载GLB模型配置失败:', error);
    return [];
  }
};

/**
 * 创建GLB模型实体
 * @param {Object} modelConfig 模型配置
 * @returns {Object} 实体配置对象
 */
export const createGLBModelEntity = (modelConfig) => {
  const position = Cesium.Cartesian3.fromDegrees(
    modelConfig.position.longitude,
    modelConfig.position.latitude,
    modelConfig.position.height
  );
  
  const heading = Cesium.Math.toRadians(modelConfig.orientation.heading);
  const pitch = Cesium.Math.toRadians(modelConfig.orientation.pitch);
  const roll = Cesium.Math.toRadians(modelConfig.orientation.roll);
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
  
  return {
    id: modelConfig.id,
    position: position,
    orientation: orientation,
    model: {
      scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 1e6, 1.0),
      uri: modelConfig.url,
      scale: modelConfig.scale,
      minimumPixelSize: 1,
      maximumScale: 20000
    },
    customData: {
      clickable: modelConfig.clickable || false,
      originalConfig: modelConfig
    }
  };
};

/**
 * 闸门高度动画
 * @param {Cesium.Viewer} viewer Cesium viewer 实例
 * @param {boolean} isOpening 是否为打开动画
 * @param {string} gateId 闸门实体ID
 * @param {number} duration 动画持续时间（毫秒）
 */
export const animateZhamenHeight = (viewer, isOpening, gateId, duration = 12000) => {
  if (zhamenAnimationState.isAnimating) return;
  
  const entity = viewer.entities.getById(gateId);
  if (!entity) {
    console.warn('未找到闸门实体:', gateId);
    return;
  }
  
  // 获取实体的原始配置信息
  const originalConfig = entity.customData?.originalConfig;
  if (!originalConfig) {
    console.warn('未找到闸门原始配置信息:', gateId);
    return;
  }
  
  zhamenAnimationState.isAnimating = true;
  
  const startTime = Date.now();
  let startHeight, targetHeight;
  
  if (isOpening) {
    // 打开闸门：从原始高度下降到目标高度
    startHeight = zhamenAnimationState.originalHeight;
    targetHeight = zhamenAnimationState.targetHeight;
  } else {
    // 关闭闸门：从目标高度回到原始高度
    startHeight = zhamenAnimationState.targetHeight;
    targetHeight = zhamenAnimationState.originalHeight;
  }
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // 使用缓动函数实现平滑动画
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentHeight = startHeight + (targetHeight - startHeight) * easeProgress;
    
    const newPosition = Cesium.Cartesian3.fromDegrees(
      originalConfig.position.longitude,
      originalConfig.position.latitude,
      currentHeight
    );
    
    entity.position = newPosition;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      zhamenAnimationState.isAnimating = false;
      zhamenAnimationState.isOpen = isOpening;
    }
  };
  
  animate();
};

/**
 * 处理闸门点击事件
 * @param {string} entityId 实体ID
 * @param {Function} onGateClick 闸门点击回调函数
 */
export const handleZhamenClick = (entityId, onGateClick) => {
  // 从实体ID中提取设备编码
  const deviceCodeMatch = entityId.match(/glbModel-zhamen.*?-(.+)$/);
  if (deviceCodeMatch && deviceCodeMatch[1]) {
    const deviceCode = deviceCodeMatch[1];
    
    // 根据entityId确定闸门标题
    let gateTitle = '闸门控制';
    if (entityId.includes('zhamen1')) {
      gateTitle = '一号闸门控制';
    } else if (entityId.includes('zhamen2')) {
      gateTitle = '二号闸门控制';
    }
    
    const gateData = {
      title: gateTitle,
      deviceCode: deviceCode,
      gateId: entityId
    };
    
    if (onGateClick) {
      onGateClick(gateData);
    }
    
    console.log('点击闸门模型，设备编码:', deviceCode, '闸门ID:', entityId);
  } else {
    console.warn('无法从实体ID中提取设备编码:', entityId);
  }
};

/**
 * 处理闸站模型点击事件
 * @param {string} entityId 实体ID
 * @param {Function} onStationClick 闸站点击回调函数
 * @param {string} modelName 模型名称（从GLB配置中获取）
 */
export const handleStationClick = (entityId, onStationClick, modelName = null) => {
  // 检查是否为FJ.JODY.FH01前缀的闸站模型
  const stationMatch = entityId.match(/glbModel-(FJ\.JODY\.FH01\..+\.STATION)$/);
  if (stationMatch && stationMatch[1]) {
    const stationCode = stationMatch[1];
    
    // 使用传入的模型名称作为标题，如果没有则使用默认标题
    const stationTitle = modelName || '闸站控制';
    
    const stationData = {
      title: stationTitle,
      gateStationCode: stationCode,
      stationId: entityId
    };
    
    if (onStationClick) {
      onStationClick(stationData);
    }
    
    console.log('点击闸站模型，闸站编码:', stationCode, '闸站ID:', entityId, '模型名称:', modelName);
  } else {
    console.warn('无法从实体ID中提取闸站编码:', entityId);
  }
};

/**
 * 加载GLB模型
 * @param {Cesium.Viewer} viewer Cesium viewer 实例
 * @param {Function} onGateClick 闸门点击回调函数（可选）
 * @returns {Promise<Array>} 加载的模型实体数组
 */
export const loadGLBModels = async (viewer, onGateClick = null) => {
  if (!viewer) {
    console.error('Viewer未初始化，无法加载GLB模型');
    return [];
  }
  
  try {
    console.log('开始加载GLB模型...');
    
    const glbModelsConfig = await getGLBModelsConfig();
    const loadedModels = [];
    
    for (const modelConfig of glbModelsConfig) {
      try {
        const entityConfig = createGLBModelEntity(modelConfig);
        const entity = viewer.entities.add(entityConfig);
        loadedModels.push(entity);
        console.log(`GLB模型加载成功: ${modelConfig.url}`, entity);
      } catch (error) {
        console.error(`加载GLB模型失败: ${modelConfig.url}`, error);
      }
    }
    
    // 飞行到模型位置
    if (loadedModels.length > 0) {
      viewer.flyTo(loadedModels, {
        duration: 3
      });
    }
    
    console.log(`GLB模型加载完成，成功加载 ${loadedModels.length} 个模型`);
    
    return loadedModels;
    
  } catch (error) {
    console.error('加载GLB模型失败:', error);
    return [];
  }
};

/**
 * 获取闸门动画状态
 * @returns {Object} 动画状态对象
 */
export const getZhamenAnimationState = () => {
  return { ...zhamenAnimationState };
};

/**
 * 重置闸门动画状态
 */
export const resetZhamenAnimationState = () => {
  zhamenAnimationState.isAnimating = false;
  zhamenAnimationState.isOpen = false;
};