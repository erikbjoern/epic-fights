import Ability from "../models/Ability";
import Tile from "./Tile";

/** starting on 1 / 1 */
export type GridPosition = { row: number, col: number }

export type PlayerColor = 'blue' | 'green' | 'red' | 'yellow' | 'gray'

export type FighterData = {
  tier: number,
  fighterId: number,
  attackPoints: number,
  movementPoints: number,
  defensePoints: number,
  range: number,
  abilities?: {
    [name: string]: Ability
  }
}

export type Public<T> = { [P in keyof T]: T[P] }

export type ReachableTile = (Tile & {
  numberOfStepsAway?: number
})