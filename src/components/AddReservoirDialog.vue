<template>
  <el-dialog v-model="dialogVisible" title="添加区域" width="1000px" :before-close="handleClose" destroy-on-close :lock-scroll="false">
    <div class="add-reservoir-container">
      <!-- 左侧Tab切换 -->
      <div class="left-tabs">
        <div v-for="tab in tabs" :key="tab.key" :class="['tab-item', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key">
          {{ tab.label }}
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="right-content">
        <!-- 基本信息 -->
        <div v-show="activeTab === 'basic'" class="tab-content">
          <el-form ref="basicFormRef" :model="basicForm" :rules="basicRules" label-width="120px" label-position="left">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="区域名称" prop="name" required>
                  <el-input v-model="basicForm.name" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="区域编码" prop="code" required>
                  <el-input v-model="basicForm.code" placeholder="请输入" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="区域类型" prop="type" required >
                  <el-select v-model="basicForm.type" placeholder="请选择" style="width: 100%" :teleported="false">
                    <el-option label="大(一)型" value="large_type_1" />
                    <el-option label="大(二)型" value="large_type_2" />
                    <el-option label="中型" value="middle_type" />
                    <el-option label="小(一)型" value="small_type_1" />
                    <el-option label="小(二)型" value="small_type_2" />
                  </el-select>
                </el-form-item>
              </el-col>




              <el-col :span="12">
                <el-form-item label="集水面积" prop="catchmentArea" required>
                  <el-input v-model="basicForm.catchmentArea" placeholder="请输入">
                    <template #append>km²</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="区域地址" prop="location" required>
                  <el-input v-model="basicForm.location" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="省份" prop="province" required>
                  <el-select v-model="basicForm.province" placeholder="请选择省份" style="width: 100%" :teleported="false" @change="onProvinceChange">
                    <el-option v-for="province in provinceList" :key="province.code" :label="province.name" :value="province.name" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="城市" prop="city" required>
                  <el-select v-model="basicForm.city" placeholder="请选择城市" style="width: 100%" :teleported="false" :disabled="!basicForm.province" @change="onCityChange">
                    <el-option v-for="city in cityList" :key="city.code" :label="city.name" :value="city.name" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="区县" prop="area" required>
                  <el-select v-model="basicForm.area" placeholder="请选择区县" style="width: 100%" :teleported="false" :disabled="!basicForm.city">
                    <el-option v-for="area in areaList" :key="area.code" :label="area.name" :value="area.name" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="乡镇" prop="town" required>
                  <el-input v-model="basicForm.town" placeholder="请输入乡镇" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="经度" prop="longitude" required>
                  <el-input v-model="basicForm.longitude" placeholder="请输入经度" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="纬度" prop="latitude" required>
                  <el-input v-model="basicForm.latitude" placeholder="请输入纬度" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="建设时间" prop="buildTime" required>
                  <el-date-picker v-model="basicForm.buildTime" type="datetime" placeholder="请选择" value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 100%" :teleported="false" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="管理单位" prop="manager" required>
                  <el-input v-model="basicForm.manager" placeholder="请输入" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="所属河流">
                  <el-input v-model="basicForm.river" placeholder="请输入" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="行政责任人" prop="adminResponsible" required>
                  <el-input v-model="basicForm.adminResponsible" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="技术责任人" prop="techResponsible" required>
                  <el-input v-model="basicForm.techResponsible" placeholder="请输入" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="巡查责任人" prop="inspectionResponsible" required>
                  <el-input v-model="basicForm.inspectionResponsible" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="工程档案" prop="projectArchive" required>
                  <div class="file-upload-container">
                    <el-upload
                      v-if="!basicForm.projectArchive"
                      class="file-upload"
                      :auto-upload="false"
                      :on-change="handleFileUpload"
                      :show-file-list="false"
                      accept=".pdf,.doc,.docx"
                    >
                      <el-button type="primary">选择文件</el-button>
                    </el-upload>
                    <div v-if="basicForm.projectArchive" class="uploaded-file">
                      <span class="file-name">
                        {{ basicForm.projectArchive.name }}
                      </span>
                      <el-button 
                        type="danger" 
                          
                        circle 
                        @click="removeFile"
                        class="remove-file-btn"
                      >
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="24">
                <el-form-item label="备注">
                  <el-input v-model="basicForm.remark" type="textarea" :rows="4" placeholder="请输入备注信息" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 大坝信息 -->
        <div v-show="activeTab === 'dam'" class="tab-content">
          <el-form ref="damFormRef" :model="damForm" :rules="damRules" label-width="120px" label-position="left">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="主坝高" prop="height" required>
                  <el-input v-model="damForm.height" placeholder="请输入">
                    <template #append>m</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="主坝长" prop="length" required>
                  <el-input v-model="damForm.length" placeholder="请输入">
                    <template #append>m</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row> <el-col :span="24"> <el-form-item label="主坝类型(按结构)" prop="structureType" required class="long-label-form-item"> <el-select
                    :teleported="false" v-model="damForm.structureType" placeholder="请选择" style="width: 100%"> <el-option label="重力坝"
                      value="重力坝" />
                    <el-option label="拱坝" value="拱坝" /> <el-option label="支墩坝" value="支墩坝" /> <el-option label="预应力坝"
                      value="预应力坝" /> </el-select> </el-form-item> </el-col> </el-row> <el-row :gutter="20"> <el-col
                :span="12">
                <el-form-item label="主坝类型(按材料)"> <el-select v-model="damForm.materialType" placeholder="请选择" :teleported="false"
                    style="width: 100%"> <el-option label="土石坝" value="土石坝" /> <el-option label="混凝土坝" value="混凝土坝" />
                    <el-option label="浆砌石坝" value="浆砌石坝" /> <el-option label="重力拱坝" value="重力拱坝" /> <el-option
                      label="拱坝" value="拱坝" /> </el-select> </el-form-item> </el-col> <el-col :span="12"> <el-form-item
                  label="多年平均径流量">
                  <el-input v-model="damForm.averageRunoff" placeholder="请输入"> <template #append>m³</template>
                  </el-input>
                </el-form-item> </el-col> </el-row> <el-row> <el-col :span="24"> <el-form-item label="主要泄洪建筑物型式" class="long-label-form-item">
                  <el-select v-model="damForm.spillwayType" placeholder="请选择" style="width: 100%" :teleported="false"> <el-option
                       label="坝顶溢流式" value="坝顶溢流式" /> <el-option label="大孔口溢流式" value="大孔口溢流式" /> <el-option label="坝身式"
                      value="坝身式" />
                    <el-option label="泄水隧洞" value="泄水隧洞" /> </el-select> </el-form-item> </el-col> </el-row>

            <el-row>
              <el-col :span="24">
                <el-form-item label="备注信息">
                  <el-input v-model="damForm.remark" type="textarea" :rows="4" placeholder="请输入备注信息" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 特征值 -->
        <div v-show="activeTab === 'features'" class="tab-content">
          <el-form ref="featuresFormRef" :model="featuresForm" :rules="featuresRules" label-width="120px"
            label-position="left">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="主汛期水位" prop="floodSeasonLevel" required>
                  <el-input v-model="featuresForm.floodSeasonLevel" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="时间范围" prop="floodSeasonTime" required>
                  <el-date-picker v-model="featuresForm.floodSeasonTime" type="datetimerange" placeholder="请选择"
                    style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss"  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="后汛期水位">
                  <el-input v-model="featuresForm.postFloodLevel" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="时间范围">
                  <el-date-picker v-model="featuresForm.postFloodTime" type="datetimerange" placeholder="请选择"
                    style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss" :teleported="true" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="死水位" prop="deadLevel" required>
                  <el-input v-model="featuresForm.deadLevel" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="死库容" prop="deadCapacity" required>
                  <el-input v-model="featuresForm.deadCapacity" placeholder="请输入">
                    <template #append>亿</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="正常蓄水位" prop="normalLevel" required>
                  <el-input v-model="featuresForm.normalLevel" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="兴利库容" prop="beneficialCapacity" required>
                  <el-input v-model="featuresForm.beneficialCapacity" placeholder="请输入">
                    <template #append>亿</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="防洪高水位" prop="floodControlLevel" required>
                  <el-input v-model="featuresForm.floodControlLevel" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="防洪库容" prop="floodControlCapacity" required>
                  <el-input v-model="featuresForm.floodControlCapacity" placeholder="请输入">
                    <template #append>亿</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="设计洪水位" prop="designFloodLevel" required>
                  <el-input v-model="featuresForm.designFloodLevel" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="校核洪水位" prop="checkFloodLevel" required>
                  <el-input v-model="featuresForm.checkFloodLevel" placeholder="请输入" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="坝顶高程" prop="damCrestElevation" required>
                  <el-input v-model="featuresForm.damCrestElevation" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="总库容" prop="totalCapacity" required>
                  <el-input v-model="featuresForm.totalCapacity" placeholder="请输入" >
                    <template #append>亿</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="历史最高水位">
                  <el-input v-model="featuresForm.historicalHighestLevel" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="出现时间">
                  <el-date-picker v-model="featuresForm.historicalHighestTime" type="datetime" placeholder="请选择"
                    style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss" :teleported="false" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="历史最大蓄水量">
                  <el-input v-model="featuresForm.historicalMaxStorage" placeholder="请输入">
                    <template #append>万方</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="出现时间">
                  <el-date-picker v-model="featuresForm.historicalMaxStorageTime" type="datetime" placeholder="请选择"
                    style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss" :teleported="false" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="历史最大入流">
                  <el-input v-model="featuresForm.historicalMaxInflow" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="出现时间">
                  <el-date-picker v-model="featuresForm.historicalMaxInflowTime" type="datetime" placeholder="请选择"
                    style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss" :teleported="false" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="历史最大出流">
                  <el-input v-model="featuresForm.historicalMaxOutflow" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="出现时间">
                  <el-date-picker v-model="featuresForm.historicalMaxOutflowTime" type="datetime" placeholder="请选择"
                    style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss" :teleported="false" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="历史最低库水位">
                  <el-input v-model="featuresForm.historicalLowestLevel" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="出现时间">
                  <el-date-picker v-model="featuresForm.historicalLowestTime" type="datetime" placeholder="请选择"
                    style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss" :teleported="false" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="历史最小入流">
                  <el-input v-model="featuresForm.historicalMinInflow" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="出现时间">
                  <el-date-picker v-model="featuresForm.historicalMinInflowTime" type="datetime" placeholder="请选择"
                    style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss" :teleported="false" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 调度原则 -->
        <div v-show="activeTab === 'dispatch'" class="tab-content">
          <el-form ref="dispatchFormRef" :model="dispatchForm" :rules="dispatchRules" label-width="120px"
            label-position="left">
            <el-form-item label="调度原则" prop="rules" required>
              <div class="dispatch-rules">
                <div v-for="(rule, index) in dispatchForm.rules" :key="index" class="rule-item">
                  <el-input v-model="rule.content" :placeholder="`规则${index + 1}`" class="rule-input" />
                  <el-button v-if="dispatchForm.rules.length > 1" type="danger"   circle
                    @click="removeRule(index)" class="remove-btn">
                    <el-icon>
                      <Minus />
                    </el-icon>
                  </el-button>
                </div>

                <div class="add-rule-btn" @click="addRule">
                  <el-icon>
                    <Plus />
                  </el-icon>
                  添加
                </div>
              </div>
            </el-form-item>

            <el-form-item label="备注信息">
              <el-input v-model="dispatchForm.remark" type="textarea" :rows="4" placeholder="请输入备注信息" />
            </el-form-item>
          </el-form>
        </div>

        <!-- 区域图片 -->
        <div v-show="activeTab === 'images'" class="tab-content">
          <div class="images-header">
            <span class="required-label">* 请至少上传一张区域图片</span>
          </div>
          <div class="image-container">
            <div v-if="imagesList.length === 0" class="no-images">
              <el-upload class="upload-demo" drag :auto-upload="false" :on-change="handleImageUpload" accept="image/*"
                multiple>
                <el-icon class="el-icon--upload">
                  <UploadFilled />
                </el-icon>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    只能上传jpg/png文件，且不超过500kb
                  </div>
                </template>
              </el-upload>
            </div>

            <div v-else class="image-viewer">
              <div class="main-image">
                <el-button class="upload-btn" type="primary" @click="triggerUpload">
                  <el-icon>
                    <Upload />
                  </el-icon>
                  上传
                </el-button>

                <div class="image-display"> <img :src="imagesList[currentImageIndex]?.url" alt="区域图片" /> <el-button
                    class="delete-image-btn" type="danger" circle @click="deleteCurrentImage"> <el-icon>
                      <Delete />
                    </el-icon> </el-button> <el-button v-if="imagesList.length > 1" class="nav-btn prev-btn" circle
                    @click="prevImage"> <el-icon>
                      <ArrowLeft />
                    </el-icon> </el-button> <el-button v-if="imagesList.length > 1" class="nav-btn next-btn" circle
                    @click="nextImage"> <el-icon>
                      <ArrowRight />
                    </el-icon> </el-button> </div>
              </div>

              <div class="thumbnail-list">
                <div v-for="(image, index) in imagesList" :key="index"
                  :class="['thumbnail', { active: index === currentImageIndex }]" @click="currentImageIndex = index">
                  <img :src="image.url" :alt="`缩略图${index + 1}`" />
                  <el-button 
                    class="delete-thumbnail-btn" 
                    type="danger" 
                      
                    circle 
                    @click.stop="deleteImageFromThumbnails(index)"
                  >
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
              </div>

              <!-- 隐藏的文件上传input -->
              <input ref="fileInputRef" type="file" accept="image/*" multiple style="display: none"
                @change="handleFileSelect" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, defineEmits, defineProps, watch,onMounted } from 'vue';
