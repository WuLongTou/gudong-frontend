<template>
    <div class="index-container">
        <el-card class="responsive-card">
            <template #header>
                <div class="header-content">
                    <h1 class="main-title"><span class="animate-move-around">🌏</span> 地理社交空间</h1>
                    <p class="subtitle">探索你身边的实时社交圈</p>
                </div>
            </template>

            <div class="form-container">
                <!-- 访客入口 -->
                <el-button type="primary" plain size="large" @click="handleGuestEntry" class="full-width-button">
                    🚀 立即体验
                </el-button>

                <el-divider>或</el-divider>

                <!-- 注册表单 -->
                <el-form :model="form" :rules="rules" ref="registerForm" @submit.prevent="handleRegister">
                    <el-form-item prop="user_id" class="form-item-margin">
                        <el-input v-model="form.nickname" placeholder="设置昵称（2-24位）" clearable size="large" show-password
                            :prefix-icon="Lock" class="responsive-input" :style="{
                                height: 'clamp(40px, 5vh, 60px)',
                                fontSize: 'clamp(1rem, 1.2vw, 1.25rem)'
                            }" />
                        <el-input v-model="form.user_id" placeholder="设置用户ID（6-24位）" clearable size="large"
                            show-password :prefix-icon="Lock" class="responsive-input" :style="{
                                height: 'clamp(40px, 5vh, 60px)',
                                fontSize: 'clamp(1rem, 1.2vw, 1.25rem)'
                            }" />
                        <el-input v-model="form.password" placeholder="设置密码（6-24位）" clearable size="large" show-password
                            :prefix-icon="Lock" class="responsive-input" :style="{
                                height: 'clamp(40px, 5vh, 60px)',
                                fontSize: 'clamp(1rem, 1.2vw, 1.25rem)'
                            }" />
                    </el-form-item>

                    <el-button type="primary" native-type="submit" :loading="isSubmitting" size="large"
                        class="full-width-button">
                        {{ isSubmitting ? '注册中...' : '📝 注册新用户' }}
                    </el-button>
                </el-form>
            </div>

            <div class="footer-note">
                选择"立即体验"将使用临时会话，关闭浏览器后数据将清除
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser, createTemporaryUser } from '../utils/api';
import { Lock } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useNuxtApp } from '#app';

const router = useRouter();
const { $storage } = useNuxtApp();
const registerForm = ref<FormInstance>();
const isSubmitting = ref(false);

const form = reactive({
    user_id: '',
    password: '',
    nickname: '',
});

const rules = reactive<FormRules>({
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
        router.push('/home');
    }
});

const handleGuestEntry = async () => {
    try {
        const result = await createTemporaryUser({});
        if (result.code === 0) {
            $storage.setItem('user_id', result.resp_data.user_id);
            $storage.setItem('nickname', result.resp_data.nickname);
            $storage.setItem('session_token', result.resp_data.token);
            $storage.setItem('is_temporary', 'true');
            router.push('/home');
        } else {
            ElMessage.error(result.msg || '进入失败');
        }
    } catch (error) {
        ElMessage.error('系统错误，请重试');
    }
};

const handleRegister = async () => {
    try {
        await registerForm.value?.validate();
    } catch (error) {
        ElMessage.error("请正确填写注册信息");
        return;
    }

    try {
        isSubmitting.value = true;

        const result = await registerUser({
            user_id: form.user_id,
            password: form.password,
            nickname: form.nickname
        });

        if (result.code === 0) {
            $storage.setItem('user_id', result.resp_data.user_id);
            $storage.setItem('nickname', result.resp_data.nickname);
            $storage.setItem('session_token', result.resp_data.token);
            router.push('/home');
        } else {
            ElMessage.error(result.msg || '注册失败');
        }
    } catch (error) {
        ElMessage.error(`注册失败: 网络问题`);
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style scoped>
.index-container {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: linear-gradient(to bottom right, #ebf5ff, #f5f0ff);
}

.responsive-card {
    width: 90vw;
    max-width: 600px;
    min-height: 40vh;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-radius: 1rem;
    margin: 0.5rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.9);
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
    margin-top: 1.5rem;
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
        overflow-y: auto;
        padding: 1.5rem;
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
