<template>
  <div class="change-password-container">
    <h2>修改密码</h2>
    <el-form :model="form" ref="formRef" label-width="100px">
      <el-form-item label="手机号">
        <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
      </el-form-item>
      <el-form-item label="验证码">
        <el-input v-model="form.verificationCode" placeholder="请输入验证码"></el-input>
        <el-button @click="getVerificationCode">获取验证码</el-button>
      </el-form-item>
      <el-form-item label="新密码">
        <el-input type="password" v-model="form.newPassword" placeholder="请输入新密码"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="goBack">返回首页</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();

const form = ref({
  phone: '',
  verificationCode: '',
  newPassword: ''
});

const formRef = ref(null);

const getVerificationCode = () => {
  // 模拟获取验证码
  ElMessage.success('验证码已发送');
};

const submitForm = () => {
  if (!form.value.phone || !form.value.verificationCode || !form.value.newPassword) {
    ElMessage.warning('请填写完整信息');
    return;
  }
  // 模拟提交表单
  ElMessage.success('密码修改成功');
  router.push('/main');
};

const goBack = () => {
  router.push('/main');
};
</script>

<style scoped>
.change-password-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>