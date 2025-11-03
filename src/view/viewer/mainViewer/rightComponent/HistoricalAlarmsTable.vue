<template>
  <div class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>历史告警记录</h3>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      
      <div class="filter-section">
        <div class="filter-item">
          <label>告警时间</label>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
             
            value-format="YYYY-MM-DD"
            :teleported="false"
            @change="handleDateRangeChange"
          />
        </div>
        <div class="filter-item">
          <label>所属大坝</label>
          <el-select v-model="filters.dam" placeholder="全部"   clearable :teleported="false">
            <el-option label="AA水库" value="AA水库"></el-option>
            <el-option label="BB水库" value="BB水库"></el-option>
            <el-option label="CC水库" value="CC水库"></el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <label>告警类型</label>
          <el-select v-model="filters.type" placeholder="全部"   clearable :teleported="false">
            <el-option label="损伤识别告警" value="损伤识别告警"></el-option>
            <el-option label="渗流监测告警" value="渗流监测告警"></el-option>
            <el-option label="变形监测告警" value="变形监测告警"></el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <label>处理状态</label>
          <el-select v-model="filters.status" placeholder="全部"   clearable :teleported="false">
            <el-option label="已处理" value="已处理"></el-option>
            <el-option label="未处理" value="未处理"></el-option>
          </el-select>
        </div>
        <el-button type="primary"   @click="applyFilters" class="search-button">查询</el-button>
        <el-button   @click="resetFilters" class="reset-button">重置</el-button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>告警编号</th>
              <th>所属大坝</th>
              <th>告警位置</th>
              <th>告警时间</th>
              <th>告警类型</th>
              <th>告警级别</th>
              <th>处理状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(alarm, index) in paginatedAlarms" :key="alarm.id">
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>{{ alarm.id }}</td>
              <td>{{ alarm.dam }}</td>
              <td>{{ alarm.location }}</td>
              <td>{{ alarm.time }}</td>
              <td>{{ alarm.type }}</td>
              <td>
                <span class="alarm-level" :class="'level-' + alarm.level">
                  {{ alarm.level === 1 ? 'I' : alarm.level === 2 ? 'II' : 'III' }}
                </span>
              </td>
              <td>
                <span class="status-tag" :class="{ 'processed': alarm.status === '已处理' }">
                  {{ alarm.status }}
                </span>
              </td>
              <td>
                <el-button type="primary" link   @click="showAlarmDetail(alarm.id)">详情</el-button>
              </td>
            </tr>
            <tr v-if="paginatedAlarms.length === 0">
              <td colspan="9" class="no-data">暂无符合条件的告警记录</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <div class="page-info">
          共 {{ totalAlarms }} 条记录，每页 {{ pageSize }} 条，共 {{ totalPages }} 页
        </div>
        <div class="page-controls">
          <el-button :disabled="currentPage === 1" @click="goToPage(1)"  >首页</el-button>
          <el-button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)"  >上一页</el-button>
          <span class="page-number">
            <el-input-number v-model="currentPage" :min="1" :max="totalPages"   controls-position="right" @change="goToPage"></el-input-number>
             / {{ totalPages }}
          </span>
          <el-button :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)"  >下一页</el-button>
          <el-button :disabled="currentPage === totalPages" @click="goToPage(totalPages)"  >末页</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

// 接收props
const props = defineProps<{
  show: boolean;
}>();

// 定义事件
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'show-detail', alarmId: number): void;
}>();

// 关闭弹窗
const closeModal = () => {
  emit('close');
};

// 查看详情
const showAlarmDetail = (alarmId: number) => {
  emit('show-detail', alarmId);
  closeModal(); // 打开详情的同时关闭当前弹窗
};

// 筛选条件
const filters = ref({
  startDate: '',
  endDate: '',
  dam: '',
  type: '',
  status: ''
});
const dateRange = ref<[string, string] | null>(null);

const handleDateRangeChange = (newRange: [string, string] | null) => {
  if (newRange && newRange.length === 2) {
    filters.value.startDate = newRange[0];
    filters.value.endDate = newRange[1];
  } else {
    filters.value.startDate = '';
    filters.value.endDate = '';
  }
};

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);

