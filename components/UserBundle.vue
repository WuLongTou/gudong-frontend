<template>
    <!-- 用户信息 -->
    <el-card class="mb-4">
        <div class="flex items-center gap-1">
            <el-avatar :size="50" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <div class="flex-1">
                <h3 class="font-bold">用户名</h3>
                <p class="text-gray-500 text-sm">user@example.com</p>
            </div>
            <el-button type="primary" circle @click="onUserSetting">
                <el-icon>
                    <Setting />
                </el-icon>
            </el-button>
        </div>
    </el-card>
    <!-- 位置信息 -->
    <el-card class="mb-4">
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