import { Plus, Minus, Upload, UploadFilled, ArrowLeft, ArrowRight, Close, Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { addReservoir } from '@/api/reservoir';
import { getProvinceList, getCityList, getAreaList } from '@/api/province';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['update:visible', 'success']);

// 弹窗显示状态
const dialogVisible = ref(props.visible);

// 监听props变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
});

// 监听弹窗状态变化
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal);
});

// Tab配置
const tabs = ref([
  { key: 'basic', label: '基本信息' },
  { key: 'dam', label: '大坝信息' },
  { key: 'features', label: '特征值' },
  { key: 'dispatch', label: '调度原则' },
  { key: 'images', label: '区域图片*' }
]);

// 当前激活的Tab
const activeTab = ref('basic');

// 省市区数据
const provinceList = ref([]);
const cityList = ref([]);
const areaList = ref([]);

// 基本信息表单数据
const basicForm = reactive({
  name: '',
  code: '',
  type: '',
  catchmentArea: '',
  location: '',
  province: '',
  city: '',
  area: '',
  town: '',
  buildTime: '',
  manager: '',
  river: '',
  adminResponsible: '',
  techResponsible: '',
  inspectionResponsible: '',
  projectArchive: null,
  remark: '',
  longitude: '',
  latitude: ''
});

// 大坝信息表单数据
const damForm = reactive({
  height: '',
  length: '',
  structureType: '',
  materialType: '',
  spillwayType: '',
  averageRunoff: '',
  remark: ''
});

