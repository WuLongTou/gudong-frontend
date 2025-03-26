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
import { updateNickname } from '~/utils/api/modules/user'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()

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

function openDialog() {
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
        
        const result = await updateNickname({ nickname: editingNickname.value.trim() })
        if (result.code === 0) {
            const newNickname = editingNickname.value.trim()
            emit('update:nickname', newNickname)
            
            // 直接更新用户状态
            userStore.nickname = newNickname
            
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