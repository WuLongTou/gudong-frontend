<template>
    <div class="index-container">
        <el-card class="responsive-card">
            <template #header>
                <div class="header-content">
                    <h1 class="main-title"><span class="animate-move-around">🌏</span> 地理社交空间</h1>
                    <p class="subtitle">探索你身边的实时社交圈</p>
                </div>
            </template>


            <!-- 访客入口 -->
            <el-button type="success" plain size="large" @click="handleGuestEntry" class="guest-button">
                🚀 立即体验（临时账号）
            </el-button>

            <div class="footer-note">
                选择"立即体验"将使用临时会话，关闭浏览器后数据将清除
            </div>
            <el-divider>或者</el-divider>

            <div class="form-container">
                <!-- 登录/注册选项卡 -->
                <el-tabs v-model="activeTab" class="tabs-container">
                    <!-- 登录表单 -->
                    <el-tab-pane label="登录" name="login">
                        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef"
                            @submit.prevent="handleLogin">
                            <el-form-item prop="user_id" class="form-item-margin">
                                <el-input v-model="loginForm.user_id" placeholder="用户ID" clearable size="large"
                                    :prefix-icon="Lock" class="responsive-input" :style="{
                                        height: 'clamp(40px, 5vh, 60px)',
                                        fontSize: 'clamp(1rem, 1.2vw, 1.25rem)'
                                    }" />
                            </el-form-item>
                            <el-form-item prop="password" class="form-item-margin">
                                <el-input v-model="loginForm.password" placeholder="密码" type="password" clearable
                                    size="large" show-password :prefix-icon="Lock" class="responsive-input" :style="{
                                        height: 'clamp(40px, 5vh, 60px)',
                                        fontSize: 'clamp(1rem, 1.2vw, 1.25rem)'
                                    }" />
                            </el-form-item>
                            <el-button type="primary" native-type="submit" :loading="isLoginSubmitting" size="large"
                                class="full-width-button">
                                {{ isLoginSubmitting ? '登录中...' : '🔑 登录' }}
                            </el-button>
                        </el-form>
                    </el-tab-pane>

                    <!-- 注册表单 -->
                    <el-tab-pane label="注册" name="register">
                        <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef"
                            @submit.prevent="handleRegister">
                            <el-form-item prop="nickname" class="form-item-margin">
                                <el-input v-model="registerForm.nickname" placeholder="设置昵称（2-24位）" clearable
                                    size="large" :prefix-icon="Lock" class="responsive-input" :style="{
                                        height: 'clamp(40px, 5vh, 60px)',
                                        fontSize: 'clamp(1rem, 1.2vw, 1.25rem)'
                                    }" />
                            </el-form-item>
                            <el-form-item prop="user_id" class="form-item-margin">
                                <el-input v-model="registerForm.user_id" placeholder="设置用户ID（6-24位）" clearable
                                    size="large" :prefix-icon="Lock" class="responsive-input" :style="{
                                        height: 'clamp(40px, 5vh, 60px)',
                                        fontSize: 'clamp(1rem, 1.2vw, 1.25rem)'
                                    }" />
                            </el-form-item>
                            <el-form-item prop="password" class="form-item-margin">
                                <el-input v-model="registerForm.password" placeholder="设置密码（6-24位）" type="password"
                                    clearable size="large" show-password :prefix-icon="Lock" class="responsive-input"
                                    :style="{
                                        height: 'clamp(40px, 5vh, 60px)',
                                        fontSize: 'clamp(1rem, 1.2vw, 1.25rem)'
                                    }" />
                            </el-form-item>
                            <el-button type="primary" native-type="submit" :loading="isRegisterSubmitting" size="large"
                                class="full-width-button">
                                {{ isRegisterSubmitting ? '注册中...' : '📝 注册新用户' }}
                            </el-button>
                        </el-form>
                    </el-tab-pane>
                </el-tabs>

            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { registerUser, createTemporaryUser, loginUser } from '../utils/api';
import { Lock } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useNuxtApp } from '#app';

