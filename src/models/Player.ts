import constants, { ColorName, ColorIntensity } from '../constants'
import fighterService from "../services/fighterService";
import Fighter from './Fighter'
import Tile from './Tile'
import { nanoid } from 'nanoid'
import { Public } from './types'
import { useGameStore } from '../store'
import { PlayerAction } from '../store/types'

export default class Player {
  public id: string
  public name: string
  public slotIndex: number
  public tiles: Tile[]
  public color: ColorName
  public fighters: Fighter[] = []

  constructor(initialData: { tiles: Tile[], color: ColorName, slotIndex: number }) {
    this.id = nanoid()
    this.name = `Player ${initialData.slotIndex + 1}`
    this.color = initialData.color
    this.slotIndex = initialData.slotIndex
    this.tiles = initialData.tiles
  }

  public assignTileColors() {
    this.tiles.forEach(tile => {
      tile.styles['background-color'] = constants.COLORS[this.color][500]
    })
  }

  public colorValue(intensity: ColorIntensity = 500, opacity = 100) {
    if (opacity < 0 || opacity > 100) {
      console.error('invalid opacity for colorValue:', opacity)
      opacity = 100
    }

    const opacityInHex = Math.round(opacity * 2.55).toString(16)

    return `${constants.COLORS[this.color][intensity]}${opacityInHex}`
  }

  public canPerformAction(actionName: PlayerAction) {
    const gameStore = useGameStore()
    const action = gameStore.activePlayerData.availableActions[actionName]

    return this.isActive() && !action.isUsed && action.isAllowed()
  }

  public isActive() {
    return useGameStore().activePlayer?.id == this.id
  }

  public addFighter(fighterModel: Fighter, tile: Tile) {
    this.fighters.push(
      fighterService.createFighter({
        fighterId: fighterModel.fighterId,
        startingTile: tile,
        player: this
      })
    )
  }

  public removeFighter(fighter: Fighter) {
    const indexOfFighter = this.fighters.findIndex(f => f.id == fighter.id)

    if (indexOfFighter !== -1) {
      fighter.currentTile.removeFighter(fighter)

      this.fighters.splice(indexOfFighter, 1)
    }
  }
}

export type PlayerType = Public<Player>

export const neutralPlayer = new Player({ tiles: [], color: ColorName.gray, slotIndex: Infinity })