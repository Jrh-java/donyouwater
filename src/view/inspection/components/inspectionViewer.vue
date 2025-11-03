<template>
    <div id="inspectionViewerMap"></div>
</template>

<script setup>
import { onMounted, ref, defineExpose } from 'vue';
import * as Cesium from 'cesium';
import dynamicWall from '@/utils/electronicFence';

// 节点和线条数据
const routeNodes = ref([]);
const polylineEntity = ref(null);
const circleEntity = ref(null);
const rectangleEntity = ref(null);

let viewer;
let cesiumCanvas;
let mapClickHandler = null;
let isMapClickEnabled = false;

const emit = defineEmits(['distanceCalculated', 'areaCalculated', 'map-click']);

onMounted(() => {
    viewer = new Cesium.Viewer('inspectionViewerMap', {
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
        // 确保WebGL上下文保持以支持截图
        contextOptions: {
            preserveDrawingBuffer: true,
            alpha: false
        }
    });
    
    const scene = viewer.scene;
    cesiumCanvas = scene.canvas;
    window["inspectionViewerMap"] = viewer;
    
    // 隐藏版权信息
    viewer._cesiumWidget._creditContainer.style.display = "none";
    
    // 设置初始视角到指定坐标区域
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(118.6269880154706, 27.149794936215155, 5000.0)
    });
    
    // 添加动态墙效果
    dynamicWall(viewer);
    
    // 启用渲染循环以确保持续渲染
    scene.requestRenderMode = false;
    
    // 确保地球和大气渲染
    scene.globe.enableLighting = false;
    scene.globe.show = true;
    scene.skyBox.show = true;
    scene.sun.show = true;
    scene.moon.show = true;
    scene.skyAtmosphere.show = true;
    
    console.log('Cesium Viewer 初始化完成，支持截图功能');
});

// 添加节点到地图
const addNodeToMap = (node) => {
    const position = Cesium.Cartesian3.fromDegrees(node.longitude, node.latitude);
    
    // 添加点标记
    const pointEntity = viewer.entities.add({
        position: position,
        point: {
            pixelSize: 10,
            color: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
            text: node.name,
            font: '12pt sans-serif',
            pixelOffset: new Cesium.Cartesian2(0, -50),
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        }
    });
    
    routeNodes.value.push({
        ...node,
        entity: pointEntity
    });
    
    updatePolyline();
    calculateDistance();
};

// 更新连接线
const updatePolyline = () => {
    if (polylineEntity.value) {
        viewer.entities.remove(polylineEntity.value);
    }
    
    if (routeNodes.value.length > 1) {
        const positions = routeNodes.value.map(node => 
            Cesium.Cartesian3.fromDegrees(node.longitude, node.latitude)
        );
        
        polylineEntity.value = viewer.entities.add({
            polyline: {
                positions: positions,
                width: 3,
                material: Cesium.Color.BLUE,
                clampToGround: true
            }
        });
    }
};

// 计算总距离（简化版，实际应使用turf.js）
const calculateDistance = () => {
    if (routeNodes.value.length < 2) {
        emit('distanceCalculated', 0);
        return;
    }
    
    let totalDistance = 0;
    for (let i = 1; i < routeNodes.value.length; i++) {
        const prev = routeNodes.value[i - 1];
        const curr = routeNodes.value[i];
        
        // 使用Cesium的距离计算（简化版）
        const pos1 = Cesium.Cartesian3.fromDegrees(prev.longitude, prev.latitude);
        const pos2 = Cesium.Cartesian3.fromDegrees(curr.longitude, curr.latitude);
        const distance = Cesium.Cartesian3.distance(pos1, pos2);
        totalDistance += distance;
    }
    
    // 转换为公里
    const distanceKm = (totalDistance / 1000).toFixed(2);
    emit('distanceCalculated', distanceKm);
};

// 删除节点
const removeNodeFromMap = (index) => {
    if (routeNodes.value[index] && routeNodes.value[index].entity) {
        viewer.entities.remove(routeNodes.value[index].entity);
        routeNodes.value.splice(index, 1);
        updatePolyline();
        calculateDistance();
    }
};

// 飞行到指定节点
const flyToNode = (node) => {
    const position = Cesium.Cartesian3.fromDegrees(node.longitude, node.latitude);
    viewer.camera.flyTo({
        destination: position,
        duration: 2.0,
        offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-45), 1000)
    });
};

// 重新计算距离（提供给外部调用）
const recalculateDistance = () => {
    calculateDistance();
};

