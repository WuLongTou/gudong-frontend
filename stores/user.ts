import { defineStore } from 'pinia'
import { startTokenRefreshTimer, stopTokenRefreshTimer } from '~/utils/auth/jwt.client'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: '',
    nickname: '',
    sessionToken: '',
    isTemporary: false,
    expiresAt: 0,
  }),

  persist: true,

  getters: {
    isLoggedIn: (state) => !!state.sessionToken,
    currentUser: (state) => ({
      userId: state.userId,
      nickname: state.nickname
    }),
  },

  actions: {
    initTokenRefresh() {
      if (this.sessionToken) {
        startTokenRefreshTimer()
      }
    },

    setUser(userId: string, nickname: string, token: string, isTemporary: boolean, expiresAt?: number) {
      this.userId = userId
      this.nickname = nickname
      this.sessionToken = token
      this.isTemporary = isTemporary
      this.expiresAt = expiresAt || 0
      
      this.initTokenRefresh()
    },

    logout() {
      this.userId = ''
      this.nickname = ''
      this.sessionToken = ''
      this.isTemporary = false
      this.expiresAt = 0
      
      stopTokenRefreshTimer()
    }
  }
}) 