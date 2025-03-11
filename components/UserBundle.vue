<template>
    <!-- 用户信息 -->
    <el-card class="user-card">
        <div class="user-info">
            <el-avatar :size="50" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <div class="user-details">
                <h3 class="user-name">用户名</h3>
                <p class="user-email">user@example.com</p>
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

.user-name {
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
</style>