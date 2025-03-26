<template>
    <div class="login-container">
        <div class="login-card">
            <div class="header-content">
                <div class="logo-container">
                    <span class="logo-emoji">🌏</span>
                </div>
                <h1 class="main-title">地理社交空间</h1>
                <p class="subtitle">探索你身边的实时社交圈</p>
            </div>

            <!-- 登录/注册选项卡 -->
            <div class="tabs-container">
                <div class="tabs-header">
                    <div class="tab-item" :class="{ 'active': activeTab === 'login' }" @click="activeTab = 'login'">
                        登录
                    </div>
                    <div class="tab-item" :class="{ 'active': activeTab === 'register' }"
                        @click="activeTab = 'register'">
                        注册
                    </div>
                </div>

                <div class="tabs-content">
                    <!-- 登录表单 -->
                    <div v-show="activeTab === 'login'" class="tab-pane">
                        <form @submit.prevent="handleLogin">
                            <div class="form-item">
                                <el-input v-model="loginForm.user_id" placeholder="用户ID" clearable :prefix-icon="User"
                                    class="form-input" />
                            </div>
                            <div class="form-item">
                                <el-input v-model="loginForm.password" placeholder="密码" type="password" clearable
                                    show-password :prefix-icon="Lock" class="form-input" />
                            </div>
                            <el-button type="primary" native-type="submit" :loading="isLoginSubmitting"
                                class="submit-button" round>
                                {{ isLoginSubmitting ? '登录中...' : '登录' }}
                            </el-button>
                        </form>
                    </div>

                    <!-- 注册表单 -->
                    <div v-show="activeTab === 'register'" class="tab-pane">
                        <form @submit.prevent="handleRegister">
                            <div class="form-item">
                                <el-input v-model="registerForm.nickname" placeholder="设置昵称（2-24位）" clearable
                                    :prefix-icon="Avatar" class="form-input" />
                            </div>
                            <div class="form-item">
                                <el-input v-model="registerForm.user_id" placeholder="设置用户ID（6-24位）" clearable
                                    :prefix-icon="User" class="form-input" />
                            </div>
                            <div class="form-item">
                                <el-input v-model="registerForm.password" placeholder="设置密码（6-24位）" type="password"
                                    clearable show-password :prefix-icon="Lock" class="form-input" />
                            </div>
                            <el-button type="primary" native-type="submit" :loading="isRegisterSubmitting"
                                class="submit-button" round>
                                {{ isRegisterSubmitting ? '注册中...' : '注册新用户' }}
                            </el-button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- 分隔线 -->
            <div class="divider">
                <span>或者</span>
            </div>

            <!-- 访客入口 -->
            <el-button type="success" plain @click="handleGuestEntry" class="guest-button" :loading="isGuestLoading"
                round>
                立即体验（临时账号）
            </el-button>

            <div class="footer-note">
                选择"立即体验"将使用临时会话，关闭浏览器后数据将清除
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { registerUser, createTemporaryUser, loginUser } from '~/utils/api/modules/user';
import { Lock, User, Avatar } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useWindowSize } from '~/composables/useWindowSize';
import { useUserStore } from '~/stores/user';

// 使用pinia store
const userStore = useUserStore();

// 登录相关状态
const activeTab = ref('login');
const isLoginSubmitting = ref(false);
const isRegisterSubmitting = ref(false);
const isGuestLoading = ref(false);


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

// 页面挂载时执行
onMounted(() => {
    // 检查用户是否已登录
    if (userStore.isLoggedIn) {
        navigateTo('/home');
    }

    // 添加页面动画
    document.querySelector('.login-card')?.classList.add('slide-up');
});

// 处理访客登录
const handleGuestEntry = async () => {
    try {
        isGuestLoading.value = true;
        const result = await createTemporaryUser();
        if (result.code === 0) {
            userStore.setUser(
                result.resp_data.user_id,
                result.resp_data.nickname,
                result.resp_data.token,
                true
            );
            navigateTo('/home');
        } else {
            ElMessage.error(result.msg || '进入失败');
        }
    } catch (error: any) {
        ElMessage.error(error.message || '系统错误，请重试');
    } finally {
        isGuestLoading.value = false;
    }
};

// 处理登录
const handleLogin = async () => {
    if (!validateLoginForm()) return;

    try {
        isLoginSubmitting.value = true;
        const result = await loginUser({
            user_id: loginForm.user_id,
            password: loginForm.password
        });

        if (result.code === 0) {
            userStore.setUser(
                result.resp_data.user_id,
                result.resp_data.nickname,
                result.resp_data.token,
                false
            );
            navigateTo('/home');
        } else {
            ElMessage.error(result.msg || '登录失败');
        }
    } catch (error: any) {
        ElMessage.error(error.message || '登录失败');
    } finally {
        isLoginSubmitting.value = false;
    }
};

// 处理注册
const handleRegister = async () => {
    if (!validateRegisterForm()) return;

    try {
        isRegisterSubmitting.value = true;
        const result = await registerUser({
            user_id: registerForm.user_id,
            password: registerForm.password,
            nickname: registerForm.nickname
        });

        if (result.code === 0) {
            ElMessage.success('注册成功，请登录');
            // 注册成功后切换到登录标签
            activeTab.value = 'login';
            loginForm.user_id = registerForm.user_id;
        } else {
            ElMessage.error(result.msg || '注册失败');
        }
    } catch (error: any) {
        ElMessage.error(error.message || '注册失败');
    } finally {
        isRegisterSubmitting.value = false;
    }
};

// 验证登录表单
const validateLoginForm = () => {
    if (!loginForm.user_id) {
        ElMessage.warning('请输入用户ID');
        return false;
    }
    if (!loginForm.password) {
        ElMessage.warning('请输入密码');
        return false;
    }
    return true;
};

// 验证注册表单
const validateRegisterForm = () => {
    if (!registerForm.nickname || registerForm.nickname.length < 2 || registerForm.nickname.length > 24) {
        ElMessage.warning('昵称长度应为2-24位');
        return false;
    }
    if (!registerForm.user_id || registerForm.user_id.length < 6 || registerForm.user_id.length > 24) {
        ElMessage.warning('用户ID长度应为6-24位');
        return false;
    }
    if (!registerForm.password || registerForm.password.length < 6 || registerForm.password.length > 24) {
        ElMessage.warning('密码长度应为6-24位');
        return false;
    }
    return true;
};
</script>

<style lang="scss" scoped>
.login-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--wx-bg-color);
    padding: 20px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    min-height: 100vh;
    min-height: calc(var(--vh, 1vh) * 100);
}

.login-card {
    width: 100%;
    max-width: 420px;
    background-color: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0;
    transform: translateY(20px);

    &.slide-up {
        animation: slideUpFade 0.5s ease forwards;
    }

    @keyframes slideUpFade {
        from {
            opacity: 0;
            transform: translateY(20px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
}

</style>
