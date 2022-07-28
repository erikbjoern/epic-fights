import { CSSProperties } from "vue";
import { useBoardStore } from "../store";
import constants from "../constants"
import Fighter from "./Fighter";

const { GRID_HEIGHT, GRID_WIDTH } = constants

export default class Tile {
  readonly col: number
  readonly id: number
  readonly isCornerTile: boolean
  readonly isEdgeTile: boolean
  readonly isInFirstCol: boolean
  readonly isInFirstRow: boolean
  readonly isInLastCol: boolean
  readonly isInLastRow: boolean
  readonly row: number

  public getFighter: () => Fighter | null
  public isWithinAttackRange: () => boolean
  public isOccupied: () => boolean
  public isAlly: () => boolean
  public isEnemy: () => boolean

  public classes: string[] = []
  public styles: { [T in keyof CSSProperties]?: CSSProperties[T] } = {}

  constructor(id: number, row: number, col: number) {

    this.getFighter = function () {
      const boardStore = useBoardStore()

      return boardStore.fightersKeyedByTileId[this.id] ?? null
    }

    this.isOccupied = function () {
      return !!this.getFighter()?.isAlive
    }

    this.isAlly = function () {
      const fighter = this.getFighter()
      const boardStore = useBoardStore()

      return fighter?.player.id == boardStore.selectedPlayerId
    }

    this.isEnemy = function () {
      const fighter = this.getFighter()
      const boardStore = useBoardStore()

      return !!(fighter?.isAlive && fighter.player.id !== boardStore.selectedPlayerId)
    }

    this.isWithinAttackRange = function () {
      const boardStore = useBoardStore()

      return (boardStore.reachableTilesKeyedById[this.id]?.numberOfStepsAway ?? Infinity) <= (boardStore.selectedPawn?.fighter.range ?? 0)
    }

    this.col = col
    this.id = id
    this.isCornerTile = [1, GRID_HEIGHT].includes(row) && [1, GRID_WIDTH].includes(col)
    this.isInFirstCol = col == 1
    this.isInFirstRow = row == 1
    this.isInLastCol = col == GRID_WIDTH
    this.isInLastRow = row == GRID_HEIGHT
    this.isEdgeTile = this.isInFirstCol || this.isInFirstRow || this.isInLastCol || this.isInLastRow
    this.row = row

    if (this.isCornerTile) {
      this.classes = ['bg-transparent']
    } else if (this.isEdgeTile) {
      this.classes = ['bg-gray-700']
    } else {
      this.classes = ['bg-gray-200']
    }

    Object.seal(this)
  }
}

export const neutralTile = new Tile(-1, -1, -1)
