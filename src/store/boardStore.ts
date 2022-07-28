import { defineStore } from "pinia"
import { getFighterOnTile, getOrthogonallyDiagonalTiles, getTileIdFromPosition, isWithinGrid, isWithinRangeOrthogonally } from './helpers'
import { ReachableTile } from '../models/types'
import Fighter from '../models/Fighter'
import Tile from '../models/Tile'
import { BoardState } from "./types"
import { useGameStore } from "./gameStore";

export const useBoardStore = defineStore('boardStore', {
  state(): BoardState {
    return {
      reachableTiles: [],
      reachableTilesKeyedById: {},
      selectedPawn: null,
    }
  },
  actions: {
    selectPawn(fighter: Fighter, tile: Tile) {
      if (!fighter || !tile) return

      this.selectedPawn = {
        fighter,
        tile,
      }

      this.reachableTiles = []
      this.reachableTilesKeyedById = {}

      let edgeTiles = [tile]

      // calculate which tiles are reachable (via an unblocked path)
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
      const gameStore = useGameStore()
      const attacker = this.selectedPawn?.fighter

      if (!attacker || !defender) return

      const damage = Math.max(0, attacker.attackPoints - defender.defensePoints)

      this.applyDamage(defender, damage)

      if (!defender.isAlive && attacker.range == 1) {
        const defenderTile = gameStore.static.tiles[getTileIdFromPosition(defender.position)]
        this.moveSelectedPawn(defenderTile)
      }

      this.deselectPawn()
    },
  },
  getters: {
    fightersKeyedByTileId: () => {
      const gameStore = useGameStore()

      return gameStore.static.tiles.reduce((acc: { [tileId: string]: Fighter | undefined }, tile) => ({
        ...acc,
        [String(tile.id)]: getFighterOnTile(gameStore.players, tile)
      }), {})
    },
    selectedPawnId: state => state.selectedPawn?.fighter.id,
    selectedPlayerId: state => state.selectedPawn?.fighter.player.id
  }
})