// 特征值表单数据
const featuresForm = reactive({
  floodSeasonLevel: '',
  floodSeasonTime: '',
  postFloodLevel: '',
  postFloodTime: '',
  deadLevel: '',
  deadCapacity: '',
  normalLevel: '',
  beneficialCapacity: '',
  floodControlLevel: '',
  floodControlCapacity: '',
  designFloodLevel: '',
  checkFloodLevel: '',
  damCrestElevation: '',
  totalCapacity: '',
  historicalHighestLevel: '',
  historicalHighestTime: '',
  historicalMaxStorage: '',
  historicalMaxStorageTime: '',
  historicalMaxInflow: '',
  historicalMaxInflowTime: '',
  historicalMaxOutflow: '',
  historicalMaxOutflowTime: '',
  historicalLowestLevel: '',
  historicalLowestTime: '',
  historicalMinInflow: '',
  historicalMinInflowTime: ''
});

// 调度原则表单数据
const dispatchForm = reactive({
  rules: [{ content: '' }],
  remark: ''
});

// 图片列表
const imagesList = ref([]);
const currentImageIndex = ref(0);

// 表单验证规则
const basicRules = {
  name: [
    { required: true, message: '请输入区域名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入区域编码', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择区域类型', trigger: 'change' }
  ],
  catchmentArea: [
    { required: true, message: '请输入集水面积', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入区域地址', trigger: 'blur' }
  ],
  province: [
    { required: true, message: '请选择省份', trigger: 'change' }
  ],
  city: [
    { required: true, message: '请选择城市', trigger: 'change' }
  ],
  area: [
    { required: true, message: '请选择区县', trigger: 'change' }
  ],
  town: [
    { required: true, message: '请输入乡镇', trigger: 'blur' }
  ],
  longitude: [
    { required: true, message: '请输入经度', trigger: 'blur' },
    { 
      pattern: /^-?(\d{1,3}(\.\d+)?|180(\.0+)?)$/, 
      message: '请输入有效的经度值(-180到180)', 
      trigger: 'blur' 
    }
  ],
  latitude: [
    { required: true, message: '请输入纬度', trigger: 'blur' },
    { 
      pattern: /^-?(\d{1,2}(\.\d+)?|90(\.0+)?)$/, 
      message: '请输入有效的纬度值(-90到90)', 
      trigger: 'blur' 
    }
  ],
  buildTime: [
    { required: true, message: '请选择建设时间', trigger: 'change' }
  ],
  manager: [
    { required: true, message: '请输入管理单位', trigger: 'blur' }
  ],
  adminResponsible: [
    { required: true, message: '请输入行政责任人', trigger: 'blur' }
  ],
  techResponsible: [
    { required: true, message: '请输入技术责任人', trigger: 'blur' }
  ],
  inspectionResponsible: [
    { required: true, message: '请输入巡查责任人', trigger: 'blur' }
  ],
  projectArchive: [{ 
    required: true, 
    validator: (rule, value, callback) => { 
      if (!value || !value.content) { 
        callback(new Error('请选择工程档案')); 
      } else { 
        callback(); 
      } 
    }, 
    trigger: 'change' 
  }]
};

// 大坝信息验证规则
const damRules = {
  height: [
    { required: true, message: '请输入主坝高', trigger: 'blur' }
  ],
  length: [
    { required: true, message: '请输入主坝长', trigger: 'blur' }
  ],
  structureType: [
    { required: true, message: '请选择主坝类型(按结构)', trigger: 'change' }
  ]
};

// 特征值验证规则
const featuresRules = {
  floodSeasonLevel: [
    { required: true, message: '请输入主汛期水位', trigger: 'blur' }
  ],
  floodSeasonTime: [
    { required: true, message: '请选择时间范围', trigger: 'change' }
  ],
  deadLevel: [
    { required: true, message: '请输入死水位', trigger: 'blur' }
  ],
  deadCapacity: [
    { required: true, message: '请输入死库容', trigger: 'blur' }
  ],
  normalLevel: [
    { required: true, message: '请输入正常蓄水位', trigger: 'blur' }
  ],
  beneficialCapacity: [
    { required: true, message: '请输入兴利库容', trigger: 'blur' }
  ],
  floodControlLevel: [
    { required: true, message: '请输入防洪高水位', trigger: 'blur' }
  ],
  floodControlCapacity: [
    { required: true, message: '请输入防洪库容', trigger: 'blur' }
  ],
  designFloodLevel: [
    { required: true, message: '请输入设计洪水位', trigger: 'blur' }
  ],
  checkFloodLevel: [
    { required: true, message: '请输入校核洪水位', trigger: 'blur' }
  ],
  damCrestElevation: [
    { required: true, message: '请输入坝顶高程', trigger: 'blur' }
  ],
  totalCapacity: [
    { required: true, message: '请输入总库容', trigger: 'blur' }
  ]
};

// 调度原则验证规则
const dispatchRules = {
  rules: [
    { required: true, message: '请至少添加一条调度原则', trigger: 'blur' }
  ]
};

// 表单引用
const basicFormRef = ref();
const damFormRef = ref();
const featuresFormRef = ref();
const dispatchFormRef = ref();
const fileInputRef = ref();

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
};

// 加载省份数据
const loadProvinces = async () => {
  try {
    const res = await getProvinceList();
    provinceList.value = res || [];
  } catch (error) {
    console.error('加载省份数据失败:', error);
    ElMessage.error('加载省份数据失败');
  }
};

// 省份变化处理
const onProvinceChange = async (provinceName) => {
  // 清空城市和区县选择
  basicForm.city = '';
  basicForm.area = '';
  cityList.value = [];
  areaList.value = [];
  
  if (!provinceName) return;
  
  // 根据省份名称查找对应的code
  const province = provinceList.value.find(p => p.name === provinceName);
  if (!province) return;
  
  try {
    const res = await getCityList(province.code);
    cityList.value = res || [];
  } catch (error) {
    console.error('加载城市数据失败:', error);
    ElMessage.error('加载城市数据失败');
  }
};

// 城市变化处理
const onCityChange = async (cityName) => {
  // 清空区县选择
  basicForm.area = '';
  areaList.value = [];
  
  if (!cityName) return;
  
  // 根据城市名称查找对应的code
  const city = cityList.value.find(c => c.name === cityName);
  if (!city) return;
  
  try {
    const res = await getAreaList(city.code);
    areaList.value = res || [];
  } catch (error) {
    console.error('加载区县数据失败:', error);
    ElMessage.error('加载区县数据失败');
  }
};

// 取消操作
const handleCancel = () => {
  resetAllForms();
  handleClose();
};

// 重置所有表单
const resetAllForms = () => {
  // 重置基本信息
  Object.assign(basicForm, {
    name: '',
    code: '',
    type: '',
    catchmentArea: '',
    location: '',
    province: '',
    city: '',
    area: '',
    town: '',
    buildTime: '',
    manager: '',
    river: '',
    adminResponsible: '',
    techResponsible: '',
    inspectionResponsible: '',
    projectArchive: null,
    remark: '',
    longitude: '',
    latitude: ''
  });
  // 重置省市区数据
  cityList.value = [];
  areaList.value = [];
  // 重置大坝信息
  Object.assign(damForm, {
    height: '',
    length: '',
    structureType: '',
    materialType: '',
    spillwayType: '',
    averageRunoff: '',
    remark: ''
  });
  // 重置特征值
  Object.assign(featuresForm, {
    floodSeasonLevel: '',
    floodSeasonTime: '',
    postFloodLevel: '',
    postFloodTime: '',
    deadLevel: '',
    deadCapacity: '',
    normalLevel: '',
    beneficialCapacity: '',
    floodControlLevel: '',
    floodControlCapacity: '',
    designFloodLevel: '',
    checkFloodLevel: '',
    damCrestElevation: '',
    totalCapacity: '',
    historicalHighestLevel: '',
    historicalHighestTime: '',
    historicalMaxStorage: '',
    historicalMaxStorageTime: '',
    historicalMaxInflow: '',
    historicalMaxInflowTime: '',
    historicalMaxOutflow: '',
    historicalMaxOutflowTime: '',
    historicalLowestLevel: '',
    historicalLowestTime: '',
    historicalMinInflow: '',
    historicalMinInflowTime: ''
  });
  // 重置调度原则
  Object.assign(dispatchForm, {
    rules: [{ content: '' }],
    remark: ''
  });
  // 重置图片
  imagesList.value = [];
  currentImageIndex.value = 0;
  // 重置回第一个tab
  activeTab.value = 'basic';
};

// 组件挂载时加载省份数据
onMounted(() => {
  loadProvinces();
});

// 时间格式化函数
const formatDateTime = (dateValue) => {
  if (!dateValue) return null;
  
  // 如果已经是正确格式的字符串，直接返回
  if (typeof dateValue === 'string' && dateValue.includes(':')) {
    return dateValue;
  }
  
  let date;
  if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  } else {
    date = new Date(dateValue);
  }
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return null;
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 保存操作
const handleSave = async () => {
  try {
    // 验证所有表单
    const errorTabs = [];
    const tabKeyMap = {
      '基本信息': 'basic',
      '大坝信息': 'dam', 
      '特征值': 'features',
      '调度原则': 'dispatch',
      '区域图片': 'images'
    };
    
    // 验证基本信息
    try {
      await basicFormRef.value?.validate();
    } catch (error) {
      errorTabs.push('基本信息');
    }
    // 验证大坝信息
    try {
      await damFormRef.value?.validate();
    } catch (error) {
      errorTabs.push('大坝信息');
    }
    // 验证特征值
    try {
      await featuresFormRef.value?.validate();
    } catch (error) {
      errorTabs.push('特征值');
    }
    // 验证调度原则
    try {
      await dispatchFormRef.value?.validate();
    } catch (error) {
      errorTabs.push('调度原则');
    }
    
    // 验证区域图片
    if (imagesList.value.length === 0) {
      errorTabs.push('区域图片');
    }

    if (errorTabs.length > 0) {
      // 自动跳转到第一个有错误的表单页面
      const firstErrorTab = errorTabs[0];
      activeTab.value = tabKeyMap[firstErrorTab];
      
      ElMessage({
        message: `请完善以下页面的必填信息：${errorTabs.join('、')}`,
        type: 'warning',
        duration: 3000
      });
      return;
    }

    // 构建API请求数据
    const requestData = {
      reservoirName: basicForm.name,
      reservoirCode: basicForm.code,
      reservoirType: getReservoirTypeCode(basicForm.type),
      catchmentArea: parseFloat(basicForm.catchmentArea) || 0,
      address: basicForm.location,
      province: basicForm.province,
      city: basicForm.city,
      area: basicForm.area,
      town: basicForm.town,
      lonLat: `${basicForm.longitude},${basicForm.latitude}`,
      websiteCrtTime: formatDateTime(basicForm.buildTime),
      manageUnit: basicForm.manager,
      belongRiverCode: basicForm.river || '',
      belongRiverName: basicForm.river || '',
      administrativeResponsiblePerson: basicForm.adminResponsible,
      technicalResponsiblePerson: basicForm.techResponsible,
      patrolResponsiblePerson: basicForm.inspectionResponsible,
      remarks: basicForm.remark,

      reservoirDamInfoDTO: {
        mainDamHeight: parseFloat(damForm.height) || 0,
        mainDamLength: parseFloat(damForm.length) || 0,
        mainDamTypeStructure: damForm.structureType,
        mainDamTypeMaterial: damForm.materialType || '',
        mainTypesFloodDischargeStructures: getSpillwayTypeCode(damForm.spillwayType),
        annualAverageRunoff: parseFloat(damForm.averageRunoff) || 0,
        remarks: damForm.remark,
        reservoirManagementId: '' // 新增模式，不需要传入区域ID
      },

      reservoirEigenvalueInfoDTO: {
        mainFloodSeasonWaterLevel: featuresForm.floodSeasonLevel,
        mainSeasonWaterLevelStart: formatDateTime(featuresForm.floodSeasonTime?.[0]),
        mainSeasonWaterLevelEnd: formatDateTime(featuresForm.floodSeasonTime?.[1]),
        postFloodSeasonWaterLevel: featuresForm.postFloodLevel || '',
        postSeasonWaterLevelStart: formatDateTime(featuresForm.postFloodTime?.[0]),
        postSeasonWaterLevelEnd: formatDateTime(featuresForm.postFloodTime?.[1]),
        deadWaterLevel: featuresForm.deadLevel,
        deadStorageCapacity: featuresForm.deadCapacity,
        normalStorageLevel: featuresForm.normalLevel,
        utilizableCapacity: featuresForm.beneficialCapacity,
        floodControlHighWaterLevel: featuresForm.floodControlLevel,
        floodControlStorageCapacity: featuresForm.floodControlCapacity,
        designFloodLevel: featuresForm.designFloodLevel,
        checkFloodLevel: featuresForm.checkFloodLevel,
        damCrestElevation: featuresForm.damCrestElevation,
        totalStorageCapacity: featuresForm.totalCapacity || '',
        // 历史数据字段 - 使用正确的字段名
        highestLevelRecords: featuresForm.historicalHighestLevel || '',
        highestAppearanceTime: formatDateTime(featuresForm.historicalHighestTime),
        maximumStorage: featuresForm.historicalMaxStorage || '',
        maximumStorageTime: formatDateTime(featuresForm.historicalMaxStorageTime),
        maximumInflow: featuresForm.historicalMaxInflow || '',
        maximumInflowTime: formatDateTime(featuresForm.historicalMaxInflowTime),
        maximumOutflow: featuresForm.historicalMaxOutflow || '',
        maximumOutflowTime: formatDateTime(featuresForm.historicalMaxOutflowTime),
        lowestReservoirLevel: featuresForm.historicalLowestLevel || '',
        lowestAppearanceTime: formatDateTime(featuresForm.historicalLowestTime),
        historicalMinimumDailyInflow: featuresForm.historicalMinInflow || '',
        dailyInflowAppearanceTime: formatDateTime(featuresForm.historicalMinInflowTime),
        reservoirManagementId: '' // 新增模式，不需要传入区域ID
      },

      // 修改调度原则结构 - 改为数组格式，支持多个原则
      reservoirSchedulingPrincipleInfoDTOS: dispatchForm.rules
        .filter(rule => rule.content.trim())
        .map(rule => ({
          schedulingPrincipleName: rule.content.trim(),
          remarks: dispatchForm.remark
        }))
    };

    // 处理工程档案
    requestData.engineeringDoc = basicForm.projectArchive?.content || '';

    // 处理图片信息
    requestData.reservoirFilePicInfoDTOS = imagesList.value.map(item => ({
      file: item.url
    }));

    // 调用API
    await addReservoir(requestData);

    // 显示成功提示
    ElMessage({
      message: '新增区域成功！',
      type: 'success',
      duration: 2000
    });

    // 发出成功事件，让父组件处理后续逻辑
    emit('success');

    // 清空表单并关闭弹窗
    resetAllForms();
    handleClose();

  } catch (error) {
    console.error('保存区域信息失败:', error);
    ElMessage({
      message: error.message || '保存失败，请重试',
      type: 'error',
      duration: 3000
    });
  }
};

// 调度原则相关方法
const addRule = () => {
  dispatchForm.rules.push({ content: '' });
};

const removeRule = (index) => {
  if (dispatchForm.rules.length > 1) {
    dispatchForm.rules.splice(index, 1);
  }
};

// 图片上传相关方法
const handleImageUpload = async (file) => {
  try {
    const base64Url = await fileToBase64(file.raw);
    const newImage = {
      url: base64Url, // 存储base64格式
      name: file.name,
      file: file.raw
    };
    imagesList.value.push(newImage);
    if (imagesList.value.length === 1) {
      currentImageIndex.value = 0;
    }
  } catch (error) {
    console.error('图片转换失败:', error);
    ElMessage.error('图片处理失败，请重试');
  }
};

const triggerUpload = () => {
  fileInputRef.value.click();
};

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files);
  
  for (const file of files) {
    try {
      const base64Url = await fileToBase64(file);
      const newImage = {
        url: base64Url, // 存储base64格式
        name: file.name,
        file: file
      };
      imagesList.value.push(newImage);
    } catch (error) {
      console.error('图片转换失败:', error);
      ElMessage.error(`图片 ${file.name} 处理失败`);
    }
  }
  
  event.target.value = ''; // 清空文件选择
};

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  } else {
    currentImageIndex.value = imagesList.value.length - 1;
  }
};

