<template>
  <BaseMenu heading="New Game" :menu-name="MenuName.NEW_GAME">
    <div class="text-left flex flex-col gap-1">
      <div v-for="(player, i) in players" class="p-2 border flex flex-col gap-2 border-gray-400 rounded"
        :style="{ color: player.colorValue(900), backgroundColor: player.colorValue(200) }">
        <div class="flex justify-between">
          <input v-model="player.name" class="bg-transparent border-b" :style="{ borderColor: player.colorValue() }">
          <button v-if="i > 1" @click="gameStore.removePlayer(player)"
            class="px-1 py-0 leading-none -mx-1 -mt-1 hover:bg-white rounded hover:bg-opacity-50">
            <svg class="fill-current w-4 h-4" viewBox="0 0 24 24" height="12" width="12"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" />
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <div v-for="tile in player.tiles" class="flex relative transition-colors cursor-pointer"
            :class="selectedTiles[player.id] == tile.id && 'shadow-inner'"
            :style="{ height: tileSize, width: tileSize, backgroundColor: selectedTiles[player.id] == tile.id ? player.colorValue(300) : player.colorValue() }"
            @click="selectTile(player, tile)">
            <FighterToken class="m-auto" v-if="getFighter(tile)" :fighter="getFighter(tile)" />
          </div>
        </div>
        <hr class="border-gray-400" />
        <div class="grid grid-cols-4 gap-2">
          <div v-for="fighterInPool in availableFighters" class="flex bg-white bg-opacity-50 relative"
            :class="numberOfFightersLeft(player, fighterInPool) === 0 ? 'opacity-40 cursor-default' : 'cursor-pointer'"
            @click="selectFighter(player, fighterInPool)" :style="{ height: tileSize, width: tileSize }">
            <p class="absolute right-0 bottom-0 leading-none m-1 font-bold text-cyan-500 text-clamp-sm">x{{
                numberOfFightersLeft(player, fighterInPool)
            }}
            </p>
            <FighterToken class="m-auto" :fighter="fighterInPool.fighter" />
          </div>
        </div>
      </div>

      <button v-if="players.length < gameStore.static.playerSlots.length" @click="gameStore.addPlayer"
        class="self-center mx-auto p-2 hover:bg-gray-100 rounded flex items-center gap-1 text-cyan-600">
        <svg class="fill-current h-4 w-4" viewBox="0 0 24 24" height="12" width="12" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 4C12.5523 4 13 4.44772 13 5V11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H13V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H11V5C11 4.44772 11.4477 4 12 4Z" />
        </svg>
        <span> Add Player</span>
      </button>
    </div>
    <BaseButton :disabled="!allPlayersHaveFourFighters" class="font-[bangers] mt-2 inverted"
      :color="constants.COLORS.amber[500]" @click="startGame">
      Start!
    </BaseButton>
  </BaseMenu>
</template>

<script setup lang="ts">
import BaseButton from "../BaseButton.vue";
import BaseMenu from "./BaseMenu.vue";
import constants from '../../constants'
import Fighter from "../../models/Fighter";
import FighterToken from "../FighterToken.vue";
import { computed, reactive } from "vue";
import { TPlayer } from "../../models/Player";
import { FighterInPool, MenuName } from "../../store/types";
import { useStore, useGameStore } from '../../store'
import { useWindowSize } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { TTile } from "../../models/types";

const store = useStore()
const gameStore = useGameStore()

const { players } = storeToRefs(gameStore)

function getFighter(tile: TTile) {
  return tile.fightersOnTile.find(f => f.isAlive) as Fighter
}

const availableFighters = gameStore.static.fighterPool
const numberOfFightersLeft = (player: TPlayer, fighterData: FighterInPool) => {
  const numberOfFightersUsed = player.fighters.filter(f => f.fighterId == fighterData.fighter.fighterId).length

  return fighterData.maxCount - numberOfFightersUsed
}

const selectedTiles = reactive<{ [playerId: string]: number | null }>({})
function selectTile(player: TPlayer, targetTile: TTile) {
  const currentlySelectedTile = player.tiles.find(t => t.id == selectedTiles[player.id])
  const fighterOnCurrentlySelectedTile = currentlySelectedTile?.fightersOnTile.find(f => f.isAlive) ?? null
  const targetTileIsTheCurrentlySelected = selectedTiles[player.id] === targetTile.id

  if (!currentlySelectedTile) {
    selectedTiles[player.id] = targetTile.id
    return
  }

  if (!targetTileIsTheCurrentlySelected && !fighterOnCurrentlySelectedTile) {
    selectedTiles[player.id] = targetTile.id
    return
  }


  if (targetTileIsTheCurrentlySelected && !fighterOnCurrentlySelectedTile) {
    selectedTiles[player.id] = null
    return
  }

  if (targetTileIsTheCurrentlySelected && fighterOnCurrentlySelectedTile) {
    player.removeFighter(fighterOnCurrentlySelectedTile)
    return
  }

  if (!targetTileIsTheCurrentlySelected && fighterOnCurrentlySelectedTile) {
    player.removeFighter(fighterOnCurrentlySelectedTile)

    const fighterOnTargetTile = targetTile?.fightersOnTile.find(f => f.isAlive) ?? null

    if (fighterOnTargetTile) {
      player.removeFighter(fighterOnTargetTile)
      player.addFighter(fighterOnTargetTile, currentlySelectedTile)
    }

    player.addFighter(fighterOnCurrentlySelectedTile, targetTile)

    selectedTiles[player.id] = null
  }
}

function selectFighter(player: TPlayer, fighterInPool: FighterInPool) {
  const currentlySelectedTile = player.tiles.find(t => t.id == selectedTiles[player.id])

  if (!currentlySelectedTile && numberOfFightersLeft(player, fighterInPool) <= 0) {
    return
  }

  const targetTile = currentlySelectedTile || player.tiles.find(tile => !tile.isOccupied())

  if (targetTile) {
    const fighterOnTargetTile = targetTile.fightersOnTile.find(f => f.isAlive) ?? null
    if (fighterOnTargetTile) {
      player.removeFighter(fighterOnTargetTile)
    }

    player.addFighter(fighterInPool.fighter, targetTile)
  }

  selectedTiles[player.id] = null
}

const allPlayersHaveFourFighters = computed(() => players.value.every(p => p.fighters.length == 4))

function startGame() {
  gameStore.startGame()
  store.setActiveMenu(MenuName.null)
}

const windowSize = useWindowSize()

const minScreenSize = computed(() => Math.min(windowSize.height.value, windowSize.width.value))
const tileSize = computed(() => `${Math.round(minScreenSize.value * 0.12)}px`)
</script>