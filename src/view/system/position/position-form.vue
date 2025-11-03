<!--
  * 职务表
  *
  * @Author:    kaiyun
  * @Date:      2024-06-23 23:31:38
  * @Copyright  <a href="https://1024lab.net">1024创新实验室</a>
-->
<template>
  <el-dialog
    :title="form.positionId ? '编辑' : '添加'"
    v-model="visibleFlag"
    width="600px"
    :close-on-click-modal="false"
    destroy-on-close
    :lock-scroll="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="职务名称" prop="positionName">
        <el-input v-model="form.positionName" placeholder="职务名称" />
      </el-form-item>
      <el-form-item label="职级" prop="level">
        <el-input v-model="form.level" placeholder="职级" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" :step="1" :precision="0" placeholder="排序" style="width: 100%" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" placeholder="备注" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
  import { reactive, ref, nextTick } from 'vue';
  import _ from 'lodash';
  import { ElMessage } from 'element-plus';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { positionApi } from '/@/api/system/position-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  // ------------------------ 事件 ------------------------

  const emits = defineEmits(['reloadList']);

  // ------------------------ 显示与隐藏 ------------------------
  // 是否显示
  const visibleFlag = ref(false);

  function show(rowData) {
    Object.assign(form, formDefault);
    if (rowData && !_.isEmpty(rowData)) {
      Object.assign(form, rowData);
    }
    visibleFlag.value = true;
    nextTick(() => {
      formRef.value.clearValidate();
    });
  }

  function onClose() {
    Object.assign(form, formDefault);
    visibleFlag.value = false;
  }

  // ------------------------ 表单 ------------------------

  // 组件ref
  const formRef = ref();

  const formDefault = {
    positionId: undefined,
    positionName: undefined, //职务名称
    level: undefined, //职纪
    sort: 0,
    remark: undefined, //备注
  };

  let form = reactive({ ...formDefault });

  const rules = {
    positionName: [{ required: true, message: '请输入职务名称', trigger: 'blur' }],
  };

  // 点击确定，验证表单
  async function onSubmit() {
    try {
      await formRef.value.validate();
      save();
    } catch (err) {
      ElMessage.error('参数验证错误，请仔细填写表单数据!');
    }
  }

  // 新建、编辑API
  async function save() {
    SmartLoading.show();
    try {
      if (form.positionId) {
        await positionApi.update(form);
      } else {
        await positionApi.add(form);
      }
      ElMessage.success('操作成功');
      emits('reloadList');
      onClose();
    } catch (err) {
      smartSentry.captureError(err);
    } finally {
      SmartLoading.hide();
    }
  }

  defineExpose({
    show,
  });
</script>
