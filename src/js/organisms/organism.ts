import GridPosition from '../gridPosition'
// @ts-ignore
import Random from 'canvas-sketch-util/random'

export enum Direction {
  up = 0,
  right = 1,
  down = 2,
  left = 3,
}

function getOppositeDirection (direction: Direction): Direction {
  switch(direction) {
    case Direction.up:
      return Direction.down
    case Direction.down:
      return Direction.up
    case Direction.left:
        return Direction.right
    case Direction.right:
      return Direction.left
    default:
    return direction
  }
}

type OrganismParams = {
  initPosition: GridPosition
  type: string
  movementStyle: Array<Direction>
  id: string
  colour: number
}

export function giveBirth (parents: Array<Organism>) {
  const childBearingEnergyLevel = 9
  if (parents[0].energy > childBearingEnergyLevel &&
    parents[1].energy > childBearingEnergyLevel) {
    const { id, colour, type, } = parents[0]
    const { movementStyle, } = parents[1]
    const initPosition = parents[0].nextPosition
    const chars = 'qwerttyuiopasdfghjklzxcvbnm'
    const positionTochange = Random.rangeFloor(0, movementStyle.length - 1)
    movementStyle[positionTochange] = Random.rangeFloor(0, 3)

    parents[0].lifespan -= 1
    parents[0].updateEnergy(-5)
    parents[1].lifespan -= 1
    parents[1].updateEnergy(-5)

    const baby = new Organism({
      initPosition,
      type,
      movementStyle,
      id: id + chars[Random.rangeFloor(0, chars.length - 1)],
      colour, // colour: shiftHue(colour),
    })
    baby.flipMovementStyle()
    if (baby.movementStyle.length > 2) {
      baby.movementStyle[1] = getOppositeDirection(baby.movementStyle[1])
    }
    return baby
  }
  return null
}

export default class Organism {
  id: string;
  hash: 'organism';
  colour: number;
  type: string;
  // in iterations:
  lifespan: number;
  energy: number;
  /**
   * how many coordinates can it move per iteration:
   */
  movementSpeed: number
  step: number
  spriteRef: any

  /**
   * ordered array of route coordinates
   * in the form of GridPosition's
   * serves as a type of memory:
   */
  routeTravelled: Array<any>
  movementStyle: Array<Direction>
  nextPosition: GridPosition
  previousPosition?: GridPosition
  moving: boolean

  constructor ({ initPosition, type, movementStyle, id, colour, } :OrganismParams) {
    this.id = id || ''
    this.hash = 'organism'
    this.colour = colour
    this.type = type
    // in iterations:
    this.lifespan = Random.rangeFloor(3, 40)
    this.energy = 1
    /**
     * how many coordinates can it move per iteration:
     */
    this.movementSpeed = 1
    this.step = 0
    this.spriteRef = null

    /**
     * ordered array of route coordinates
     * in the form of GridPosition's
     * serves as a type of memory:
     */
    this.routeTravelled = [
      initPosition,
    ]
    this.movementStyle = movementStyle
    this.nextPosition = initPosition
    this.moving = false
  }

  updateEnergy (amount: number) {
    if (this.energy + amount < 0) {
      this.energy = 0
      this.lifespan = 0
    } else if (this.energy + amount > 10) {
      this.energy = 10
    } else {
      this.energy += amount
    }
  }

  move (grid: any) {
    if (this.lifespan && this.movementStyle.length) {
      this.previousPosition = new GridPosition({
        ...this.nextPosition,
      })
      this.applyPosition(this.movementStyle[this.step], this.nextPosition, grid)
      this.moving = false

      if (this.movementStyle.length - 1 === this.step) {
        this.step = 0
      } else {
        this.step += 1
      }
    }
    this.lifespan -= 1
    this.updateEnergy(1)
  }

  applyPosition (direction: Direction, position: GridPosition, grid:any) {
    const maxY = grid.height
    const maxX = grid.width
    const bounceOFf = 2
    let changeDirection = false

    if (direction === Direction.up) {
      if (position.y === 0) {
        position.y += bounceOFf
        changeDirection = true
      } else {
        position.y -= 1
      }
    } else if (direction === Direction.right) {
      if (position.x === maxX) {
        position.x -= bounceOFf
        changeDirection = true
      } else {
        position.x += 1
      }
    } else if (direction === Direction.down) {
      if (position.y === maxY) {
        position.y -= bounceOFf
        changeDirection = true
      } else {
        position.y += 1
      }
    } else if (direction === Direction.left) {
// eslint-disable-next-line import/extensions
      if (position.x === 0) {
        position.x += bounceOFf
        changeDirection = true
      } else {
        position.x -= 1
      }
    }
    if (changeDirection) {
      this.flipMovementStyle()
    }
  }

  flipMovementStyle () {
    this.movementStyle = this.movementStyle.map(getOppositeDirection)
  }

  /**
   * lifespan in number of steps.
   */
  feed (lifespan: number) {
    this.lifespan = this.lifespan + lifespan
  }
}
