import { defineStore } from "pinia"
import constants, { ColorName } from '../constants'
import { Fighter1, Fighter2, Fighter3, Fighter4 } from '../models/Fighter'
import { PlayerClass } from "../models/Player"
import Tile from '../models/Tile'
import { GameState, PlayerAction } from "./types"
import { useBoardStore } from ".";

export const useGameStore = defineStore('gameStore', {
  state(): GameState {
    return {
      activePlayer: {
        id: null,
        availableActions: {
          movement: {
            isUsed: false,
            isAllowed: () => !useGameStore().activePlayer.availableActions.attack.isUsed,
          },
          attack: {
            isUsed: false,
            isAllowed: () => true
          }
        }
      },
      currentTurn: 0,
      players: [],
      randomizedTurnOrderOffset: 0,
      static: {
        fighterPool: [],
        tiles: [],
        playerSlots: [
          {
            defaultColor: ColorName.sky,
            tiles: [],
          },
          {
            defaultColor: ColorName.lime,
            tiles: [],
          },
          {
            defaultColor: ColorName.amber,
            tiles: [],
          },
          {
            defaultColor: ColorName.rose,
            tiles: [],
          },
        ]
      }
    }
  },
  actions: {
    initializeGameStore() {
      const { GRID_HEIGHT, GRID_WIDTH } = constants

      let tileId = 0

      for (let row = 1; row <= GRID_HEIGHT; row++) {
        for (let col = 1; col <= GRID_WIDTH; col++) {
          this.static.tiles.push(new Tile(tileId++, row, col))
        }
      }

      this.static.playerSlots[0].tiles = this.static.tiles.filter(tile => !tile.isCornerTile && tile.isInFirstRow)
      this.static.playerSlots[1].tiles = this.static.tiles.filter(tile => !tile.isCornerTile && tile.isInLastRow)
      this.static.playerSlots[2].tiles = this.static.tiles.filter(tile => !tile.isCornerTile && tile.isInFirstCol)
      this.static.playerSlots[3].tiles = this.static.tiles.filter(tile => !tile.isCornerTile && tile.isInLastCol)

      const fighters = [new Fighter1(), new Fighter2(), new Fighter3, new Fighter4()]
      fighters.forEach(f => this.static.fighterPool.push({ fighter: f, maxCount: 2 }))
    },
    nextTurn() {
      this.currentTurn++

      const newActivePlayer = this.players.find(p => (p.slotIndex + 1) == (((this.currentTurn + this.randomizedTurnOrderOffset) % this.players.length) || this.players.length)) as PlayerClass

      this.activePlayer = { ...this.activePlayer, id: newActivePlayer.id }

      this.resetPlayerActions()

      useBoardStore().deselectPawn()
    },
    resetPlayerActions() {
      Object.keys(this.activePlayer.availableActions).forEach((action) => {
        this.activePlayer.availableActions[action as PlayerAction].isUsed = false
      })
    },
    spendAction(action: PlayerAction) {
      this.activePlayer.availableActions[action].isUsed = true

      const allAvailableActionsAreSpent = Object.values(this.activePlayer.availableActions).every(action => {
        return action.isUsed || !action.isAllowed()
      })

      if (allAvailableActionsAreSpent) {
        this.nextTurn()
      }
    },
    startGame() {
      this.players.forEach(player => player.assignTileColors())
      this.currentTurn = 0

      this.randomizedTurnOrderOffset = Math.floor(Math.random() * this.players.length)

      this.nextTurn()
    },
  }
})