<template>
    <div class="min-h-screen w-full flex items-center justify-center p-0 bg-gradient-to-br from-blue-50 to-purple-50">
        <el-card
            class="responsive-card w-[90vw] max-w-[600px] min-h-[40vh] shadow-xl rounded-2xl m-2 xl:flex xl:flex-col xl:justify-between">
            <template #header>
                <div class="text-center space-y-[clamp(0.5rem,1.5vh,2rem)]">
                    <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-bold text-blue-600">👋 欢迎加入群聊</h1>
                    <p class="text-gray-500 text-[clamp(0.875rem,1.2vw,1.125rem)]">开启你的社交新体验</p>
                </div>
            </template>

            <el-form :model="form" :rules="rules" ref="registerForm" @submit.prevent="handleRegister">
                <div class="flex-1 min-h-[20vh] space-y-[2vh]">
                    <el-form-item prop="securityCode" class="mb-6 flex flex-col xl:flex-row items-center gap-[1vw]">
                        <span class="text-gray-600 text-[clamp(1rem,1.5vw,1.25rem)]">安全码：</span>
                        <el-input v-model="form.securityCode" placeholder="请输入6-24位安全码" clearable size="large"
                            @keyup.enter="handleRegister" class="flex-1 min-w-[200px] xl:min-w-[300px]" show-password
                            :style="{
                                height: 'clamp(40px, 5vh, 60px)',
                                fontSize: 'clamp(1rem, 1.2vw, 1.25rem)'
                            }">
                            <template #prefix>
                                <el-icon class="text-gray-400 icon-size">
                                    <Lock />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item class="mt-[3vh]">
                        <el-button type="primary" native-type="submit" :loading="isSubmitting" size="large"
                            class="w-full text-[clamp(1rem,1.5vw,1.25rem)] py-[1.5vh]">
                            {{ isSubmitting ? '注册中...' : '立即加入' }}
                        </el-button>
                    </el-form-item>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '../utils/api';
import { Lock } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useNuxtApp } from '#app';

const router = useRouter();
const { $storage } = useNuxtApp();
const registerForm = ref<FormInstance>();
const isSubmitting = ref(false);

const form = reactive({
    securityCode: '',
});

const rules = reactive<FormRules>({
    securityCode: [
        { required: true, message: '安全码不能为空', trigger: 'blur' },
        { min: 6, max: 24, message: '长度需在6到24个字符之间', trigger: 'blur' }
    ]
});

onMounted(() => {
    if ($storage.getItem('session_token')) {
        router.push('/home');
    }
});

const handleRegister = async () => {
    try {
        await registerForm.value?.validate();
    } catch (error) {
        ElMessage.warning('请正确填写安全码');
        return;
    }

    try {
        isSubmitting.value = true;

        const { publicKey, privateKey } = await crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );

        const [exportedPublicKey, exportedPrivateKey] = await Promise.all([
            crypto.subtle.exportKey("jwk", publicKey),
            crypto.subtle.exportKey("jwk", privateKey)
        ]);

        $storage.setItem('private_key', JSON.stringify(exportedPrivateKey));

        const { data: { code, error_message, content } } = await registerUser({
            security_code: form.securityCode,
            public_key: exportedPublicKey
        });

        if (code === 0) {
            $storage.setItem('session_token', content.session_token);
            router.push('/home');
        } else {
            ElMessage.error(error_message || '注册失败');
        }
    } catch (error) {
        const err = error as Error;
        ElMessage.error(`注册失败: ${err.message}`);
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
</style>
