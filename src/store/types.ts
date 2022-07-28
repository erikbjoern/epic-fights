import Fighter from "../models/Fighter"
import Tile from "../models/Tile"
import { PlayerClass } from "../models/Player"
import { ReachableTile } from "../models/types"
import { ColorName } from "../constants"

export type MenuType = 'MAIN_MENU' | 'NEW_GAME' | null

export type GroupedPositionBoolean = {
  [col: string]: {
    [row: string]: boolean
  }
}

export type PlayerSlot = {
  defaultColor: ColorName
  tiles: Tile[]
}

export type FighterInPool = {
  fighter: Fighter
  maxCount: number
}

export type MainStoreData = {
  static: {
    fighterPool: FighterInPool[]
    tiles: Tile[]
    playerSlots: PlayerSlot[]
  }
  initialized: boolean
  selectedPawn: {
    fighter: Fighter,
    tile: Tile
  } | null
  reachableTiles: ReachableTile[]
  reachableTilesKeyedById: { [id: string | number]: ReachableTile }
  players: PlayerClass[]
  activeMenu: MenuType
}