// 清除所有节点
const clearAllNodes = () => {
    routeNodes.value.forEach(node => {
        if (node.entity) {
            viewer.entities.remove(node.entity);
        }
    });
    
    if (polylineEntity.value) {
        viewer.entities.remove(polylineEntity.value);
        polylineEntity.value = null;
    }
    
    routeNodes.value = [];
    emit('distanceCalculated', 0);
};

// 绘制圆形区域
const drawCircleArea = (centerLng, centerLat, radius) => {
    // 清除之前的圆形
    if (circleEntity.value) {
        viewer.entities.remove(circleEntity.value);
    }
    
    const center = Cesium.Cartesian3.fromDegrees(centerLng, centerLat);
    
    circleEntity.value = viewer.entities.add({
        position: center,
        ellipse: {
            semiMinorAxis: radius,
            semiMajorAxis: radius,
            material: Cesium.Color.BLUE.withAlpha(0.3),
            outline: true,
            outlineColor: Cesium.Color.BLUE,
            height: 0
        }
    });
    
    // 计算面积（π * r²）
    const area = Math.PI * Math.pow(radius, 2);
    const areaKm2 = (area / 1000000).toFixed(2); // 转换为平方公里
    emit('areaCalculated', areaKm2, 'circle');
    
    // 使用 camera.flyTo 飞到圆形区域
    const distance = radius * 4; // 根据半径计算合适的观察距离
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(centerLng, centerLat, distance),
        duration: 2.0
    });
};

// 绘制矩形区域
const drawRectangleArea = (topLeftLng, topLeftLat, bottomRightLng, bottomRightLat) => {
    // 清除之前的矩形
    if (rectangleEntity.value) {
        viewer.entities.remove(rectangleEntity.value);
    }
    
    try {
        const rectangle = Cesium.Rectangle.fromDegrees(
            topLeftLng, 
            bottomRightLat, 
            bottomRightLng, 
            topLeftLat
        );
        
        rectangleEntity.value = viewer.entities.add({
            rectangle: {
                coordinates: rectangle,
                material: Cesium.Color.RED.withAlpha(0.3),
                outline: true,
                outlineColor: Cesium.Color.RED,
                height: 0
            }
        });
        
        // 计算面积
        const width = Cesium.Cartesian3.distance(
            Cesium.Cartesian3.fromDegrees(topLeftLng, topLeftLat),
            Cesium.Cartesian3.fromDegrees(bottomRightLng, topLeftLat)
        );
        const height = Cesium.Cartesian3.distance(
            Cesium.Cartesian3.fromDegrees(topLeftLng, topLeftLat),
            Cesium.Cartesian3.fromDegrees(topLeftLng, bottomRightLat)
        );
        
        const area = width * height;
        const areaKm2 = (area / 1000000).toFixed(2); // 转换为平方公里
        emit('areaCalculated', areaKm2, 'rectangle');
        
        // 计算矩形中心点和合适的观察距离
        const centerLng = (topLeftLng + bottomRightLng) / 2;
        const centerLat = (topLeftLat + bottomRightLat) / 2;
        const distance = Math.max(width, height) * 2; // 根据矩形大小计算观察距离
        
        // 使用 camera.flyTo 飞到矩形区域
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(centerLng, centerLat, distance),
            duration: 2.0
        });
    } catch (error) {
        console.error('绘制矩形区域出错:', error);
        // 这个错误通常不会发生，因为我们已经在前端做了验证
    }
};

// 清除圆形区域
const clearCircleArea = () => {
    if (circleEntity.value) {
        viewer.entities.remove(circleEntity.value);
        circleEntity.value = null;
    }
    // 不再主动触发事件，由父组件管理状态
};

// 清除矩形区域
const clearRectangleArea = () => {
    if (rectangleEntity.value) {
        viewer.entities.remove(rectangleEntity.value);
        rectangleEntity.value = null;
    }
    // 不再主动触发事件，由父组件管理状态
};

// 清除区域
const clearAreas = () => {
    if (circleEntity.value) {
        viewer.entities.remove(circleEntity.value);
        circleEntity.value = null;
    }
    if (rectangleEntity.value) {
        viewer.entities.remove(rectangleEntity.value);
        rectangleEntity.value = null;
    }
    // 清除所有区域时重置面积为0
    emit('areaCalculated', 0);
};

