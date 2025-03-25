<template>
    <div class="nickname-editor">
        <el-tooltip
            content="点击编辑昵称"
            placement="top"
            :hide-after="0"
        >
            <div class="nickname-display" @click="openDialog">
                <span class="nickname-text">{{ nickname }}</span>
                <el-icon class="edit-icon"><Edit /></el-icon>
            </div>
        </el-tooltip>
        
        <!-- 编辑昵称的对话框 -->
        <el-dialog
            v-model="dialogVisible"
            title="修改昵称"
            width="300px"
            :close-on-click-modal="false"
            :show-close="true"
        >
            <el-form @submit.prevent="saveNickname">
                <el-form-item label="新昵称">
                    <el-input 
                        v-model="editingNickname" 
                        placeholder="请输入新昵称" 
                        maxlength="20"
                        show-word-limit
                        ref="inputRef"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveNickname" :loading="saving">
                        确认
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ElMessage, ElInput } from 'element-plus'
import { ref, nextTick, onMounted } from 'vue'
import { Edit } from '@element-plus/icons-vue'
import { updateNickname } from '~/utils/api'
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
    nickname: string
}>()

const emit = defineEmits<{
    (e: 'update:nickname', value: string): void
}>()

const dialogVisible = ref(false)
const editingNickname = ref('')
const saving = ref(false)
const inputRef = ref<InstanceType<typeof ElInput> | null>(null)

onMounted(() => {
    console.log('NicknameEditor组件挂载成功，当前昵称:', props.nickname)
})

function openDialog() {
    console.log('打开昵称编辑对话框:', props.nickname)
    editingNickname.value = props.nickname
    dialogVisible.value = true
    // 等待对话框显示后聚焦输入框
    nextTick(() => {
        inputRef.value?.focus()
    })
}

async function saveNickname() {
    if (!editingNickname.value.trim()) {
        ElMessage.warning('昵称不能为空')
        return
    }
    
    try {
        saving.value = true
        console.log('更新昵称:', editingNickname.value.trim())
        
        // 安全获取临时用户状态
        let isTemporary = 'unknown'
        try {
            isTemporary = storage.getItem('is_temporary') || 'false'
        } catch (e) {
            console.error('获取临时用户状态失败:', e)
            isTemporary = localStorage.getItem('is_temporary') || 'false'
        }
        
        console.log('临时用户状态:', isTemporary)
        const result = await updateNickname({ nickname: editingNickname.value.trim() })
        console.log('API响应结果:', result)
        if (result.code === 0) {
            emit('update:nickname', editingNickname.value.trim())
            
            // 安全更新存储的昵称
            try {
                storage.setItem('nickname', editingNickname.value.trim())
            } catch (e) {
                console.error('更新存储的昵称失败:', e)
                localStorage.setItem('nickname', editingNickname.value.trim())
            }
            
            ElMessage.success('昵称更新成功')
            dialogVisible.value = false
        } else {
            ElMessage.error(result.msg || '昵称更新失败')
        }
    } catch (error) {
        console.error('更新昵称出错:', error)
        ElMessage.error('昵称更新失败')
    } finally {
        saving.value = false
    }
}
</script>

<style scoped>
.nickname-editor {
    display: inline-block;
    width: 100%;
}

.nickname-display {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.nickname-text {
    font-weight: bold;
    font-size: 1rem;
}

.nickname-display:hover {
    background-color: #f5f7fa;
}

.edit-icon {
    font-size: 14px;
    color: #909399;
    margin-left: 4px;
}

:deep(.el-dialog__body) {
    padding-top: 10px;
    padding-bottom: 0;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style> 