const { $storage } = useNuxtApp();
const activeTab = ref('login');
const loginFormRef = ref<FormInstance>();
const registerFormRef = ref<FormInstance>();
const isLoginSubmitting = ref(false);
const isRegisterSubmitting = ref(false);

// 登录表单数据
const loginForm = reactive({
    user_id: '',
    password: '',
});

// 注册表单数据
const registerForm = reactive({
    user_id: '',
    password: '',
    nickname: '',
});

// 登录表单验证规则
const loginRules = reactive<FormRules>({
    user_id: [
        { required: true, message: '用户ID不能为空', trigger: 'blur' },
        { min: 6, max: 24, message: '长度需在6到24个字符之间', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '密码不能为空', trigger: 'blur' },
        { min: 6, max: 24, message: '长度需在6到24个字符之间', trigger: 'blur' }
    ],
});

// 注册表单验证规则
const registerRules = reactive<FormRules>({
    user_id: [
        { required: true, message: '用户ID不能为空', trigger: 'blur' },
        { min: 6, max: 24, message: '长度需在6到24个字符之间', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '密码不能为空', trigger: 'blur' },
        { min: 6, max: 24, message: '长度需在6到24个字符之间', trigger: 'blur' }
    ],
    nickname: [
        { required: true, message: '昵称不能为空', trigger: 'blur' },
        { min: 2, max: 24, message: '长度需在2到24个字符之间', trigger: 'blur' }
    ],
});

onMounted(() => {
    if ($storage.getItem('session_token')) {
        navigateTo('/home');
    }
});

// 处理访客登录
const handleGuestEntry = async () => {
    try {
        const result = await createTemporaryUser();
        if (result.code === 0) {
            $storage.setItem('user_id', result.resp_data.user_id);
            $storage.setItem('nickname', result.resp_data.nickname);
            $storage.setItem('session_token', result.resp_data.token);
            $storage.setItem('is_temporary', 'true');
            navigateTo('/home');
        } else {
            ElMessage.error(result.msg || '进入失败');
        }
    } catch (error: any) {
        ElMessage.error(error.msg || '系统错误，请重试');
    }
};

// 处理登录
const handleLogin = async () => {
    try {
        await loginFormRef.value?.validate();
    } catch (error) {
        ElMessage.error("请正确填写登录信息");
        return;
    }

    try {
        isLoginSubmitting.value = true;
        const result = await loginUser({
            user_id: loginForm.user_id,
            password: loginForm.password
        });

        if (result.code === 0) {
            $storage.setItem('user_id', result.resp_data.user_id);
            $storage.setItem('nickname', result.resp_data.nickname);
            $storage.setItem('session_token', result.resp_data.token);
            $storage.setItem('is_temporary', 'false');
            navigateTo('/home');
        } else {
            ElMessage.error(result.msg || '登录失败');
        }
    } catch (error: any) {
        ElMessage.error(error.msg || '登录失败');
    } finally {
        isLoginSubmitting.value = false;
    }
};

// 处理注册
const handleRegister = async () => {
    try {
        await registerFormRef.value?.validate();
    } catch (error) {
        ElMessage.error("请正确填写注册信息");
        return;
    }

    try {
        isRegisterSubmitting.value = true;
        const result = await registerUser({
            user_id: registerForm.user_id,
            password: registerForm.password,
            nickname: registerForm.nickname
        });

        if (result.code === 0) {
            $storage.setItem('user_id', result.resp_data.user_id);
            $storage.setItem('nickname', result.resp_data.nickname);
            $storage.setItem('session_token', result.resp_data.token);
            $storage.setItem('is_temporary', 'false');
            navigateTo('/home');
        } else {
            ElMessage.error(result.msg || '注册失败');
        }
    } catch (error: any) {
        ElMessage.error(error.msg || '注册失败');
    } finally {
        isRegisterSubmitting.value = false;
    }
};
</script>

<style scoped>
/* 新增样式 */
.tabs-container {
    width: 100%;
}

/* 确保选项卡内容高度一致，避免切换时页面抖动 */
:deep(.el-tabs__content) {
    min-height: 260px;
}

.guest-button {
    width: 100%;
    font-size: clamp(0.875rem, 1.5vw, 1.25rem);
    margin-top: 0.5rem;
}

