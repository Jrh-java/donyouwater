<template>
  <div ref="threeContainer" class="three-model-viewer"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { DRACOLoader } from 'three-stdlib';
import { OrbitControls } from 'three-stdlib';

const props = defineProps({
  modelPath: {
    type: String,
    required: true
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  height: {
    type: [String, Number],
    default: '400px'
  },
  backgroundColor: {
    type: String,
    default: '#f0f0f0'
  }
});

const emit = defineEmits(['modelLoaded', 'modelError', 'loadProgress']);

// Three.js 相关变量
const threeContainer = ref(null);
let scene = null;
let camera = null;
let renderer = null;
let model = null;
let animationId = null;
let controls = null;

// 初始化Three.js场景
const initThreeJS = () => {
  if (!threeContainer.value) return;
  
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(props.backgroundColor);
  
  // 创建相机
  const containerWidth = threeContainer.value.clientWidth;
  const containerHeight = threeContainer.value.clientHeight;
  camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(containerWidth, containerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  threeContainer.value.appendChild(renderer.domElement);
  
  // 添加光源
  const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  
  // 添加顶部聚光灯
  const topSpotLight = new THREE.SpotLight(0xffffff, 1.2);
  topSpotLight.position.set(0, 20, 0);
  topSpotLight.angle = Math.PI / 4;
  topSpotLight.penumbra = 0.3;
  topSpotLight.decay = 2;
  topSpotLight.distance = 50;
  topSpotLight.castShadow = true;
  scene.add(topSpotLight);
  
  // 添加额外的点光源提高亮度
  const pointLight = new THREE.PointLight(0xffffff, 0.6, 30);
  pointLight.position.set(0, 15, 10);
  scene.add(pointLight);
  
  // 添加控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
  // 渲染循环
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();
  
  // 处理窗口大小变化
  const handleResize = () => {
    if (!threeContainer.value) return;
    const width = threeContainer.value.clientWidth;
    const height = threeContainer.value.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  
  window.addEventListener('resize', handleResize);
  
  // 加载GLB模型
  loadGLBModel();
};

// 加载GLB模型
const loadGLBModel = () => {
  const loader = new GLTFLoader();
  
  // 设置DRACO解码器
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  loader.setDRACOLoader(dracoLoader);
  
  loader.load(
    props.modelPath,
    (gltf) => {
      model = gltf.scene;
      model.scale.set(1, 1, 1);
      model.position.set(0, 0, 0);
      scene.add(model);
      
      // 调整相机位置以适应模型
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5; // 增加一些距离
      
      camera.position.set(center.x, center.y + size.y / 2, center.z + cameraZ);
      camera.lookAt(center);
      
      emit('modelLoaded', { model: gltf.scene, gltf });
    },
    (progress) => {
      const progressPercent = (progress.loaded / progress.total * 100);
      console.log('模型加载进度:', progressPercent + '%');
      emit('loadProgress', progressPercent);
    },
    (error) => {
      console.error('模型加载失败:', error);
      emit('modelError', error);
    }
  );
};

// 清理Three.js资源
const cleanupThreeJS = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  if (controls) {
    controls.dispose();
    controls = null;
  }
  
  if (renderer) {
    renderer.dispose();
    if (threeContainer.value && renderer.domElement) {
      threeContainer.value.removeChild(renderer.domElement);
    }
    renderer = null;
  }
  
  if (scene) {
    scene.clear();
    scene = null;
  }
  
  camera = null;
  model = null;
  
  window.removeEventListener('resize', () => {});
};

// 暴露方法给父组件
defineExpose({
  getModel: () => model,
  getScene: () => scene,
  getCamera: () => camera,
  getRenderer: () => renderer
});

onMounted(async () => {
  await nextTick();
  initThreeJS();
});

onBeforeUnmount(() => {
  cleanupThreeJS();
});
</script>

<style lang="scss" scoped>
.three-model-viewer {
  width: v-bind(width);
  height: v-bind(height);
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}
</style>