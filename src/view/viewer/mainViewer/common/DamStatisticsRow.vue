<template>
  <!-- <div class="dam-statistics-row">
    <DamStatisticsCard
      v-for="item in statistics"
      :key="item.name"
      :name="item.name"
      :count="item.count"
      :icon="item.icon"
    />
  </div> -->
</template>

<script setup lang="ts">
import DamStatisticsCard from './DamStatisticsCard.vue';
import WaterIcon from '@/assets/viewer/water.png'; // 引入图片
import { ref } from 'vue';

const statistics = ref([
  {
    name: '大型水闸站',
    count: 1,
    icon: WaterIcon
  },
  {
    name: '中型水闸站',
    count: 1,
    icon: WaterIcon
  },
  {
    name: '小型水闸站',
    count: 1,
    icon: WaterIcon
  }
]);

</script>

<style scoped>
.dam-statistics-row {
  display: flex;
  justify-content: center; /* 水平居中排列卡片 */
  align-items: center;

  padding: 10px 0; /* 上下留白 */
  position: absolute; /* 用于定位在Header下方 */
  top: 95px; /* 根据Header高度调整，确保在Header下方 */
  left: 50%;
  transform: translateX(-50%);
  z-index: 1; /* 比 Cesium Viewer 和 Side Panels 高，但可能需要低于Header中的下拉菜单等 */
}
</style> 