// 模拟告警数据
const alarms = ref([
  { id: 21110001, dam: 'AA水库', location: '大坝左坝肩', time: '2025-05-02 12:11:02', type: '损伤识别告警', level: 1, status: '已处理' },
  { id: 21110002, dam: 'BB水库', location: '大坝溢洪道', time: '2025-05-02 12:15:30', type: '渗流监测告警', level: 2, status: '未处理' },
  { id: 21110003, dam: 'AA水库', location: '大坝右坝肩', time: '2025-05-03 08:22:15', type: '损伤识别告警', level: 1, status: '已处理' },
  { id: 21110004, dam: 'CC水库', location: '大坝坝体', time: '2025-05-03 10:30:00', type: '变形监测告警', level: 3, status: '未处理' },
  { id: 21110005, dam: 'BB水库', location: '大坝进水口', time: '2025-05-03 14:05:22', type: '渗流监测告警', level: 2, status: '未处理' },
  { id: 21110006, dam: 'DD水库', location: '大坝左坝肩', time: '2025-05-04 09:17:38', type: '应力应变告警', level: 2, status: '已处理' },
  { id: 21110007, dam: 'AA水库', location: '大坝溢洪道', time: '2025-05-04 11:30:45', type: '损伤识别告警', level: 1, status: '未处理' },
  { id: 21110008, dam: 'BB水库', location: '大坝坝体', time: '2025-05-05 08:45:10', type: '渗流监测告警', level: 2, status: '已处理' },
  { id: 21110009, dam: 'CC水库', location: '大坝右坝肩', time: '2025-05-05 13:20:33', type: '变形监测告警', level: 3, status: '未处理' },
  { id: 21110010, dam: 'DD水库', location: '大坝进水口', time: '2025-05-06 10:05:27', type: '应力应变告警', level: 1, status: '已处理' },
  { id: 21110011, dam: 'AA水库', location: '大坝坝体', time: '2025-05-06 14:40:19', type: '损伤识别告警', level: 2, status: '未处理' },
  { id: 21110012, dam: 'BB水库', location: '大坝左坝肩', time: '2025-05-07 09:30:55', type: '渗流监测告警', level: 2, status: '已处理' }
]);

// 经过筛选后的告警数据
const filteredAlarms = computed(() => {
  return alarms.value.filter(alarm => {
    let match = true;
    
    // 按告警时间筛选
    if (filters.value.startDate && filters.value.endDate) {
      const alarmDate = new Date(alarm.time.split(' ')[0]);
      const startDate = new Date(filters.value.startDate);
      const endDate = new Date(filters.value.endDate);
      match = match && (alarmDate >= startDate && alarmDate <= endDate);
    }
    
    // 按所属大坝筛选
    if (filters.value.dam) {
      match = match && alarm.dam === filters.value.dam;
    }
    
    // 按告警类型筛选
    if (filters.value.type) {
      match = match && alarm.type === filters.value.type;
    }
    
    // 按处理状态筛选
    if (filters.value.status) {
      match = match && alarm.status === filters.value.status;
    }
    
    return match;
  });
});

// 总记录数和总页数
const totalAlarms = computed(() => filteredAlarms.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalAlarms.value / pageSize.value)));

// 当前页显示的数据
const paginatedAlarms = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredAlarms.value.slice(start, end);
});

// 跳转到指定页
const goToPage = (page: number) => {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value));
};

// 应用筛选条件
const applyFilters = () => {
  currentPage.value = 1; // 重置到第一页
};

// 重置筛选条件
const resetFilters = () => {
  filters.value = {
    startDate: '',
    endDate: '',
    dam: '',
    type: '',
    status: ''
  };
  dateRange.value = null; // 同时重置日期选择器的v-model
  currentPage.value = 1; // 重置到第一页
};

// 监听总页数变化，确保当前页不超出范围
watch(totalPages, (newTotalPages) => {
  if (currentPage.value > newTotalPages) {
    currentPage.value = newTotalPages;
  }
});

