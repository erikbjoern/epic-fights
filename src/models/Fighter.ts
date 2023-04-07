import Ability from './Ability'
import constants from '../constants'
import { neutralTile } from './Tile'
import { TPlayer, neutralPlayer } from './Player'
import { TAbility, FighterData, Passivity, AbilityType, Rarity, TTile } from './types'
import { nanoid } from 'nanoid'
import { useGameStore } from '../store'
import { PlayerAction } from '../store/types'
import { getOrthogonallyAdjacentTiles, throwError, validateAbilityUsesLeft } from '../store/helpers'

export default class Fighter {
  public healthPoints: number
  public isAlive = true
  public player: TPlayer
  public currentTile: TTile
  public currentAbility: TAbility
  public defaultAbility: TAbility

  readonly abilities: TAbility[]
  readonly attackPoints: number
  readonly defensePoints: number
  readonly fighterId: number
  readonly healthPointsMax: number
  readonly id: string
  readonly movementPoints: number
  readonly startingTile: TTile
  readonly tier: number

  constructor(initialData: FighterData & {
    startingTile?: TTile
    player?: TPlayer
  }) {
    this.abilities = initialData.abilities?.map((a, i) => new Ability({ ...a, indexOnFighter: i }, this)) ?? []

    const basicAttack = this.abilities.find(a => a.rarity == Rarity.BASIC && a.abilityTypes.includes(AbilityType.ATTACK_REPLACEMENT))

    if (!basicAttack) {
      throwError('NO_BASIC_ATTACK', 'Fighter.constructor')
    }

    this.defaultAbility = basicAttack

    this.attackPoints = initialData.attackPoints
    this.currentAbility = this.defaultAbility
    this.currentTile = neutralTile
    this.defensePoints = initialData.defensePoints
    this.fighterId = initialData.fighterId
    this.healthPoints = constants.DEFAULT_HP
    this.healthPointsMax = constants.DEFAULT_HP
    this.id = nanoid()
    this.movementPoints = initialData.movementPoints
    this.player = initialData.player ?? neutralPlayer
    this.startingTile = initialData.startingTile ?? neutralTile
    this.tier = initialData.tier

    this.moveToTile(this.startingTile, { isAnAction: false })
  }

  /**
   * applyHealing
   */
  public applyHealing(ability: TAbility) {
    const restoration = Math.max(0, ability.restoration)
    const missingHP = this.healthPointsMax - this.healthPoints

    this.healthPoints += Math.min(restoration, missingHP)
  }

  public moveToTile(targetTile: TTile, options: { isAnAction: boolean } = { isAnAction: true }) {
    if (options.isAnAction && !this.player.canPerformAction(PlayerAction.movement)) {
      throwError('NOT_ENOUGH_ACTION_POINTS', 'Fighter.moveToTile')
    }

    try {
      targetTile.addFighter(this)
      this.currentTile.removeFighter(this)
      this.currentTile = targetTile

      const gameStore = useGameStore()

      if (options.isAnAction) {
        gameStore.spendAction(PlayerAction.movement)
      }
    } catch (e) {
      console.error(e)
    }
  }

  public changeAttack(newAttack: TAbility) {
    ;[newAttack.indexOnFighter, this.currentAbility.indexOnFighter] = [this.currentAbility.indexOnFighter, newAttack.indexOnFighter]

    this.currentAbility = newAttack
  }

  public getFullDamageValue(ability: TAbility) {
    return Math.max(0, this.attackPoints + ability.damageBuff + this.getPassiveDamageModification())
  }

  /**
   * hasEnemyWithinAttackRange
   * @returns boolean
   */
  public hasEnemyWithinAttackRange() {
    return getOrthogonallyAdjacentTiles(this.currentTile)
      .some(t => !t.isEdgeTile && t.fightersOnTile
        .some(f => f.player.id !== this.player.id && f.isAlive)
      )
  }

  public hasAttackReplacements() {
    return this.abilities.filter(a => a.abilityTypes.includes(AbilityType.ATTACK_REPLACEMENT)).length > 1
  }

  public canMove() {
    return getOrthogonallyAdjacentTiles(this.currentTile)
      .some(t => !t.isOccupied() && t.isValidForFighter(this))
  }

  /**
   * doNewTurnUpkeep
   */
  public doNewTurnUpkeep() {
    this.abilities.forEach(a => a.doNewTurnUpkeep())
  }

  /**
   * doNewGameUpkeep
   */
  public doNewGameUpkeep() {
    this.returnToStartingTile()
    this.isAlive = true
    this.healthPoints = this.healthPointsMax
  }

  /**
   * performAbility
   */
  public performAbility(ability: TAbility, params?: { target: Fighter }) {
    try {

      validateAbilityUsesLeft(ability)

      if (!this.player.isActive()) {
        throwError('PLAYER_NOT_ACTIVE', 'Fighter.performAbility')
      }

      if (ability.passivity !== Passivity.ACTIVE) {
        throwError('ABILITY_IS_NOT_AN_ACTIVE_ABILITY', 'Fighter.performAbility')
      }

      if (ability.abilityTypes.includes(AbilityType.HEAL)) {
        this.applyHealing(ability)
      }

      if (ability.abilityTypes.includes(AbilityType.ATTACK_REPLACEMENT)) {
        const { target } = params ?? {}

        if (!target) {
          throwError('NO_TARGET', 'Fighter.performAbility')
        }

        const attackDamage = this.getFullDamageValue(ability)
        const damage = Math.max(0, attackDamage - target.defensePoints)

        target.applyDamage(damage)

        if (!target.isAlive && ability.range == 1) {
          this.moveToTile(target.currentTile)
        }
      }

      ability.expendUse()

      if (ability.abilityTypes.includes(AbilityType.ATTACK_REPLACEMENT) && !ability.usesLeftTotal) {
        this.changeAttack(this.defaultAbility)
      }
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * applyDamage
   */
  public applyDamage(damage: number) {
    const gameStore = useGameStore()

    this.healthPoints -= damage

    if (this.healthPoints <= 0) {
      this.isAlive = false
    }

    gameStore.evaluateWinCondition()
  }

  public returnToStartingTile() {
    if (this.currentTile !== this.startingTile) {
      this.moveToTile(this.startingTile, { isAnAction: false })
    }
  }

  public getPassiveDamageModification() {
    const activePassives = this.abilities.filter(a => a.passivity == Passivity.PASSIVE && a.isAvailable())

    return activePassives.reduce((a, b) => a + b.damageBuff, 0)
  }
}