const nextImage = () => {
  if (currentImageIndex.value < imagesList.value.length - 1) {
    currentImageIndex.value++;
  } else {
    currentImageIndex.value = 0;
  }
};

// 文件转base64函数
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);  // 返回完整的 Data URL
    reader.onerror = error => reject(error);
  });
};

// 处理文件上传
const handleFileUpload = async (file) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const fileName = file.name.toLowerCase();
  const isValidType = allowedTypes.some(type => fileName.endsWith(type));

  if (!isValidType) {
    ElMessage({
      message: '只能上传PDF、Word格式的文件！',
      type: 'error'
    });
    return;
  }

  try {
    const dataUrl = await fileToBase64(file.raw);
    basicForm.projectArchive = {
      name: file.name,
      content: dataUrl  // 保存完整的 Data URL
    };
  } catch (error) {
    console.error('文件转换失败:', error);
    ElMessage.error('文件处理失败，请重试');
  }
};

// 移除文件
const removeFile = () => {
  basicForm.projectArchive = null;
};

// 删除当前大图
const deleteCurrentImage = () => {
  if (imagesList.value.length === 0) return;
  
  imagesList.value.splice(currentImageIndex.value, 1);
  if (imagesList.value.length === 0) {
    currentImageIndex.value = 0;
  } else if (currentImageIndex.value >= imagesList.value.length) {
    currentImageIndex.value = imagesList.value.length - 1;
  }
};

