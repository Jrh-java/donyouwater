import * as Cesium from 'cesium';

/**
 * 3D Tiles模型加载器
 * @param {Cesium.Viewer} viewer - Cesium viewer实例
 * @param {Object} options - 配置选项
 * @param {string} options.url - 3D Tiles模型的URL
 * @param {number} options.longitude - 经度
 * @param {number} options.latitude - 纬度
 * @param {number} [options.height=0] - 高度
 * @param {number} [options.scale=1] - 缩放比例
 * @param {boolean} [options.flyTo=true] - 是否飞行到模型位置
 * @param {number} [options.flyDuration=3] - 飞行持续时间（秒）
 * @param {boolean} [options.adjustPosition=true] - 是否根据经纬度调整模型位置
 * @returns {Promise<Cesium.Cesium3DTileset>} 返回加载的3D Tiles实例
 */
export async function load3DTiles(viewer, options) {
  if (!viewer) {
    throw new Error('Viewer实例不能为空');
  }

  if (!options.url) {
    throw new Error('3D Tiles模型URL不能为空');
  }

  const {
    url,
    longitude,
    latitude,
    height = 0,
    scale = 1,
    flyTo = true,
    flyDuration = 3,
    adjustPosition = true
  } = options;

  try {
    console.log('开始加载3D Tiles模型:', url);
    
    // 创建3D Tiles实例
    const tileset = await Cesium.Cesium3DTileset.fromUrl(url);
    
    // 添加到场景中
    viewer.scene.primitives.add(tileset);
    
    // 等待模型加载完成
    await tileset.readyPromise;
    
    console.log('3D Tiles模型加载完成');
    
    // 根据配置调整模型位置
    if (adjustPosition && longitude !== undefined && latitude !== undefined) {
      console.log('调整3D Tiles模型位置到:', [longitude, latitude, height]);
      
      // 等待模型包围球计算完成
      await tileset.readyPromise;
      
      // 获取模型原始中心点
      const modelCenter = tileset.boundingSphere.center;
      
      // 创建目标位置坐标
      const targetPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
      
      // 计算从模型中心到目标位置的平移向量
      const translation = Cesium.Cartesian3.subtract(
        targetPosition,
        modelCenter,
        new Cesium.Cartesian3()
      );
      
      // 创建变换矩阵
      let transformMatrix = Cesium.Matrix4.IDENTITY.clone();
      
      // 先应用缩放（在原点进行缩放）
      if (scale !== 1) {
        const scaleMatrix = Cesium.Matrix4.fromUniformScale(scale);
        Cesium.Matrix4.multiply(transformMatrix, scaleMatrix, transformMatrix);
      }
      
      // 再应用平移
      const translationMatrix = Cesium.Matrix4.fromTranslation(translation);
      Cesium.Matrix4.multiply(translationMatrix, transformMatrix, transformMatrix);
      
      // 应用变换到模型
      tileset.modelMatrix = transformMatrix;
      
      console.log('3D Tiles模型位置调整完成');
    } else if (longitude !== undefined && latitude !== undefined) {
      // 传统的位置设置方式（当adjustPosition为false时）
      const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
      const transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
      
      // 应用缩放
      if (scale !== 1) {
        const scaleMatrix = Cesium.Matrix4.fromUniformScale(scale);
        Cesium.Matrix4.multiply(transform, scaleMatrix, transform);
      }
      
      // 设置模型变换
      tileset.modelMatrix = transform;
    }
    
    // 飞行到模型位置
    if (flyTo) {
      const boundingSphere = tileset.boundingSphere;
      if (boundingSphere) {
        viewer.camera.flyToBoundingSphere(boundingSphere, {
          duration: flyDuration,
          offset: new Cesium.HeadingPitchRange(0, -0.5, boundingSphere.radius * 2)
        });
      } else {
        // 如果没有包围球，飞行到指定坐标
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height + 1000),
          duration: flyDuration
        });
      }
    }
    
    return tileset;
  } catch (error) {
    console.error('加载3D Tiles模型失败:', error);
    throw error;
  }
}

/**
 * 移除3D Tiles模型
 * @param {Cesium.Viewer} viewer - Cesium viewer实例
 * @param {Cesium.Cesium3DTileset} tileset - 要移除的3D Tiles实例
 */
export function remove3DTiles(viewer, tileset) {
  if (viewer && tileset) {
    viewer.scene.primitives.remove(tileset);
    console.log('3D Tiles模型已移除');
  }
}

/**
 * 获取3D Tiles模型信息
 * @param {Cesium.Cesium3DTileset} tileset - 3D Tiles实例
 * @returns {Object} 模型信息
 */
export function get3DTilesInfo(tileset) {
  if (!tileset) {
    return null;
  }
  
  return {
    url: tileset.url,
    ready: tileset.ready,
    boundingSphere: tileset.boundingSphere,
    maximumScreenSpaceError: tileset.maximumScreenSpaceError,
    memoryUsage: tileset.totalMemoryUsageInBytes,
    tilesLoaded: tileset.tilesLoaded,
    pointsLength: tileset.pointsLength,
    trianglesLength: tileset.trianglesLength
  };
}

/**
 * 设置3D Tiles样式
 * @param {Cesium.Cesium3DTileset} tileset - 3D Tiles实例
 * @param {Object} styleOptions - 样式选项
 * @param {Cesium.Color} [styleOptions.color] - 颜色
 * @param {number} [styleOptions.alpha] - 透明度
 * @param {boolean} [styleOptions.show] - 是否显示
 */
export function set3DTilesStyle(tileset, styleOptions) {
  if (!tileset || !styleOptions) {
    return;
  }
  
  const style = new Cesium.Cesium3DTileStyle();
  
  if (styleOptions.color) {
    style.color = `color('${styleOptions.color.toCssColorString()}')`;
  }
  
  if (styleOptions.alpha !== undefined) {
    style.color = `color('rgba(255, 255, 255, ${styleOptions.alpha})')`;
  }
  
  if (styleOptions.show !== undefined) {
    style.show = styleOptions.show;
  }
  
  tileset.style = style;
}

/**
 * 设置3D Tiles模型位置
 * @param {Cesium.Cesium3DTileset} tileset - 3D Tiles实例
 * @param {number[]} position - 位置数组 [longitude, latitude, height]
 */
export function set3DTilesPosition(tileset, position) {
  console.log('设置3D Tiles位置:', position);
  
  if (!tileset || !position || position.length < 3) {
    console.error('tileset或position参数无效');
    return;
  }
  
  try {
    // 创建新的位置坐标
    const newPosition = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);
    
    // 计算当前模型中心与新位置的偏移量
    const translation = Cesium.Cartesian3.subtract(
      newPosition, 
      tileset.boundingSphere.center, 
      new Cesium.Cartesian3()
    );
    
    // 创建平移变换矩阵
    const transMatrix = Cesium.Matrix4.fromTranslation(translation);
    
    // 将平移变换应用到当前模型矩阵
    const newMatrix = Cesium.Matrix4.multiply(
      tileset.modelMatrix, 
      transMatrix, 
      new Cesium.Matrix4()
    );
    
    // 更新模型矩阵
    tileset.modelMatrix = newMatrix;
    
    console.log('3D Tiles位置更新完成');
  } catch (error) {
    console.error('设置3D Tiles位置失败:', error);
  }
}

export default {
  load3DTiles,
  remove3DTiles,
  get3DTilesInfo,
  set3DTilesStyle
};