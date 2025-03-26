import { defineStore } from 'pinia'
import type { MapLocation } from '~/types/map_type'

export const useMapStore = defineStore('map', {
  state: () => ({
    lastLocation: null as MapLocation | null,
    hasShownTip: false
  }),

  // 启用持久化
  persist: true,

  actions: {
    saveLocation(location: MapLocation) {
      this.lastLocation = location
    },

    markTipAsShown() {
      this.hasShownTip = true
    },
    
    getLastLocation(): MapLocation | null {
      return this.lastLocation
    },
    
    getHasShownTip(): boolean {
      return this.hasShownTip
    }
  }
}) 