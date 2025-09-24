<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import autofit from 'autofit.js'
import { onMounted } from 'vue'
onMounted(() => {
  autofit.init({
  dh: 1080,
  dw: 1920,
  el: "body",
  resize: true,
  ignore:  [{
      el: "#cesiumContainer", //必填//有使用地图的情况一定要传地图的dom,不然会有很多问题 --eggsy
    },
    {
      el: "#addDeviceMap", //必填//有使用地图的情况一定要传地图的dom,不然会有很多问题 --eggsy
    },
    {
      el: "#editDeviceMap", //必填//有使用地图的情况一定要传地图的dom,不然会有很多问题 --eggsy

    },
    {
      el: "#inspectionViewerMap", //必填//有使用地图的情况一定要传地图的dom,不然会有很多问题 --eggsy

    },
 
    ]
})
})

</script>

<template>
  <div id="app">
    <el-config-provider :locale="zhCn">
      <!-- //路由插槽 -->
      <router-view></router-view>
    </el-config-provider>
  </div>
</template>

<style scoped>
html {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
/* @font-face {
  font-family: YouSheBiaoTiHei;
  src: url("@/assets/font/YouSheBiaoTiHei-2.ttf");
}
@font-face {
  font-family: DINCond-Bold;
  src: url("@/assets/font/DINCond-Bold.otf");
} */
</style>
