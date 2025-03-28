import dayjs from 'dayjs'
import { ActivityType } from '~/types/api/activity'

/**
 * 格式化工具composable
 * 提供各种常用的格式化函数
 */
export function useFormatters() {
  /**
   * 格式化时间为相对时间表示
   * @param timestamp 时间戳或日期字符串
   * @returns 格式化后的相对时间字符串
   */
  const formatRelativeTime = (timestamp: string | number | Date): string => {
    if (!timestamp) return '未知时间'
    
    const now = dayjs()
    const date = dayjs(timestamp)
    
    // 时间无效
    if (!date.isValid()) return '未知时间'
    
    const diffMinutes = now.diff(date, 'minute')
    const diffHours = now.diff(date, 'hour')
    const diffDays = now.diff(date, 'day')
    const diffMonths = now.diff(date, 'month')
    
    // 小于1分钟
    if (diffMinutes < 1) {
      return '刚刚'
    }
    
    // 小于1小时
    if (diffHours < 1) {
      return `${diffMinutes}分钟前`
    }
    
    // 小于1天
    if (diffDays < 1) {
      return `${diffHours}小时前`
    }
    
    // 小于30天
    if (diffMonths < 1) {
      return `${diffDays}天前`
    }
    
    // 更久
    return `${date.format('MM月DD日')}`
  }

  /**
   * 格式化距离
   * @param distance 距离（米）
   * @returns 格式化后的距离字符串
   */
  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}米`
    } else {
      return `${(distance / 1000).toFixed(1)}公里`
    }
  }

  /**
   * 格式化日期时间
   * @param date 日期对象或字符串
   * @param format 格式化模式，默认为 'YYYY-MM-DD HH:mm'
   * @returns 格式化后的日期时间字符串
   */
  const formatDateTime = (date: Date | string, format: string = 'YYYY-MM-DD HH:mm'): string => {
    const d = dayjs(date)
    if (!d.isValid()) return '无效日期'
    return d.format(format)
  }

  /**
   * 格式化数字
   * @param num 要格式化的数字
   * @param options 格式化选项
   * @returns 格式化后的数字字符串
   */
  const formatNumber = (num: number, options: {
    decimals?: number;
    thousandsSeparator?: string;
    decimalSeparator?: string;
  } = {}): string => {
    const {
      decimals = 2,
      thousandsSeparator = ',',
      decimalSeparator = '.'
    } = options
    
    if (isNaN(num)) return '0'
    
    const parts = num.toFixed(decimals).split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
    
    return parts.join(decimalSeparator)
  }

  /**
   * 格式化时间分隔条显示的时间（聊天应用）
   * @param timestamp 时间戳或日期字符串
   * @returns 格式化后的日期时间字符串
   */
  const formatTimeDivider = (timestamp: string): string => {
    const messageTime = dayjs(timestamp)
    const now = dayjs()
    
    // 今天的消息
    if (messageTime.isSame(now, 'day')) {
      return `今天 ${messageTime.format('HH:mm')}`
    }
    
    // 昨天的消息
    if (messageTime.isSame(now.subtract(1, 'day'), 'day')) {
      return `昨天 ${messageTime.format('HH:mm')}`
    }
    
    // 本周内的消息
    if (messageTime.isSame(now, 'week')) {
      return `${messageTime.format('ddd HH:mm')}`
    }
    
    // 本年内的消息
    if (messageTime.isSame(now, 'year')) {
      return messageTime.format('MM月DD日 HH:mm')
    }
    
    // 其他情况
    return messageTime.format('YYYY年MM月DD日 HH:mm')
  }

  /**
   * 格式化消息时间（聊天应用）
   * @param timestamp 时间戳或日期字符串
   * @returns 格式化后的时间字符串
   */
  const formatMessageTime = (timestamp: string): string => {
    const now = dayjs()
    const messageTime = dayjs(timestamp)
    const diffMinutes = now.diff(messageTime, 'minute')
    const diffHours = now.diff(messageTime, 'hour')
    const diffDays = now.diff(messageTime, 'day')
    const diffMonths = now.diff(messageTime, 'month')
    
    if (diffMinutes < 1) return '刚刚'
    if (diffHours < 1) return `${diffMinutes}分钟前`
    if (diffDays < 1) return messageTime.format('HH:mm')
    if (diffMonths < 1) return messageTime.format('MM-DD')
    return messageTime.format('YYYY-MM-DD')
  }

  /**
   * 检查时间间隔
   * @param currentTime 当前消息时间
   * @param prevTime 前一条消息时间
   * @param minutes 分钟阈值
   * @returns 时间差是否大于指定分钟数
   */
  const isTimeGapGreaterThan = (currentTime: string, prevTime: string, minutes: number): boolean => {
    const current = dayjs(currentTime)
    const prev = dayjs(prevTime)
    return current.diff(prev, 'minute') > minutes
  }

  /**
   * 活动类型格式化
   * 将活动类型转换为友好的显示文本
   * @param type 活动类型字符串
   * @returns 格式化后的活动类型文本
   */
  const formatActivityType = (type: ActivityType | string): string => {
    if (type === ActivityType.GroupCreated) return '创建群组'
    if (type === ActivityType.UserJoined) return '加入群组'
    if (type === ActivityType.MessageSent) return '发送消息'
    if (type === ActivityType.UserCheckedIn) return '签到'
    
    // 处理旧版类型 - 为了兼容性
    switch (type) {
      case 'USER_ONLINE': return '上线'
      case 'USER_CHECKIN': return '签到'
      case 'GROUP_CREATE': return '创建群组'
      case 'GROUP_JOIN': return '加入群组'
      case 'GROUP_LEAVE': return '离开群组'
      case 'GROUP_MEMBER_ADDED': return '新成员加入'
      case 'GROUP_MEMBER_REMOVED': return '成员被移除'
      case 'GROUP_UPDATE': return '群组更新'
      case 'FRIEND_REQUEST': return '好友请求'
      case 'FRIEND_ACCEPT': return '接受好友'
      case 'MESSAGE_SENT': return '发送消息'
      default: return String(type)
    }
  }

  return {
    // 基础格式化
    formatRelativeTime,
    formatDistance,
    formatDateTime,
    formatNumber,
    // 聊天应用格式化
    formatTimeDivider,
    formatMessageTime,
    isTimeGapGreaterThan,
    // 业务格式化
    formatActivityType
  }
} 