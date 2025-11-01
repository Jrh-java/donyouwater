import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import * as Cesium from 'cesium'
import { createPinia } from "pinia";
import  './style/main.scss';
import router from './router'
import ElementPlus from 'element-plus'
import VChart from 'vue-echarts';
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import { privilegeDirective } from '@/directives/privilege';
const pinia = createPinia();
const app = createApp(App)
app.directive('privilege', {
  mounted(el, binding) {
    privilegeDirective(el, binding);
  },
  updated(el, binding) {
    // 当绑定值更新时也需要重新检查权限
    privilegeDirective(el, binding);
  }
});

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus)
app.component('v-chart', VChart);
app.config.globalProperties.$Cesium = Cesium;
app.config.globalProperties.$Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNzFiMGRlNi04YjBmLTRmMWMtYjk5Ny1iZTMwZGJmNWQzN2IiLCJpZCI6NTA0MDgsImlhdCI6MTY1Nzk0NzIyNH0.s-VNwxFn26XgStOLVV-pd_ft88yOwpRtpVPGgB6v9UQ'
app.use(pinia).use(router).mount('#app');
