import GridPosition from '../gridPosition'
import Random from 'canvas-sketch-util/random'

export const Direction = {
  up: 0,
  right: 1,
  down: 2,
  left: 3,
}

export function giveBirth (parents) {
  const childBearingEnergyLevel = 9
  if (parents[0].energy > childBearingEnergyLevel &&
    parents[1].energy > childBearingEnergyLevel) {
    const { grid, id, colour, type, } = parents[0]
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
      grid,
      movementStyle,
      id: id + chars[Random.rangeFloor(0, chars.length - 1)],
      colour, // colour: shiftHue(colour),
    })
    baby.flipMovementStyle()
    return baby
  }
  return null
}

export default class Organism {
  /**
   *
   * @param {GridPosition} initPosition
   */
  constructor ({ initPosition, type, grid, movementStyle, id, colour, }) {
    this.id = id
    this.hash = 'organism'
    this.grid = grid
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

  updateEnergy (amount) {
    if (this.energy + amount < 0) {
      this.energy = 0
      this.lifespan = 0
    } else if (this.energy + amount > 10) {
      this.energy = 10
    } else {
      this.energy += amount
    }
  }

  move () {
    if (this.lifespan && this.movementStyle.length) {
      this.previousPosition = new GridPosition({
        ...this.nextPosition,
      })
      this.applyPosition(this.movementStyle[this.step], this.nextPosition, this.grid)
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

  applyPosition (direction, position, grid) {
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
    this.movementStyle = this.movementStyle.map(dir => {
      if (dir === Direction.left) return Direction.right
      if (dir === Direction.right) return Direction.left
      if (dir === Direction.down) return Direction.up
      if (dir === Direction.up) return Direction.down
    }).reverse()
  }

  /**
   * lifespan in number of steps.
   * @param {Number} lifespan
   */
  feed (lifespan) {
    this.lifespan = this.lifespan + lifespan
  }
}
