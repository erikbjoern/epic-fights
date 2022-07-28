<template>
  <transition :name="tile.isEnemy() && tile.isWithinAttackRange() ? 'fade' : 'fade-30'" appear>
    <div @click="moveSelectedPawn" class="p-2 z-20 bg-gray-200 grid group cursor-pointer"
      :class="tile.isEnemy() && tile.isWithinAttackRange() ? 'opacity-100' : 'opacity-30'"
      :style="{ transitionDelay: `${(tile.numberOfStepsAway ?? 1) * 50}ms` }" :key="boardStore.selectedPawnId">
      <div
        class="bg-white h-1/2 w-1/2 m-auto opacity-0 shadow-inner group-hover:opacity-40 rounded-full col-start-1 row-start-1" />
      <div v-if="tile.isEnemy() && tile.isWithinAttackRange()"
        class="bg-red-700 rounded-lg  h-full w-full col-start-1 row-start-1" />
      <div v-else-if="!tile.isOccupied()" :style="{ backgroundColor: playerColor }"
        class="rounded-lg  h-full w-full col-start-1 row-start-1" />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ReachableTile } from '../models/types'
import { useBoardStore, useGameStore } from "../store";

const props = defineProps<{ tile: ReachableTile }>()
const boardStore = useBoardStore()
const gameStore = useGameStore()

function moveSelectedPawn() {
  boardStore.moveSelectedPawn(props.tile)
}

const isMounted = ref(false)
onMounted(() => {
  setTimeout(() => isMounted.value = true, 0)
})

const playerColor = computed(() => boardStore.selectedPlayerId ? gameStore.players.find(p => p.id == boardStore.selectedPlayerId)?.colorValue() : '')
</script>

<style>
.fade-30-enter-to,
.fade-30-leave-from {
  opacity: .3;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.fade-30-enter-active,
.fade-enter-active {
  transition: opacity 300ms;
}

.fade-30-enter-from,
.fade-30-leave-to,
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>