// 组件挂载时初始化当前日期范围为最近一个月
onMounted(() => {
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const endDateStr = now.toISOString().split('T')[0];
  const startDateStr = oneMonthAgo.toISOString().split('T')[0];
  
  filters.value.endDate = endDateStr;
  filters.value.startDate = startDateStr;
  dateRange.value = [startDateStr, endDateStr];
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.modal-content {
  background-color: rgba(11, 27, 51, 0.9);
  border: 1px solid #1E3F66;
  border-radius: 8px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #1E3F66;
}

.modal-header h3 {
  margin: 0;
  color: #00CFFF;
  font-size: 18px;
}

.close-button {
  background: transparent;
  border: none;
  color: #00CFFF;
  font-size: 24px;
  cursor: pointer;
}

.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 15px 20px;
  border-bottom: 1px solid #1E3F66;
  background-color: rgba(0, 66, 102, 0.2);
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-item label {
  margin-right: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.filter-section .el-select,
.filter-section .el-date-picker {
  min-width: 150px; /* 给el组件一个合适的宽度 */
  margin-right: 10px; /* 保持一些间距 */
}

.filter-section .el-button {
  margin-left: 10px;
}

.search-button,
.reset-button {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  /* margin-left: auto; */ /* 移除, ElButton会自动处理间距 */
}

.reset-button {
  background-color: transparent;
  color: #00CFFF;
  border: 1px solid #00CFFF;
  /* margin-left: 10px; */ /* 移除 */
}

.table-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
  max-height: calc(90vh - 180px);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
}

th, td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
}

th {
  background-color: rgba(0, 66, 102, 0.3);
  color: #00CFFF;
  font-weight: normal;
  position: sticky;
  top: 0;
  z-index: 1;
}

tbody tr:hover {
  background-color: rgba(0, 126, 153, 0.2);
}

.alarm-level {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  border-radius: 50%;
  color: white;
  font-weight: bold;
}

.level-1 {
  background-color: #FF4444; /* 红色 - I级 */
}

.level-2 {
  background-color: #FFA500; /* 橙色 - II级 */
}

.level-3 {
  background-color: #FFCC00; /* 黄色 - III级 */
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  background-color: #FF6B6B;
  color: white;
  font-size: 12px;
}

.status-tag.processed {
  background-color: #4CAF50;
}

.detail-btn {
  /* 使用 el-button[type=link] 后此样式可能不再需要 */
}

.no-data {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  padding: 20px 0;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #1E3F66;
  background-color: rgba(0, 66, 102, 0.2);
}

.page-info {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-controls .el-button {
   /* El-button 样式已通过 :deep() 或全局设置调整 */
}

.page-number {
  display: flex;
  align-items: center;
  gap: 5px;
  color: white;
}

.page-number .el-input-number {
  /* El-input-number 样式已通过 :deep() 或全局设置调整 */
}

/* 根据需要覆盖或调整el-select, el-date-picker的内部样式，使其与整体风格一致 */
.filter-section :deep(.el-select .el-input__wrapper),
.filter-section :deep(.el-date-editor.el-input__wrapper) {
  background-color: transparent !important;
  box-shadow: 0 0 0 1px #1E3F66 inset !important;
  border: none !important;
}

.filter-section :deep(.el-select__wrapper) {
  background-color: transparent !important;
}

.filter-section :deep(.el-select .el-input__inner),
.filter-section :deep(.el-date-editor .el-input__inner) {
  background-color: transparent !important;
  color: #E0F2F7 !important;
  border: none !important;
}

.filter-section :deep(.el-select .el-input__placeholder),
.filter-section :deep(.el-date-editor .el-input__placeholder) {
  color: rgba(224, 242, 247, 0.6) !important;
}

.filter-section :deep(.el-select__selected-item span),
.filter-section :deep(.el-select__placeholder span) {
  color: #fff !important;
}

.filter-section :deep(.el-select .el-select__caret),
.filter-section :deep(.el-select .el-select__suffix),
.filter-section :deep(.el-input__icon) {
  color: #00CFFF !important;
}

.filter-section :deep(.el-date-editor .el-range-separator) {
  color: rgba(255,255,255,0.7) !important;
}

/* 下拉框样式 */
.filter-section :deep(.el-select-dropdown) {
  background-color: rgba(11, 27, 51, 0.95) !important;
  border: 1px solid #1E3F66 !important;
}

.filter-section :deep(.el-select-dropdown .el-select-dropdown__item) {
  color: #E0F2F7 !important;
  background-color: transparent !important;
}

.filter-section :deep(.el-select-dropdown .el-select-dropdown__item.hover),
.filter-section :deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background-color: rgba(0, 126, 153, 0.3) !important;
  color: #E0F2F7 !important;
}

.filter-section :deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  color: #00CFFF !important;
  background-color: rgba(0, 207, 255, 0.1) !important;
}

/* 日期选择器弹出框样式 */
.filter-section :deep(.el-date-range-picker) {
  background-color: rgba(11, 27, 51, 0.95) !important;
  border: 1px solid #1E3F66 !important;
}

.filter-section :deep(.el-date-range-picker .el-date-range-picker__content) {
  background-color: transparent !important;
}

.filter-section :deep(.el-date-table td.available:hover),
.filter-section :deep(.el-date-table td.today) {
  background-color: rgba(0, 126, 153, 0.3) !important;
  color: #E0F2F7 !important;
}
</style> 