// 检查场景是否准备就绪进行截图
const isSceneReadyForScreenshot = () => {
    if (!viewer || !viewer.scene || !viewer.scene.canvas) {
        console.warn('场景未初始化');
        return false;
    }
    
    const canvas = viewer.scene.canvas;
    if (canvas.width === 0 || canvas.height === 0) {
        console.warn('Canvas尺寸无效:', canvas.width, 'x', canvas.height);
        return false;
    }
    
    // 检查是否有实体或地形数据
    const hasEntities = viewer.entities.values.length > 0;
    const hasImageryLayers = viewer.scene.imageryLayers.length > 0;
    
    console.log('场景状态检查:', {
        hasEntities,
        hasImageryLayers,
        canvasSize: `${canvas.width}x${canvas.height}`,
        viewerReady: !!viewer,
        sceneReady: !!viewer.scene
    });
    
    return true;
};

// 截图功能
const captureScreenshot = () => {
    return new Promise((resolve) => {
        viewer.render();
        requestAnimationFrame(() => {
            const canvas = viewer.scene.canvas;
            const screenshot = canvas.toDataURL('image/jpeg', 0.8);
            resolve(screenshot);
        });
    });
};

// 获取Canvas元素
const getCanvas = () => {
    return viewer?.scene?.canvas;
};

// 飞行到节点包围盒
const flyToBounds = (bounds) => {
    if (!bounds) return;
    
    const rectangle = Cesium.Rectangle.fromDegrees(
        bounds.west,
        bounds.south, 
        bounds.east,
        bounds.north
    );
    
    viewer.camera.flyTo({
        destination: rectangle,
        duration: 2.0
    });
};

// 适配包围盒
const fitBounds = (bounds) => {
    flyToBounds(bounds);
};

// 飞行到所有节点的最佳视角
const flyToAllNodes = () => {
    if (routeNodes.value.length === 0) return;
    
    if (routeNodes.value.length === 1) {
        // 单个节点：飞行到该节点
        const node = routeNodes.value[0];
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(node.longitude, node.latitude, 2000),
            duration: 2.0
        });
    } else {
        // 多个节点：计算包围盒
        const lngs = routeNodes.value.map(node => node.longitude);
        const lats = routeNodes.value.map(node => node.latitude);
        
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        
        // 计算包围盒的宽度和高度
        const width = maxLng - minLng;
        const height = maxLat - minLat;
        
        // 如果包围盒太小（比如只有两个很近的点），设置最小边距
        const minPadding = 0.005; // 最小边距
        const padding = Math.max(minPadding, Math.max(width, height) * 0.2);
        
        const rectangle = Cesium.Rectangle.fromDegrees(
            minLng - padding,
            minLat - padding,
            maxLng + padding,
            maxLat + padding
        );
        
        viewer.camera.flyTo({
            destination: rectangle,
            duration: 2.0
        });
    }
};

// 启用地图点击
const enableMapClick = () => {
    if (!viewer || isMapClickEnabled) return;
    
    isMapClickEnabled = true;
    mapClickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    mapClickHandler.setInputAction((click) => {
        const pickedObject = viewer.scene.pick(click.position);
        if (!pickedObject) {
            // 点击空白处时获取坐标
            const position = viewer.scene.camera.pickEllipsoid(click.position);
            if (position) {
                const cartographic = Cesium.Cartographic.fromCartesian(position);
                const longitude = Cesium.Math.toDegrees(cartographic.longitude);
                const latitude = Cesium.Math.toDegrees(cartographic.latitude);
                
                emit('map-click', {
                    longitude: parseFloat(longitude.toFixed(6)),
                    latitude: parseFloat(latitude.toFixed(6))
                });
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

// 禁用地图点击
const disableMapClick = () => {
    if (!viewer || !isMapClickEnabled) return;
    
    isMapClickEnabled = false;
    if (mapClickHandler) {
        mapClickHandler.destroy();
        mapClickHandler = null;
    }
};

// 暴露方法给父组件
defineExpose({
    addNodeToMap,
    removeNodeFromMap,
    clearAllNodes,
    drawCircleArea,
    drawRectangleArea,
    clearAreas,
    clearCircleArea,
    clearRectangleArea,
    flyToNode,
    recalculateDistance,
    captureScreenshot,
    getCanvas,
    flyToBounds,
    fitBounds,
    flyToAllNodes,
    enableMapClick,
    disableMapClick
});
</script>

<style>
#inspectionViewerMap {
    height: 100%;
    width: 100%;
}
</style>