// 从缩略图删除图片
const deleteImageFromThumbnails = (index) => {
  imagesList.value.splice(index, 1);
  if (imagesList.value.length === 0) {
    currentImageIndex.value = 0;
  } else if (currentImageIndex.value >= imagesList.value.length) {
    currentImageIndex.value = imagesList.value.length - 1;
  } else if (currentImageIndex.value === index && index === imagesList.value.length) {
    // If the deleted image was the last one and also active, set current to new last one
    currentImageIndex.value = imagesList.value.length - 1;
  } else if (currentImageIndex.value > index) {
    // If an image before the active one is deleted, shift active index
    currentImageIndex.value--;
  }
};

// 区域类型映射函数
const getReservoirTypeCode = (type) => {
  const typeMap = {
    '大(一)型': 'A',
    '大(二)型': 'B', 
    '中型': 'C',
    '小(一)型': 'D',
    '小(二)型': 'E'
  };
  return typeMap[type] || type;
};

// 主要泄洪建筑物型式映射函数
const getSpillwayTypeCode = (type) => {
  const typeMap = {
    '坝顶溢流式': 'A',
    '大孔口溢流式': 'B',
    '坝身式': 'C',
    '泄水隧洞': 'D'
  };
  return typeMap[type] || type;
};
</script>

