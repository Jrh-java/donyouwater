<template>
  <div v-if="show" class="panel-overlay">
    <div class="panel-container displacement-monitor-panel">
      <div class="panel-header">
        <span>{{ panelTitle }}</span>
        <button @click="closePanel" class="close-button">X</button>
      </div>
      <div class="panel-content">
        <div class="device-info-bar">
          <div class="info-item">
            <span class="label">设备名称:</span>
            <span class="value">{{ deviceData?.name || 'XXXXXXXXXX' }}</span>
          </div>
          <div class="info-item">
            <span class="label">设备编号:</span>
            <span class="value">{{ deviceData?.deviceCode || 'XXX' }}</span>
          </div>
          <div class="info-item">
            <span class="label">监测项目:</span>
            <span class="value">{{ deviceData?.monitorItem || 'XXX' }}</span>
          </div>
          <div class="info-item">
            <span class="label">设备状态:</span>
            <span class="value">{{ deviceData?.status || 'XXX' }}</span>
          </div>
        </div>

        <div class="tabs">
          <button
            :class="['tab-button', { active: activeTab === 'data' }]"
            @click="activeTab = 'data'"
          >
            监测数据
          </button>
          <button
            :class="['tab-button', { active: activeTab === 'info' }]"
            @click="activeTab = 'info'"
          >
            基本信息
          </button>
          <!-- <button
            :class="['tab-button', { active: activeTab === 'alerts' }]"
            @click="activeTab = 'alerts'"
          >
            历史告警
          </button> -->
        </div>

        <div class="tab-content">
          <div v-if="activeTab === 'data'" class="data-tab">
            <div class="toolbar">
              <label for="timeRange">时间筛选:</label>
              <select v-model="filterForm.timeRange" class="filter-select">
                <option value="24h">24小时</option>
                <option value="12h">12小时</option>
                <option value="6h">6小时</option>
              </select>
              <label for="direction" style="margin-left: 20px;">位移方向:</label>
              <select v-model="filterForm.direction" class="filter-select">
                <option value="all">全部</option>
                <option value="北向偏移">北向偏移</option>
                <option value="东向偏移">东向偏移</option>
                <option value="高程偏移">高程偏移</option>
                <option value="北向累计偏移">北向累计偏移</option>
                <option value="东向累计偏移">东向累计偏移</option>
                <option value="高程累计偏移">高程累计偏移</option>
              </select>
            </div>
            <DisplacementTable 
              :height="250"
              :show-pagination="true"
              :filter-form="filterForm"
              :gate-station-code="deviceData.gateStationCode || deviceData.code || ''"
            />
             <div class="legend-tooltip">
              <p>1. 默认时间区间为近一月</p>
              <p>2. 可切换查看图表形式或列表形式，列表横坐标时间，纵坐标监测值，设置一级二级告警线</p>
              <p>3. 数据列表该列显示告警状态：正常，II级告警，I级告警</p>
            </div>
          </div>

          <div v-if="activeTab === 'info'" class="info-tab">
            <div class="info-grid">
              <div class="info-field">
                <span class="label">所属区域:</span>
                <span class="value">{{ deviceData?.basicInfo?.area || 'XXX' }}</span>
              </div>
              <div class="info-field">
                <span class="label">设备厂商:</span>
                <span class="value">{{ deviceData?.basicInfo?.manufacturer || 'XXX' }}</span>
              </div>
              <div class="info-field">
                <span class="label">设备型号:</span>
                <span class="value">{{ deviceData?.basicInfo?.model || 'XXX' }}</span>
              </div>
              <div class="info-field">
                <span class="label">负责人:</span>
                <span class="value">{{ deviceData?.basicInfo?.personInCharge || 'XXX' }}</span>
              </div>
              <div class="info-field">
                <span class="label">联系电话:</span>
                <span class="value">{{ deviceData?.basicInfo?.contact || 'XXX' }}</span>
              </div>
              <div class="info-field">
                <span class="label">经度:</span>
                <span class="value">{{ deviceData?.basicInfo?.longitude || 'XXX' }}</span>
              </div>
              <div class="info-field">
                <span class="label">纬度:</span>
                <span class="value">{{ deviceData?.basicInfo?.latitude || 'XXX' }}</span>
              </div>
              <div class="info-field">
                <span class="label">高度:</span>
                <span class="value">{{ deviceData?.basicInfo?.altitude || 'XXX' }}</span>
              </div>
              <div class="info-field full-width">
                <span class="label">备注:</span>
                <span class="value">{{ deviceData?.basicInfo?.remarks || 'XXXXXXXXXX' }}</span>
              </div>
            </div>
          </div>

          <!-- 历史告警部分暂时注释
          <div v-if="activeTab === 'alerts'" class="alerts-tab">
             <div class="toolbar">
              <label for="alertTimeRange">选择时间:</label>
              <input type="text" id="alertTimeRangeStart" placeholder="YYYY-MM-DD HH:MM" />
              <span>~</span>
              <input type="text" id="alertTimeRangeEnd" placeholder="YYYY-MM-DD HH:MM" />
              <button class="action-button">查询</button>
              <button class="action-button">重置</button>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>告警时间</th>
                  <th>告警等级</th>
                  <th>告警信息</th>
                  <th>处理状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="alert in alertHistory" :key="alert.id">
                  <td>{{ alert.id }}</td>
                  <td>{{ alert.time }}</td>
                  <td :class="getAlertClass(alert.level)">{{ alert.level }}</td>
                  <td>{{ alert.message }}</td>
                  <td>{{ alert.status }}</td>
                </tr>
              </tbody>
            </table>
            <div class="pagination">
              <button>1</button>
              <button>2</button>
              <button>3</button>
              <button>4</button>
              <button>5</button>
              <button>...</button>
              <button>末页</button>
              <button>下一页</button>
            </div>
          </div>
          -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, computed } from 'vue';
