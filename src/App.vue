
<template>
  <transition name="fade" mode="out-in" appear>
    <GameMenu v-if="store.initialized && store.activeMenu !== null" class="absolute inset-0 z-50" />
  </transition>
  <label for="showSplashScreen"
    class="absolute right-2 top-0 flex gap-2 select-none cursor-pointer text-gray-700 hover:text-gray-900">
    <input id="showSplashScreen" type="checkbox" v-model="showSplashScreen" />
    <span>Splashscreen</span>
  </label>
  <Title class="opacity-0 mx-auto" />
  <Title class="absolute left-1/2 -translate-x-1/2 transition-[margin] delay-[1s] duration-[2s]"
    :class="[!isMounted && showSplashScreen && 'mt-[40vh]']" />
  <div
    class="xl:w-full flex flex-col justify-center pb-4 xl:grid m-auto xl:p-10 h-full gap-4 items-stretch bg-white transition-opacity duration-[.75s] delay-[3s] ease-linear"
    :class="[isMounted || !showSplashScreen ? 'opacity-100' : 'opacity-0', `w-[${gridSize}]`]" :style="{
      gridTemplateColumns: '1fr min-content 1fr',
      gridTemplateRows: gridSize,
    }">
    <div v-if="store.initialized" id="board-grid"
      class="w-full flex-none col-start-2 grid gap-1 bg-gray-900 p-4 rounded-md mx-auto" :style="{
        gridTemplateColumns: `repeat(${constants.GRID_WIDTH}, 1fr)`,
        gridTemplateRows: `repeat(${constants.GRID_HEIGHT}, 1fr)`,
        height: gridSize,
        width: gridSize
      }">
      <ReachableTileOverlay v-for="tile in boardStore.reachableTiles" :tile="tile"
        :style="{ gridColumnStart: tile.col, gridRowStart: tile.row }" />
      <BoardTile v-for="tile in gameStore.static.tiles" :tile="tile"
        :style="{ gridColumnStart: tile.col, gridRowStart: tile.row }" />
    </div>
    <div class="row-start-1 col-start-1 grid grid-cols-2 xl:grid-cols-1 gap-4 max-w-full">
      <FighterInfo v-for="i in 4" :fighter="fighterData[i as 1 | 2 | 3 | 4]" :key="i" class="flex-1 w-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { fighterData } from './models/Fighter'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useStorage, useWindowSize } from '@vueuse/core'
import constants from "./constants";
import BoardTile from './components/BoardTile.vue'
import FighterInfo from './components/FighterInfo.vue'
import ReachableTileOverlay from './components/ReachableTileOverlay.vue';
import Title from "./components/Title.vue";
import GameMenu from './components/Menues/GameMenu.vue';
import { useStore, useGameStore, useBoardStore } from './store'

const boardStore = useBoardStore()
const gameStore = useGameStore()
const store = useStore()
const showGameMenuOnEsc = (event: KeyboardEvent) => {
  if (event.key == 'Escape') {
    store.setActiveMenu(store.activeMenu === null ? 'MAIN_MENU' : null)
  }
}

const showSplashScreen = useStorage('showSplashScreen', true)
const isMounted = ref(false)

onMounted(() => {
  setTimeout(() => {
    isMounted.value = true
    if (!showSplashScreen.value) {
      store.setActiveMenu('MAIN_MENU')
    }
  }, 0)

  setTimeout(() => {
    store.setActiveMenu('MAIN_MENU')
  }, 3000)

  document.addEventListener('keydown', showGameMenuOnEsc)
})

onUnmounted(() => {
  document.removeEventListener('keydown', showGameMenuOnEsc)
})


const windowSize = useWindowSize()

const gridSize = computed(() => `${Math.ceil(Math.min(windowSize.height.value * 0.7, windowSize.width.value * 0.95))}px`)
</script>

<style>
#board-grid * {
  overflow: hidden;
}
</style>