<style lang="scss" scoped>
.add-reservoir-container {
  display: flex;
  height: 600px;

  .left-tabs {
    width: 150px;
    border-right: 1px solid #e4e7ed;
    padding: 10px 0;

    .tab-item {
      padding: 12px 20px;
      cursor: pointer;
      transition: all 0.3s;
      border-left: 3px solid transparent;

      &:hover {
        background-color: #f5f7fa;
      }

      &.active {
        background-color: #ecf5ff;
        color: #409eff;
        border-left-color: #409eff;
      }
    }
  }

  .right-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }
}

.dialog-footer {
  text-align: right;
}

// 调度原则相关样式
.dispatch-rules {
  .rule-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    .rule-input {
      flex: 1;
      margin-right: 10px;
    }

    .remove-btn {
      flex-shrink: 0;
    }
  }

  .add-rule-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    border: 2px dashed #dcdfe6;
    border-radius: 6px;
    cursor: pointer;
    color: #409eff;
    background-color: #fafafa;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
      background-color: #ecf5ff;
    }

    .el-icon {
      margin-right: 5px;
    }
  }
}

// 图片相关样式
.image-container {
  height: 100%;

  .no-images {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
  }

  .image-viewer {
    height: 100%;

    .main-image {
      position: relative;
      height: 400px;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      overflow: hidden;

      .upload-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 10;
      }

      .image-display {
        width: 100%;
        height: 100%;
        position: relative;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 9;

          &.prev-btn {
            left: 10px;
          }

          &.next-btn {
            right: 10px;
          }
        }
      }
    }

    .thumbnail-list {
      display: flex;
      gap: 10px;
      margin-top: 15px;
      padding: 10px 0;
      overflow-x: auto;

      .thumbnail {
        width: 80px;
        height: 60px;
        border: 2px solid #dcdfe6;
        border-radius: 4px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;

        &:hover,
        &.active {
          border-color: #409eff;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .delete-thumbnail-btn {
          position: absolute;
          top: 2px;
          left: 2px;
          z-index: 11;
          padding: 3px;
          display: none;
        }

        &:hover .delete-thumbnail-btn {
          display: inline-flex;
        }
      }
    }
  }
}