import DisplacementTable from '@/components/DisplacementTable.vue';

const props = defineProps({
  show: Boolean,
  panelTitle: String,
  deviceData: Object,
});

const emit = defineEmits(['close']);

const activeTab = ref('data'); // Default tab

// 过滤表单，模仿displacement.vue
const filterForm = reactive({
  timeRange: '24h',
  direction: 'all'
});

// 模拟selectedDamNode，从设备数据中获取gateStationCode
const mockSelectedDamNode = computed(() => {
  if (props.deviceData && props.deviceData.gateStationCode) {
    return {
      gateStationCode: props.deviceData.gateStationCode
    }
  }
  return null
})

const closePanel = () => {
  emit('close');
};

// 告警历史数据保持不变，用于历史告警tab

const alertHistory = ref([
  { id: 1, time: '2025-04-24 07:00', level: 'II级告警', message: '传感器数据异常', status: '处理中' },
  { id: 2, time: '2025-04-24 07:00', level: 'II级告警', message: '设备离线', status: '已处理' },
  { id: 3, time: '2025-04-24 07:00', level: 'II级告警', message: '数据超阈值', status: '未处理' },
  { id: 4, time: '2025-04-24 07:00', level: 'I级告警', message: '严重位移', status: '处理中' },
  { id: 5, time: '', level: '', message: '', status: '' },
  { id: 6, time: '', level: '', message: '', status: '' },
  { id: 7, time: '', level: '', message: '', status: '' },
  { id: 8, time: '', level: '', message: '', status: '' },
]);

const getAlertClass = (status) => {
  if (status === 'I级告警') return 'level-1-alert';
  if (status === 'II级告警') return 'level-2-alert';
  return '';
};

</script>

<style scoped>
.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure panel is above other content */
}

