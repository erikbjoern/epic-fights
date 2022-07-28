import constants, { ColorName } from '../constants'
import Fighter from '../models/Fighter'
import Tile from '../models/Tile'
import { defineStore } from 'pinia'
import { MainStoreData, MenuType } from './types'
import { getFighterOnTile, getOrthogonallyDiagonalTiles, getTileIdFromPosition, isWithinGrid, isWithinRangeOrthogonally } from './helpers'
import { ReachableTile } from '../models/types'
import { Fighter1, Fighter2, Fighter3, Fighter4 } from '../models/Fighter'

export const useStore = defineStore('main', {
  state(): MainStoreData {
    return {
      activeMenu: null,
      initialized: false,
      players: [],
      reachableTiles: [],
      reachableTilesKeyedById: {},
      selectedPawn: null,
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
    initializeStore() {
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

      this.initialized = true
    },
    startGame() {
      this.players.forEach(player => player.assignTileColors())
    },
    selectPawn(fighter: Fighter, tile: Tile) {
      if (!fighter || !tile) return

      this.selectedPawn = {
        fighter,
        tile,
      }

      this.reachableTiles = []
      this.reachableTilesKeyedById = {}

      let edgeTiles = [tile]

      for (let i = 0; i < fighter.movementPoints; i++) {
        const newEdgeTiles: ReachableTile[] = []

        edgeTiles.forEach(edgeTile => {
          const orthogonallyDiagonalTiles = getOrthogonallyDiagonalTiles(edgeTile)
          const isAlreadyAdded = (tile: Tile) => !!this.reachableTilesKeyedById[tile.id]
          const isValidForThisFighter = (tile: Tile) => (!tile.isEdgeTile || (fighter.startingTile.id !== this.selectedPawn?.tile.id && fighter.startingTile.id == tile.id))

          const accessibleTiles = orthogonallyDiagonalTiles.filter(tile =>
            isWithinRangeOrthogonally(tile, edgeTile, 1) &&
            !isAlreadyAdded(tile) &&
            isValidForThisFighter(tile) &&
            isWithinGrid(tile)
          )

          accessibleTiles.forEach(tile => {
            const reachableTile = { ...tile, numberOfStepsAway: i + 1 }

            if (!tile.isOccupied()) {
              newEdgeTiles.push(reachableTile)
            }

            this.reachableTiles.push(reachableTile)
            this.reachableTilesKeyedById[tile.id] = reachableTile
          })
        })

        edgeTiles = newEdgeTiles
      }
    },
    deselectPawn() {
      this.selectedPawn = null
      this.reachableTiles = []
    },
    moveSelectedPawn(targetTile: Tile) {
      const targetFighter = this.selectedPawn?.fighter
      const { col, row } = targetTile

      if (!targetFighter) return

      [targetFighter.position.col, targetFighter.position.row] = [col, row]
      this.deselectPawn()
    },
    applyDamage(defender: Fighter, damage: number) {
      defender.healthPoints -= damage

      if (defender.healthPoints <= 0) {
        defender.isAlive = false
      }
    },
    attackPawn(defender: Fighter) {
      const attacker = this.selectedPawn?.fighter

      if (!attacker || !defender) return

      const damage = Math.max(0, attacker.attackPoints - defender.defensePoints)

      this.applyDamage(defender, damage)

      if (!defender.isAlive && attacker.range == 1) {
        const defenderTile = this.static.tiles[getTileIdFromPosition(defender.position)]
        this.moveSelectedPawn(defenderTile)
      }

      this.deselectPawn()
    },
    setActiveMenu(newActiveMenu: MenuType) {
      this.activeMenu = newActiveMenu
    },
  },
  getters: {
    fightersOnTiles: state => {
      return state.static.tiles.reduce((acc: { [tileId: string | number]: Fighter | undefined }, tile) => ({
        ...acc,
        [String(tile.id)]: getFighterOnTile(state.players, tile)
      }), {})
    },
    selectedPawnId: state => state.selectedPawn?.fighter.id,
    selectedPlayerId: state => state.selectedPawn?.fighter.player.id
  }
})