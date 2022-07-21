import constants from "../constants"
import Tile from "../models/Tile"
import { PlayerClass } from "../models/Player"
import { GridPosition } from "../models/types"
import { useStore } from '.'

const { GRID_HEIGHT, GRID_WIDTH } = constants

export function getFighterOnTile(players: PlayerClass[], tile: Tile) {
  let fighter = undefined
  let playerIndex = 0

  while (fighter === undefined) {
    const player = players[playerIndex]

    if (!player) break

    fighter = player?.fighters.find(fighter => fighter.isOnTile(tile))

    playerIndex++
  }

  return fighter
}

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

function getTileIdFromPosition(position: GridPosition) {
  const { col, row } = position

  return row * GRID_WIDTH - (GRID_WIDTH - col) - 1
}

export function getOrthogonallyDiagonalTiles(position: GridPosition) {
  const store = useStore()
  const { col, row } = position

  return [
    store.tiles[getTileIdFromPosition({ col: col + 1, row })],
    store.tiles[getTileIdFromPosition({ col: col - 1, row })],
    store.tiles[getTileIdFromPosition({ row: row + 1, col })],
    store.tiles[getTileIdFromPosition({ row: row - 1, col })],
  ].filter(v => !!v)
}