.panel-container {
  background-color: #0a214d; /* Dark blue background */
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  width: 800px; /* Adjust width as needed */
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.displacement-monitor-panel {
  /* Specific styles for this panel if needed */
}

.panel-header {
  background-color: #10306a; /* Slightly lighter blue for header */
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  font-size: 18px;
  font-weight: bold;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.panel-content {
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.device-info-bar {
  display: flex;
  justify-content: space-around;
  background-color: #0e2a5a;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.device-info-bar .info-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.device-info-bar .info-item .label {
  color: #a0cfff;
  margin-right: 8px;
}
.device-info-bar .info-item .value {
  color: #ffffff;
}


.tabs {
  display: flex;
  margin-bottom: 10px;
  border-bottom: 2px solid #1e4a8c;
}

.tab-button {
  background-color: transparent;
  color: #a0cfff;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  margin-right: 5px;
  border-radius: 4px 4px 0 0;
}

.tab-button.active {
  background-color: #1e4a8c;
  color: white;
  font-weight: bold;
}

.tab-button:hover:not(.active) {
  background-color: #153e7a;
}

.tab-content {
  background-color: #0e2a5a;
  padding: 15px;
  border-radius: 4px;
  flex-grow: 1;
}


.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 14px;
}

.toolbar label {
  margin-right: 8px;
  color: #a0cfff;
}

.toolbar input[type="text"] {
  background-color: #071a3b;
  border: 1px solid #1e4a8c;
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  margin-right: 5px;
  width: 150px;
}
.toolbar input[type="text"]::placeholder {
  color: #77a0cc;
}

.filter-select {
  background-color: #071a3b;
  border: 1px solid #1e4a8c;
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  margin-right: 5px;
  min-width: 120px;
}

.filter-select option {
  background-color: #071a3b;
  color: white;
}

.toolbar span {
  margin: 0 5px;
}

.action-button {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
  font-size: 14px;
}

.action-button:hover {
  background-color: #40a9ff;
}

.view-toggle {
  margin-left: auto;
}

.toggle-button {
  background-color: #071a3b;
  color: #a0cfff;
  border: 1px solid #1e4a8c;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
}

.toggle-button.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.toggle-button:first-child {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.toggle-button:last-child {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  border-left: none;
}


.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th,
.data-table td {
  border: 1px solid #1e4a8c;
  padding: 8px 10px;
  text-align: center;
}

.data-table th {
  background-color: #10306a;
  color: #a0cfff;
  font-weight: normal;
}

.data-table tbody tr:nth-child(odd) {
  background-color: #0c2552;
}
.data-table tbody tr:nth-child(even) {
  background-color: #0e2a5a;
}

.data-table tbody tr:hover {
  background-color: #153e7a;
}

.level-1-alert {
  color: #ff4d4f !important; /* Red for Level 1 Alert */
  font-weight: bold;
}

.level-2-alert {
  color: #faad14 !important; /* Orange for Level 2 Alert */
  font-weight: bold;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
}

.pagination button {
  background-color: #071a3b;
  color: #a0cfff;
  border: 1px solid #1e4a8c;
  padding: 6px 10px;
  margin: 0 3px;
  cursor: pointer;
  border-radius: 3px;
}

.pagination button:hover,
.pagination button.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.legend-tooltip {
  background-color: #0a214d; /* Match panel background, or slightly different */
  border: 1px solid #1e4a8c;
  padding: 10px;
  margin-top: 15px;
  border-radius: 4px;
  font-size: 12px;
  color: #a0cfff;
}

.legend-tooltip p {
  margin: 5px 0;
  line-height: 1.4;
}


.info-tab {
  /* Styles for basic info tab */
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two columns */
  gap: 15px; /* Space between grid items */
  font-size: 14px;
}

.info-field {
  display: flex;
  /* align-items: center; */
}

.info-field .label {
  width: 100px; /* Adjust as needed for label alignment */
  color: #a0cfff;
  margin-right: 10px;
  flex-shrink: 0;
}

.info-field .value {
  color: #ffffff;
  word-break: break-all; /* Prevent long text from overflowing */
}

.info-field.full-width {
  grid-column: span 2; /* Make this field span both columns */
}

.alerts-tab {
  /* Styles for alerts history tab */
}

/* Ensure scrollbar visibility if content overflows */
.tab-content::-webkit-scrollbar {
  width: 8px;
}

.tab-content::-webkit-scrollbar-track {
  background: #071a3b;
  border-radius: 4px;
}

.tab-content::-webkit-scrollbar-thumb {
  background: #1e4a8c;
  border-radius: 4px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: #2a5f9a;
}

.panel-content::-webkit-scrollbar {
  width: 8px;
}
.panel-content::-webkit-scrollbar-track {
  background: #071a3b;
  border-radius: 4px;
}
.panel-content::-webkit-scrollbar-thumb {
  background: #1e4a8c;
  border-radius: 4px;
}
.panel-content::-webkit-scrollbar-thumb:hover {
  background: #2a5f9a;
}

/* DisplacementTable 深色主题样式 - 限定在此组件内 */
.displacement-monitor-panel .displacement-table-container {
    .el-table {
      font-size: 14px;
      background-color: #0e2a5a !important;
      color: white !important;
      
      /* 表头样式 */
      :deep(.el-table__header-wrapper) {
        background-color: #10306a !important;
        
        .el-table__header {
          background-color: #10306a !important;
          
          th {
            background-color: #10306a !important;
            color: #a0cfff !important;
            border-bottom: 1px solid #1e4a8c !important;
            border-right: 1px solid #1e4a8c !important;
          }
        }
      }
      
      /* 表体样式 */
      :deep(.el-table__body-wrapper) {
        background-color: #0e2a5a !important;
        
        .el-table__body {
          background-color: #0e2a5a !important;
          
          tr {
            background-color: #0e2a5a !important;
            
            &.el-table__row--striped {
              background-color: #0c2552 !important;
            }
            
            &:hover {
              background-color: #153e7a !important;
            }
            
            td {
              background-color: transparent !important;
              color: white !important;
              border-bottom: 1px solid #1e4a8c !important;
              border-right: 1px solid #1e4a8c !important;
            }
          }
        }
      }
      
      /* 空数据样式 */
      :deep(.el-table__empty-block) {
        background-color: #0e2a5a !important;
        color: #a0cfff !important;
      }
      
      /* 加载样式 */
      :deep(.el-loading-mask) {
        background-color: rgba(14, 42, 90, 0.8) !important;
      }
    }
    
    /* 分页样式 */
    .pagination-container {
      :deep(.el-pagination) {
        .el-pagination__total {
          color: #a0cfff !important;
        }
        
        .btn-prev,
        .btn-next {
          background-color: #071a3b !important;
          color: #a0cfff !important;
          border: 1px solid #1e4a8c !important;
          
          &:hover {
            background-color: #1890ff !important;
            color: white !important;
            border-color: #1890ff !important;
          }
          
          &.disabled {
            background-color: #071a3b !important;
            color: #666 !important;
            border-color: #1e4a8c !important;
          }
        }
        
        .el-pager {
          li {
            background-color: #071a3b !important;
            color: #a0cfff !important;
            border: 1px solid #1e4a8c !important;
            margin: 0 2px !important;
            
            &:hover {
              background-color: #1890ff !important;
              color: white !important;
              border-color: #1890ff !important;
            }
            
            &.is-active {
              background-color: #1890ff !important;
              color: white !important;
              border-color: #1890ff !important;
            }
          }
        }
        
        .el-pagination__jump {
          color: #a0cfff !important;
          
          .el-input {
            :deep(.el-input__wrapper) {
              background-color: #071a3b !important;
              border: 1px solid #1e4a8c !important;
              
              .el-input__inner {
                background-color: transparent !important;
                color: white !important;
              }
            }
          }
        }
        
        .el-select {
          :deep(.el-input) {
            .el-input__wrapper {
              background-color: #071a3b !important;
              border: 1px solid #1e4a8c !important;
              
              .el-input__inner {
                background-color: transparent !important;
                color: white !important;
              }
              
              .el-input__suffix {
                .el-input__suffix-inner {
                  .el-select__caret {
                    color: #a0cfff !important;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
</style>