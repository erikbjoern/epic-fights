import constants, { ColorName, ColorIntensity } from '../constants'
import Fighter, { Fighter1, Fighter2, Fighter3, Fighter4 } from './Fighter'
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
    const action = gameStore.activePlayer.availableActions[actionName]

    return this.isActive() && !action.isUsed && action.isAllowed()
  }

  public isActive() {
    return useGameStore().activePlayer.id == this.id
  }

  public addFighter(fighterModel: Fighter, tile: Tile) {
    const fighterData = {
      startingTile: tile,
      player: this
    }

    const fighter = (() => {
      switch (fighterModel.fighterId) {
        case 1: return new Fighter1(fighterData)
        case 2: return new Fighter2(fighterData)
        case 3: return new Fighter3(fighterData)
        default: return new Fighter4(fighterData)
      }
    })()

    this.fighters.push(fighter)
  }

  public removeFighter(fighter: Fighter) {
    const indexOfFighter = this.fighters.findIndex(f => f.id == fighter.id)

    if (indexOfFighter !== -1) {
      this.fighters.splice(indexOfFighter, 1)
    }
  }
}

export type PlayerClass = Public<Player>

export const neutralPlayer = new Player({ tiles: [], color: ColorName.gray, slotIndex: Infinity })