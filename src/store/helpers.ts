import constants from "../constants"
import { GridPosition, TAbility } from "../models/types"
import { useGameStore } from '.'

const { GRID_HEIGHT, GRID_WIDTH } = constants

export function isWithinGrid(position: GridPosition) {
  const { col, row } = position
  const [colMin, rowMin] = [1, 1]
  const [colMax, rowMax] = [GRID_WIDTH, GRID_HEIGHT]

  return col >= colMin && col <= colMax && row >= rowMin && row <= rowMax
}

export function isWithinRangeOrthogonally(positionA: GridPosition, positionB: GridPosition, distance: number) {
  const { col: colA, row: rowA } = positionA
  const { col: colB, row: rowB } = positionB

  return (
    colA == colB + distance && rowA == rowB ||
    colA == colB - distance && rowA == rowB ||
    rowA == rowB + distance && colA == colB ||
    rowA == rowB - distance && colA == colB
  )
}

export function getTileIdFromPosition(position: GridPosition) {
  const { col, row } = position

  return row * GRID_WIDTH - (GRID_WIDTH - col) - 1
}

export function getOrthogonallyAdjacentTiles(position: GridPosition) {
  const gameStore = useGameStore()
  const { col, row } = position

  return [
    gameStore.static.tiles[getTileIdFromPosition({ col: col + 1, row })],
    gameStore.static.tiles[getTileIdFromPosition({ col: col - 1, row })],
    gameStore.static.tiles[getTileIdFromPosition({ row: row + 1, col })],
    gameStore.static.tiles[getTileIdFromPosition({ row: row - 1, col })],
  ].filter(v => !!v)
}

export function throwError(error: string, origin?: string): never {
  if (origin) console.log(`"${origin}" throws:`)

  throw new Error(error);
}

export function validateAbilityUsesLeft(ability: TAbility) {
  if (ability.usesLeftThisTurn < 1) {
    throwError('NO_MORE_USES_THIS_TURN', 'validateAbilityUsesLeft')
  }
  if (ability.usesLeftTotal < 1) {
    throwError('NO_MORE_USES', 'validateAbilityUsesLeft')
  }
}