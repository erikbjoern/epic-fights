<template>
  <div class="menu-body">
    <h1 class="font-bold mb-2">New Game</h1>
    <div class="text-left flex flex-col gap-1">
      <div v-for="(player, i) in chosenPlayers" class="p-2 border flex flex-col gap-2 border-gray-400 rounded"
        :style="{ backgroundColor: player.colorValue(200) }">
        <div class="flex justify-between">
          <h2 class="text-clamp-md">Player {{ i + 1 }}</h2>
          <button v-if="i > 1" @click="removePlayer(player)"
            class="px-1 py-0 leading-none -mx-1 -mt-1 hover:bg-white rounded hover:bg-opacity-50">
            <div>&times;</div>
          </button>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <div v-for="tile in player.tiles" class="h-[12vw] w-[12vw] flex relative transition-colors cursor-pointer"
            :class="selectedTiles[player.id] == tile.id && 'shadow-inner'"
            :style="{ backgroundColor: selectedTiles[player.id] == tile.id ? player.colorValue(300) : player.colorValue() }"
            @click="selectTile(player, tile)">
            <FighterToken class="m-auto" v-if="getFighter(player, tile)" :fighter="getFighter(player, tile)" />
          </div>
        </div>
        <hr class="border-gray-400" />
        <div class="grid grid-cols-4 gap-2">
          <div v-for="fighterInPool in availableFighters" class="h-[12vw] w-[12vw] flex bg-white bg-opacity-50 relative"
            :class="numberOfFightersLeft(player, fighterInPool) === 0 ? 'opacity-40 cursor-default' : 'cursor-pointer'"
            @click="selectFighter(player, fighterInPool)">
            <p class="absolute right-0 bottom-0 leading-none m-1 font-bold text-cyan-500 text-clamp-sm">x{{
                numberOfFightersLeft(player, fighterInPool)
            }}
            </p>
            <FighterToken class="m-auto" :fighter="fighterInPool.fighter" />
          </div>
        </div>
      </div>

      <button v-if="chosenPlayers.length < gameStore.static.playerSlots.length" @click="addPlayer"
        class="self-center mx-auto p-2 hover:bg-gray-100 rounded flex items-center gap-2 text-cyan-600">
        <span class="-translate-y-px">&plus;</span><span> Add Player</span>
      </button>
    </div>
    <button :disabled="!allPlayersHaveAtLeastOneFighter" class="font-[bangers] mt-2 btn-cyan" @click="startGame">
      Start!
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import Player, { PlayerClass } from "../../models/Player";
import FighterToken from "../FighterToken.vue";
import Tile from "../../models/Tile";
import Fighter from "../../models/Fighter";
import { FighterInPool } from "../../store/types";
import { getFighterOnTile } from "../../store/helpers";
import { useStore, useGameStore } from '../../store'

const store = useStore()
const gameStore = useGameStore()

const chosenPlayers = ref<PlayerClass[]>([])

function addPlayer() {
  const playerSlotIndex = gameStore.static.playerSlots.findIndex((_, i) => !chosenPlayers.value.some(p => p.slotIndex == i))

  if (playerSlotIndex !== -1) {
    const slot = gameStore.static.playerSlots[playerSlotIndex]
    chosenPlayers.value.push(new Player({
      color: slot.defaultColor,
      tiles: slot.tiles,
      slotIndex: playerSlotIndex
    }))
  }
}
addPlayer()
addPlayer()

function removePlayer(player: PlayerClass) {
  const index = chosenPlayers.value.findIndex(p => p.id == player.id)

  if (index !== -1) {
    chosenPlayers.value.splice(index, 1)
  }
}

function getFighter(player: PlayerClass, tile: Tile) {
  return player.fighters.find(f => f.isOnTile(tile)) as Fighter
}

const availableFighters = gameStore.static.fighterPool
const numberOfFightersLeft = (player: PlayerClass, fighterData: FighterInPool) => {
  const numberOfFightersUsed = player.fighters.filter(f => f.fighterId == fighterData.fighter.fighterId).length

  return fighterData.maxCount - numberOfFightersUsed
}

const selectedTiles = reactive<{ [playerId: string]: number | null }>({})
function selectTile(player: PlayerClass, targetTile: Tile) {
  const currentlySelectedTile = player.tiles.find(t => t.id == selectedTiles[player.id])
  const fighterOnCurrentlySelectedTile = currentlySelectedTile ? getFighterOnTile([player], currentlySelectedTile) : null
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

    const fighterOnTargetTile = getFighterOnTile([player], targetTile)

    if (fighterOnTargetTile) {
      player.removeFighter(fighterOnTargetTile)
      player.addFighter(fighterOnTargetTile, currentlySelectedTile)
    }

    player.addFighter(fighterOnCurrentlySelectedTile, targetTile)

    selectedTiles[player.id] = null
  }
}

function selectFighter(player: PlayerClass, fighterInPool: FighterInPool) {
  if (numberOfFightersLeft(player, fighterInPool) <= 0) return

  const targetTile = player.tiles.find(tile => selectedTiles[player.id] ? tile.id == selectedTiles[player.id] : !getFighterOnTile([player], tile))

  if (targetTile) {
    player.addFighter(fighterInPool.fighter, targetTile)
  }

  selectedTiles[player.id] = null
}

const allPlayersHaveAtLeastOneFighter = computed(() => !!chosenPlayers.value.every(p => p.fighters.length))

function startGame() {
  gameStore.players.push(...chosenPlayers.value)
  gameStore.startGame()
  store.activeMenu = null
}
</script>