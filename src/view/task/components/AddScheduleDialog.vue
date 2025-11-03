<template>
  <el-dialog
    :title="isEdit ? '编辑预案' : '添加预案'"
    v-model="visible"
    width="600px"
    :lock-scroll="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="预案名称" prop="planName">
        <el-input v-model="form.planName" placeholder="请输入预案名称" />
      </el-form-item>
      <el-form-item label="预案分类" prop="planType">
        <el-select v-model="form.planType" placeholder="请选择预案分类" style="width: 100%" :teleported="false">
          <el-option label="调度方案" value="1" />
          <el-option label="应急预案" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="版本编号" prop="versionNum">
        <el-input v-model="form.versionNum" placeholder="请输入版本编号" />
      </el-form-item>
      <el-form-item label="编制部门" prop="deptId">
        <el-input v-model="form.deptName" placeholder="请输入编制部门" />
      </el-form-item>
      <el-form-item label="备注" prop="remarks">
        <el-input type="textarea" v-model="form.remarks" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="附件上传">
        <el-upload
          action="#"
          :http-request="handleUpload"
          :on-remove="handleRemove"
          :file-list="fileList"
          :limit="1"
        >
          <el-button>点击上传</el-button>
        </el-upload>
 
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { getPlanDetail, addPlan, updatePlan } from '@/api/plan'
import { uploadFileWithPermanentUrl, deleteFile } from '@/api/device'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  isEdit: Boolean,
  editData: Object
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref()
const form = reactive({
  id: '',
  planName: '',
  planType: '',
  versionNum: '',
  deptId: '1',
  deptName: '工程部',
  file: '',
  remarks: ''
})
const fileList = ref<any[]>([])
const uploadedFile = ref<any>(null)

const rules = {
  planName: [{ required: true, message: '请输入预案名称', trigger: 'blur' }],
  planType: [{ required: true, message: '请选择预案分类', trigger: 'change' }],
  versionNum: [{ required: true, message: '请输入版本编号', trigger: 'blur' }],
  deptId: [{ required: true, message: '请输入编制部门', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.isEdit && props.editData) {
      fetchPlanDetail(props.editData.id)
    } else {
      nextTick(() => {
        resetForm()
      })
    }
  }
})

async function fetchPlanDetail(id: string) {
  try {
    const res = await getPlanDetail(id)
    Object.assign(form, res)
    if (res.file) {
      const fileName = res.file.split('/').pop()
      fileList.value = [{ name: fileName, url: res.file }]
    }
  } catch (error) {
    ElMessage.error('获取预案详情失败')
  }
}

function resetForm() {
  formRef.value?.resetFields()
  fileList.value = []
}

function handleClose() {
  visible.value = false
}

async function handleConfirm() {
  await formRef.value.validate()
  if (!form.file) {
    ElMessage.error('请上传附件')
    return
  }
  try {
    const params = {
      ...form
    }
    if (props.isEdit) {
      await updatePlan(params)
      ElMessage.success('更新成功')
    } else {
      const { id, ...addData } = params
      await addPlan(addData)
      ElMessage.success('新增成功')
    }
    emit('confirm')
    handleClose()
  } catch (error) {
    ElMessage.error(props.isEdit ? '更新失败' : '新增失败')
  }
}

async function handleUpload(options: any) {
  const formData = new FormData()
  formData.append('bucket', 'reservoir')
  formData.append('uploadfile', options.file)
  try {
    const res: any = await uploadFileWithPermanentUrl(formData)
    form.file = res.accessUrl
    uploadedFile.value = { name: res.objectName, url: res.accessUrl, id: res.id }
    fileList.value = [uploadedFile.value]
    ElMessage.success('上传成功')
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

async function handleRemove() {
  if (uploadedFile.value) {
    try {
      await deleteFile({ bucket: 'reservoir', objectName: uploadedFile.value.name })
      form.file = ''
      fileList.value = []
      uploadedFile.value = null
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败')
    }
  } else {
    form.file = ''
    fileList.value = []
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

.upload-demo {
  width: 100%;
}

.el-upload__tip {
  margin-top: 8px;
  color: #999;
  font-size: 12px;
}
.file-info {
  display: flex;
  align-items: center;
  margin-left: 12px;
}

.delete-icon {
  margin-left: 8px;
  cursor: pointer;
}
</style>