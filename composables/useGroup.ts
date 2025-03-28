import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type {
  GroupInfo,
  NewGroupRequest,
  JoinGroupRequest,
  LeaveGroupRequest,
  GroupMember
} from '~/types/api/group'
import { 
  createGroup, getGroupById, getGroupMembers, 
  joinGroup, leaveGroup, getNearbyGroups,
  getGroupByName, keepAliveInGroup
} from '~/utils/api/modules/group'

/**
 * 群组功能相关的Composable
 * 简化版本，只保留必要状态和方法
 */
export function useGroup() {
  // 状态管理
  const currentGroup = ref<GroupInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const groupMembers = ref<GroupMember[]>([])
  const nearbyGroups = ref<GroupInfo[]>([])

  /**
   * 创建新群组
   */
  async function createNewGroup(newGroup: NewGroupRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await createGroup(newGroup)
      
      if (response.code === 0 && response.resp_data) {
        currentGroup.value = response.resp_data
        ElMessage.success('群组创建成功')
        return response.resp_data
      } else {
        error.value = response.msg || '创建群组失败'
        ElMessage.error(`创建群组失败: ${error.value}`)
        return null
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : '创建群组失败'
      error.value = errMsg
      ElMessage.error(`创建群组失败: ${errMsg}`)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 加入群组
   */
  async function joinExistingGroup(groupId: string, password?: string) {
    loading.value = true
    error.value = null

    try {
      const response = await joinGroup({ 
        group_id: groupId, 
        password 
      })

      if (response.code === 0) {
        ElMessage.success('成功加入群组')
        // 加载群组详情
        await loadGroupInfo(groupId)
        return true
      } else {
        error.value = response.msg || '加入群组失败'
        ElMessage.error(`加入群组失败: ${error.value}`)
        return false
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : '加入群组失败'
      error.value = errMsg
      ElMessage.error(`加入群组失败: ${errMsg}`)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 离开群组
   */
  async function leaveExistingGroup(groupId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await leaveGroup({ group_id: groupId })

      if (response.code === 0) {
        ElMessage.success('已离开群组')
        if (currentGroup.value?.group_id === groupId) {
          currentGroup.value = null
        }
        return true
      } else {
        error.value = response.msg || '离开群组失败'
        ElMessage.error(`离开群组失败: ${error.value}`)
        return false
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : '离开群组失败'
      error.value = errMsg
      ElMessage.error(`离开群组失败: ${errMsg}`)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载群组信息
   */
  async function loadGroupInfo(groupId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await getGroupById(groupId)

      if (response.code === 0 && response.resp_data) {
        currentGroup.value = response.resp_data
        // 加载群组成员
        await loadGroupMembers(groupId)
        return response.resp_data
      } else {
        error.value = response.msg || '获取群组信息失败'
        ElMessage.error(`获取群组信息失败: ${error.value}`)
        return null
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : '获取群组信息失败'
      error.value = errMsg
      ElMessage.error(`获取群组信息失败: ${errMsg}`)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载群组成员列表
   */
  async function loadGroupMembers(groupId: string) {
    try {
      const response = await getGroupMembers(groupId)

      if (response.code === 0 && response.resp_data) {
        groupMembers.value = response.resp_data
        return response.resp_data
      } else {
        console.error(`获取群组成员失败: ${response.msg}`)
        return null
      }
    } catch (err) {
      console.error('加载群组成员出错:', err)
      return null
    }
  }

  /**
   * 搜索附近的群组
   */
  async function searchNearbyGroups(latitude: number, longitude: number, radius: number = 5000) {
    loading.value = true
    error.value = null

    try {
      const response = await getNearbyGroups({ latitude, longitude }, radius)

      if (response.code === 0 && response.resp_data) {
        nearbyGroups.value = response.resp_data
        return response.resp_data
      } else {
        error.value = response.msg || '搜索附近群组失败'
        console.error(`搜索附近群组失败: ${error.value}`)
        return null
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : '搜索附近群组失败'
      error.value = errMsg
      console.error(`搜索附近群组失败: ${errMsg}`)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索群组（按名称）
   */
  async function searchGroupsByName(name: string) {
    loading.value = true
    error.value = null

    try {
      const response = await getGroupByName(name)

      if (response.code === 0 && response.resp_data) {
        nearbyGroups.value = response.resp_data
        return response.resp_data
      } else {
        error.value = response.msg || '搜索群组失败'
        console.error(`搜索群组失败: ${error.value}`)
        return null
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : '搜索群组失败'
      error.value = errMsg
      console.error(`搜索群组失败: ${errMsg}`)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 发送群组保活请求
   */
  async function sendKeepAlive(groupId: string) {
    if (!currentGroup.value || currentGroup.value.group_id !== groupId) {
      return
    }

    try {
      await keepAliveInGroup({ group_id: groupId })
    } catch (err) {
      console.error('保活请求出错:', err)
    }
  }

  return {
    // 状态
    currentGroup,
    loading,
    error,
    groupMembers,
    nearbyGroups,
    
    // 方法
    createGroup: createNewGroup,
    joinGroup: joinExistingGroup,
    leaveGroup: leaveExistingGroup,
    loadGroupInfo,
    loadGroupMembers,
    searchNearbyGroups,
    searchGroupsByName,
    sendKeepAlive
  }
} 