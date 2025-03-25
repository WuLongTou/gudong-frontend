<template>
    <!-- 用户信息 -->
    <el-card class="user-card">
        <div class="user-info">
            <el-avatar :size="50" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <div class="user-details">
                <NicknameEditor
                    :nickname="nickname"
                    @update:nickname="updateNickname"
                    class="nickname-editor-wrapper"
                />
                <p class="user-email">{{ userId }}</p>
            </div>
            <el-button type="primary" circle @click="onUserSetting">
                <el-icon>
                    <Setting />
                </el-icon>
            </el-button>
        </div>
    </el-card>
    <!-- 位置信息 -->
    <el-card class="location-card">
        <el-collapse>
            <el-collapse-item title="位置信息">
                <el-form-item label="经度">
                    <el-input v-model="form.longitude" v-on:blur="onBlurLongitude" placeholder="请输入经度" />
                </el-form-item>
                <el-form-item label="纬度">
                    <el-input v-model="form.latitude" v-on:blur="onBlurLatitude" placeholder="请输入纬度" />
                </el-form-item>
                <el-form-item label="位置名称">
                    <el-input :disabled="true" v-model="props.locationName" placeholder="请输入位置名称" />
                </el-form-item>
            </el-collapse-item>
        </el-collapse>
    </el-card>
</template>
<script setup lang="ts">
import type { MapLocation } from '~/types'
import { Setting } from '@element-plus/icons-vue'
import NicknameEditor from '~/components/user/NicknameEditor.vue'
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import type { StorageAdapter } from '~/plugins/storage'

// 安全获取storage
function getStorage(): StorageAdapter {
    let storage
    try {
        const nuxtApp = useNuxtApp()
        storage = nuxtApp.$storage as StorageAdapter
    } catch (e) {
        console.error('获取$storage失败:', e)
        // 创建一个基于localStorage的后备实现
        storage = {
            getItem: (key: string) => localStorage.getItem(key),
            setItem: (key: string, value: string) => localStorage.setItem(key, value),
            removeItem: (key: string) => localStorage.removeItem(key)
        }
    }
    return storage
}

const storage = getStorage()

const props = defineProps<{
    location: MapLocation
    locationName: string
}>()

const emits = defineEmits<{
    'update:location': [MapLocation]
}>()

const form = ref<MapLocation>({
    longitude: props.location.longitude,
    latitude: props.location.latitude,
})

// 用户信息
const nickname = ref('')
const userId = ref('')

onMounted(() => {
    // 从存储中获取用户信息
    try {
        nickname.value = storage.getItem('nickname') || '未知用户'
        userId.value = storage.getItem('user_id') || '游客'
    } catch (e) {
        console.error('从storage获取用户信息失败:', e)
        // 尝试从localStorage获取
        nickname.value = localStorage.getItem('nickname') || '未知用户'
        userId.value = localStorage.getItem('user_id') || '游客'
    }
})

function updateNickname(newNickname: string) {
    console.log('UserBundle: 更新昵称', newNickname)
    nickname.value = newNickname
    // 更新本地存储
    try {
        storage.setItem('nickname', newNickname)
    } catch (e) {
        console.error('更新storage中的昵称失败:', e)
        localStorage.setItem('nickname', newNickname)
    }
}

function onBlurLongitude(e: Event) {
    emits('update:location', {
        longitude: form.value.longitude,
        latitude: form.value.latitude
    })
}
function onBlurLatitude(e: Event) {
    emits('update:location', {
        longitude: form.value.longitude,
        latitude: form.value.latitude
    })
}
watch(props, (newProps) => {
    form.value.longitude = newProps.location.longitude
    form.value.latitude = newProps.location.latitude
}, { deep: true })

function onUserSetting() {
    console.log('用户设置')
}
</script>

<style scoped>
.user-card {
    margin-bottom: 1rem;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.user-details {
    flex: 1;
    min-width: 0; /* 防止文本溢出 */
}

.user-email {
    color: #6b7280;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.location-card {
    margin-bottom: 1rem;
}

/* 针对手机竖屏模式的优化 */
@media (max-aspect-ratio: 2/3) {
    .user-info {
        gap: 0.5rem;
    }
    
    /* 在小屏幕上增加表单项的可读性 */
    :deep(.el-form-item__label) {
        font-size: 0.875rem;
    }
    
    :deep(.el-input__inner) {
        font-size: 0.875rem;
        height: 2.5rem;
    }
}

/* 针对极小屏幕的优化 */
@media (max-width: 320px) {
    .user-info {
        flex-wrap: wrap;
    }
    
    .user-details {
        width: calc(100% - 60px);
    }
}

.nickname-editor-wrapper {
    display: block;
    margin-bottom: 4px;
    cursor: pointer;
}
</style>