<template>
    <div class="min-h-screen w-full flex items-center justify-center p-0 bg-gradient-to-br from-blue-50 to-purple-50">
        <el-card
            class="responsive-card w-[90vw] max-w-[600px] min-h-[40vh] shadow-xl rounded-2xl m-2 xl:flex xl:flex-col xl:justify-between">
            <template #header>
                <div class="text-center space-y-[clamp(0.5rem,1.5vh,2rem)]">
                    <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-bold text-blue-600"><span
                            class="inline-block animate-move-around">🌏</span> 地理社交空间</h1>
                    <p class="text-gray-500 text-[clamp(0.875rem,1.2vw,1.125rem)]">探索你身边的实时社交圈</p>
                </div>
            </template>

            <div class="flex flex-col gap-6">
                <!-- 访客入口 -->
                <el-button type="primary" plain size="large" @click="handleGuestEntry"
                    class="w-full text-[clamp(1rem,1.5vw,1.25rem)] py-[1.5vh]">
                    🚀 立即体验
                </el-button>

                <el-divider>或</el-divider>

                <!-- 注册表单 -->
                <el-form :model="form" :rules="rules" ref="registerForm" @submit.prevent="handleRegister">
                    <el-form-item prop="user_id" class="mb-6">
                        <el-input v-model="form.nickname" placeholder="设置昵称（2-24位）" clearable size="large" show-password
                            :prefix-icon="Lock" class="w-full" :style="{
                                height: 'clamp(40px, 5vh, 60px)',
                                fontSize: 'clamp(1rem, 1.2vw, 1.25rem)'
                            }" />
                        <el-input v-model="form.user_id" placeholder="设置用户ID（6-24位）" clearable size="large"
                            show-password :prefix-icon="Lock" class="w-full" :style="{
                                height: 'clamp(40px, 5vh, 60px)',
                                fontSize: 'clamp(1rem, 1.2vw, 1.25rem)'
                            }" />
                        <el-input v-model="form.password" placeholder="设置密码（6-24位）" clearable size="large" show-password
                            :prefix-icon="Lock" class="w-full" :style="{
                                height: 'clamp(40px, 5vh, 60px)',
                                fontSize: 'clamp(1rem, 1.2vw, 1.25rem)'
                            }" />
                    </el-form-item>

                    <el-button type="primary" native-type="submit" :loading="isSubmitting" size="large"
                        class="w-full text-[clamp(1rem,1.5vw,1.25rem)] py-[1.5vh]">
                        {{ isSubmitting ? '注册中...' : '📝 注册新用户' }}
                    </el-button>
                </el-form>
            </div>

            <div class="mt-6 text-center text-sm text-gray-500">
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
        const result = await createTemporaryUser();
        if (result.code === 0) {
            console.log("result: ", result);
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
.responsive-card {
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.9);
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

.animate-move-around {
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
</style>