/* 保持原有样式不变 */
.index-container {
    min-height: 100vh;
    /* 使用CSS变量确保在移动端上正确显示 */
    min-height: calc(var(--vh, 1vh) * 100);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(to bottom right, #ebf5ff, #f5f0ff);
    overflow: hidden;
    /* 增加安全区域支持 */
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
}

.responsive-card {
    width: 90vw;
    max-width: 600px;
    min-height: 40vh;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-radius: 1rem;
    margin: 0;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.9);
    overflow: hidden;
}

.header-content {
    text-align: center;
}

.header-content>* {
    margin-bottom: clamp(0.5rem, 1.5vh, 2rem);
}

.main-title {
    font-size: clamp(1.5rem, 5vw, 3.5rem);
    font-weight: bold;
    color: #2563eb;
}

.subtitle {
    color: #6b7280;
    font-size: clamp(0.75rem, 1.2vw, 1.125rem);
}

.form-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-item-margin {
    margin-bottom: 1.5rem;
}

.full-width-button {
    width: 100%;
    font-size: clamp(0.875rem, 1.5vw, 1.25rem);
    padding-top: min(1.5vh, 0.75rem);
    padding-bottom: min(1.5vh, 0.75rem);
}

.responsive-input {
    width: 100%;
}

.footer-note {
    margin-top: 0.5rem;
    text-align: center;
    font-size: 0.875rem;
    color: #6b7280;
}

.animate-move-around {
    display: inline-block;
    animation: move-around 1s cubic-bezier(0.895, 0.03, 0.685, 0.22) infinite alternate;
}

@keyframes move-around {
    0% {
        transform: translate(0px, -15px);
    }

    100% {
        transform: translate(0px, 15px);
    }
}

/* 针对手机竖屏模式的优化 */
@media (max-aspect-ratio: 2/3) {
    .responsive-card {
        width: 95vw;
        max-height: 90vh;
        max-height: calc(var(--vh, 1vh) * 90);
        overflow-y: auto;
        padding: 1.5rem;
        /* 增加底部边距，避免内容被虚拟键盘遮挡 */
        margin-bottom: env(safe-area-inset-bottom);
    }

    .main-title {
        font-size: clamp(1.5rem, 7vw, 2.5rem);
    }

    .form-container {
        gap: 1rem;
    }

    .form-item-margin {
        margin-bottom: 1rem;
    }
    
    /* 针对iOS虚拟键盘的优化 */
    .el-input__inner {
        font-size: 16px !important; /* 防止iOS自动缩放 */
    }
}

/* 针对小屏幕设备上的虚拟键盘弹出情况 */
@media (max-height: 500px) {
    .index-container {
        align-items: flex-start; /* 在键盘弹出时将内容对齐到顶部 */
        padding-top: 1rem;
    }
    
    .responsive-card {
        margin-top: 0;
        max-height: none;
    }
    
    .main-title {
        font-size: clamp(1.25rem, 5vw, 2rem);
    }
    
    .subtitle {
        font-size: clamp(0.675rem, 1vw, 1rem);
        margin-bottom: 0.5rem;
    }
    
    /* 减少不必要的动画，提高性能 */
    .animate-move-around {
        animation: none;
    }
}

@media (min-width: 640px) {
    .responsive-card {
        width: 70vw;
        min-height: 35vh;
        padding: 2.5rem;
    }
}

@media (min-width: 768px) {
    .responsive-card {
        width: 60vw;
        min-height: 30vh;
        padding: 3rem;
    }
}

@media (min-width: 1024px) {
    .responsive-card {
        width: 50vw;
        min-height: 25vh;
        padding: 3.5rem;
    }
}

@media (min-width: 1280px) {
    .responsive-card {
        width: 40vw;
        min-height: 20vh;
        padding: 4rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
}

@media (min-width: 1536px) {
    .responsive-card {
        width: 35vw;
        min-height: 25vh;
        padding: 4.5rem;
    }
}

.icon-size {
    width: clamp(18px, 2vw, 24px);
    height: clamp(18px, 2vw, 24px);
}
</style>
