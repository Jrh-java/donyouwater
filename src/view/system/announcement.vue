<template>
  <div class="announcement-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="公告标题">
          <el-input
            v-model="searchForm.noticeTitle"
            placeholder="请输入公告标题"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="公告类型">
          <el-select
            v-model="searchForm.noticeType"
            placeholder="请选择公告类型"
            :teleported="false"
            clearable
            style="width: 150px"
          >
            <el-option label="通知" value="1" />
            <el-option label="公告" value="2" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="searchForm.pushStartTime"
            type="datetime"
            placeholder="开始时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            :teleported="false"
            style="width: 180px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-date-picker
            v-model="searchForm.pushEndTime"
            type="datetime"
            placeholder="结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            :teleported="false"
            style="width: 180px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 操作按钮区域 -->
    <div class="action-section">
      <el-button type="primary" @click="handleAdd">
        + 添加公告
      </el-button>
      <el-button
        type="danger"
        :disabled="selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        批量删除
      </el-button>
    </div>
    
    <!-- 表格区域 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column
          prop="noticeTitle"
          label="公告标题"
          min-width="200"
    
        />
        
        <el-table-column
          prop="noticeType"
          label="公告类型"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="row.noticeType === '1' ? 'primary' : 'success'">
              {{ row.noticeType === '1' ? '通知' : '公告' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="crtTime"
          label="发布时间"
          width="180"
          align="center"
        />
        
        <el-table-column
          prop="crtName"
          label="发布人员"
          width="120"
          align="center"
        />
        
        <el-table-column
          label="操作"
          width="180"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="text"
              @click="handleDetail(row)"
            >
              详情
            </el-button>
            <el-button
              type="text"
              style="color: #f56c6c"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 分页区域 -->
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 添加公告弹窗 -->
    <AddAnnouncementDialog
      v-model="showAddDialog"
      @success="handleAddSuccess"
    />
    
    <!-- 公告详情弹窗 -->
    <AnnouncementDetailDialog
      v-model="showDetailDialog"
      :announcement-id="currentAnnouncementId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getAnnouncementPageApi,
  deleteAnnouncementApi,
  AnnouncementItem
} from '@/api/announcement';
import AddAnnouncementDialog from './announcementComp/AddAnnouncementDialog.vue';
import AnnouncementDetailDialog from './announcementComp/AnnouncementDetailDialog.vue';

// 搜索表单
const searchForm = reactive({
  noticeTitle: '',
  noticeType: '',
  pushStartTime: '',
  pushEndTime: ''
});

// 分页信息
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
});

// 表格数据
const tableData = ref<AnnouncementItem[]>([]);
const loading = ref(false);
const selectedIds = ref<string[]>([]);

// 弹窗控制
const showAddDialog = ref(false);
const showDetailDialog = ref(false);
const currentAnnouncementId = ref('');

// 获取公告列表
const fetchAnnouncementList = async () => {
  try {
    loading.value = true;
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    };
    
    const response = await getAnnouncementPageApi(params);
    tableData.value = response.list;
    pagination.total = response.totalCount;
  } catch (error) {
    console.error('获取公告列表失败:', error);
    ElMessage.error('获取公告列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchAnnouncementList();
};

// 重置搜索
const handleReset = () => {
  searchForm.noticeTitle = '';
  searchForm.noticeType = '';
  searchForm.pushStartTime = '';
  searchForm.pushEndTime = '';
  pagination.page = 1;
  fetchAnnouncementList();
};

// 添加公告
const handleAdd = () => {
  showAddDialog.value = true;
};

// 添加成功回调
const handleAddSuccess = () => {
  fetchAnnouncementList();
};

// 查看详情
const handleDetail = (row: AnnouncementItem) => {
  currentAnnouncementId.value = row.id;
  showDetailDialog.value = true;
};



// 删除公告
const handleDelete = async (row: AnnouncementItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除公告"${row.noticeTitle}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        lockScroll: false
      }
    );
    
    await deleteAnnouncementApi([row.id]);
    ElMessage.success('删除成功');
    fetchAnnouncementList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除公告失败:', error);
      ElMessage.error('删除公告失败');
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 条公告吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        lockScroll: false
      }
    );
    
    await deleteAnnouncementApi(selectedIds.value);
    ElMessage.success('批量删除成功');
    selectedIds.value = [];
    fetchAnnouncementList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error);
      ElMessage.error('批量删除失败');
    }
  }
};

// 表格选择变化
const handleSelectionChange = (selection: AnnouncementItem[]) => {
  selectedIds.value = selection.map(item => item.id);
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.limit = size;
  pagination.page = 1;
  fetchAnnouncementList();
};

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page;
  fetchAnnouncementList();
};

// 组件挂载时获取数据
onMounted(() => {
  fetchAnnouncementList();
});
</script>

<style scoped lang="scss">
.announcement-container {
  padding: 20px;
  background-color: #fff;
  
  .search-section {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 6px;
    margin-bottom: 20px;
  }
  
  .action-section {
    margin-bottom: 20px;
  }
  
  .table-section {
    margin-bottom: 20px;
  }
  
  .pagination-section {
    display: flex;
    justify-content: flex-end;
  }
}
</style>