:deep(.el-form-item__label) {
  font-weight: normal;
  color: #606266;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 4px;
}

:deep(.el-upload-dragger) {
  padding: 40px;
}

// Custom class for longer labels in dam form
.long-label-form-item :deep(.el-form-item__label) {
  flex-basis: 150px !important; // Adjust this value as needed
  width: 150px !important; // Ensure width is also set
  line-height: normal; // Allow natural line wrapping if it *still* overflows, though the goal is to prevent it
  white-space: normal; // Allow wrapping if truly necessary
}

// 文件上传相关样式
.file-upload-container {
  .file-upload {
    display: inline-block;
  }
  .uploaded-file {
    margin-top: 10px;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: #f5f7fa;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    .file-name {
      flex: 1;
      font-size: 14px;
      color: #606266;
      margin-right: 10px;
      word-break: break-all;
      
      &.file-downloadable {
        color: #409eff;
        cursor: pointer;
        text-decoration: underline;
        
        &:hover {
          color: #66b1ff;
        }
      }
    }
    .remove-file-btn {
      flex-shrink: 0;
    }
  }
}

// 图片删除按钮样式
.image-display {
  .delete-image-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 9;
  }
}

// 图片页面头部样式
.images-header {
  margin-bottom: 15px;
  padding: 10px 0;
  
  .required-label {
    color: #f56c6c;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>