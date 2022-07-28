<template>
  <div class="group relative flex-none" :style="tile.styles"
    :class="tile.classes, boardStore.selectedPawn?.tile.id == tile.id && 'bg-opacity-90'" :key="tile.id">
    <div v-if="!tile.isCornerTile" class="flex flex-col h-full w-full">
      <FighterPawn v-if="fighterOnThisTile" :fighter="fighterOnThisTile" :tile="tile" class="relative z-20" />
    </div>
  </div>
</template>

<script setup lang="ts">
import FighterPawn from "../components/FighterPawn.vue";
import Tile from '../models/Tile';
import { storeToRefs } from 'pinia';
import { useBoardStore } from '../store';
import { computed } from "vue";

const props = defineProps<{ tile: Tile }>()

const boardStore = useBoardStore()

const { fightersKeyedByTileId } = storeToRefs(boardStore)

const fighterOnThisTile = computed(() => {
  const fighter = fightersKeyedByTileId.value[props.tile.id]

  return fighter?.isAlive ? fighter : null
})
</script>