import Fighter from '../models/Fighter'
import { defineStore } from "pinia"
import { getOrthogonallyAdjacentTiles, isWithinGrid, isWithinRangeOrthogonally, throwError } from './helpers'
import { ReachableTile, TTile } from '../models/types'
import { BoardState } from "./types"
import { useGameStore } from "./gameStore";

export const useBoardStore = defineStore('boardStore', {
  state(): BoardState {
    return {
      reachableTiles: [],
      reachableTilesKeyedById: {},
      selectedPawn: null,
      showAbilityOverlay: false,
    }
  },
  actions: {
    calculateReachableTiles(fighter: Fighter) {
      let edgeTiles = [fighter.currentTile]

      // calculate which tiles are reachable (via an unblocked path)
      for (let i = 0; i < fighter.movementPoints; i++) {
        const newEdgeTiles: ReachableTile[] = []

        edgeTiles.forEach(edgeTile => {
          const OrthogonallyAdjacentTiles = getOrthogonallyAdjacentTiles(edgeTile)
          const isAlreadyAdded = (tile: TTile) => !!this.reachableTilesKeyedById[tile.id]

          const accessibleTiles = OrthogonallyAdjacentTiles.filter(tile =>
            isWithinRangeOrthogonally(tile, edgeTile, 1) &&
            !isAlreadyAdded(tile) &&
            tile.isValidForFighter(fighter) &&
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
    calculateTilesWithinDistance(fighter: Fighter) {
      const origin = fighter.currentTile

      const isValidForThisFighter = (tile: TTile) => (!tile.isEdgeTile || (fighter.startingTile.id !== this.selectedPawn?.tile.id && fighter.startingTile.id == tile.id))
      const isWithinDistance = (tile: TTile) => Math.abs(tile.row - origin.row) + Math.abs(tile.col - origin.col) <= fighter.movementPoints

      this.reachableTiles = useGameStore().static.tiles.filter(tile => {
        return isWithinDistance(tile) && isValidForThisFighter(tile)
      })
    },
    resetReachableTiles() {
      this.reachableTiles = []
      this.reachableTilesKeyedById = {}
    },
    selectPawn(fighter: Fighter) {
      if (this.selectedPawn !== null) {
        this.deselectPawn()
      }

      this.selectedPawn = {
        fighter,
        tile: fighter.currentTile,
        player: fighter.player,
      }

      if (fighter.player.isActive()) {
        this.calculateReachableTiles(fighter)
      } else {
        this.calculateTilesWithinDistance(fighter)
      }
    },
    deselectPawn() {
      this.showAbilityOverlay = false
      this.selectedPawn = null
      this.resetReachableTiles()
    },
    attackPawn(defender: Fighter) {
      const attacker = this.selectedPawn?.fighter

      if (!attacker) {
        throwError('NO_ATTACKER', 'boardStore.attackPawn')
      }

      attacker.performAbility(attacker.currentAbility, { target: defender })

      this.deselectPawn()
    },
    moveSelectedPawn(targetTile: TTile) {
      const fighter = this.selectedPawn?.fighter

      if (!fighter) return

      try {
        fighter.moveToTile(targetTile)

        if (fighter.hasEnemyWithinAttackRange()) {
          this.resetReachableTiles()
          this.calculateReachableTiles(fighter)
        } else {
          this.deselectPawn()
        }
      } catch (e) {
        console.error(e)
      }
    }
  },
  getters: {
    fightersKeyedByTileId: () => {
      const gameStore = useGameStore()

      return gameStore.static.tiles.reduce((acc: { [tileId: string]: Fighter | undefined }, tile) => ({
        ...acc,
        [String(tile.id)]: tile.fightersOnTile.find(f => f.isAlive)
      }), {})
    },
    selectedPawnId: state => state.selectedPawn?.fighter.id,
    selectedPlayerId: state => state.selectedPawn?.fighter.player.id,
    activePlayerId: () => useGameStore().activePlayer?.id,
  }
})