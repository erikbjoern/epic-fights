import { defineStore } from 'pinia'
import { MainState, MenuType } from './types'
import { useGameStore } from './gameStore';

export * from "./gameStore";
export * from "./boardStore";

export const useStore = defineStore('main', {
  state(): MainState {
    return {
      activeMenu: null,
      initialized: false,
    }
  },
  actions: {
    initializeStore() {
      const gameStore = useGameStore()

      gameStore.initializeGameStore()

      this.initialized = true
    },
    setActiveMenu(newActiveMenu: MenuType) {
      this.activeMenu = newActiveMenu
    },
  },
})