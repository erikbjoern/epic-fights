import { defineStore } from "pinia"
import constants, { ColorName } from '../constants'
import { Fighter1, Fighter2, Fighter3, Fighter4 } from '../models/Fighter'
import Tile from '../models/Tile'
import { GameState } from "./types"

export const useGameStore = defineStore('gameStore', {
  state(): GameState {
    return {
      players: [],
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
    startGame() {
      this.players.forEach(player => player.assignTileColors())
    },
  }
})