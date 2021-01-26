import GridPosition from '../gridPosition'
import Random from 'canvas-sketch-util/random'

export const Direction = {
  up: 0,
  right: 1,
  down: 2,
  left: 3,
}

function applyPosition (direction, position, grid) {
  const maxY = grid.height - 1
  const maxX = grid.width - 1
  // debugger
  if (direction === Direction.up) {
    if (position.y === 0) {
      position.y += 1
    } else {
      position.y -= 1
    }
  } else if (direction === Direction.right) {
    if (position.x === maxX) {
      position.x -= 1
    } else {
      position.x += 1
    }
  } else if (direction === Direction.down) {
    if (position.y === maxY) {
      position.y -= 1
    } else {
      position.y += 1
    }
  } else if (direction === Direction.left) {
    if (position.x === 0) {
      position.x += 1
    } else {
      position.x -= 1
    }
  }
}

export default class Organism {
  /**
   *
   * @param {GridPosition} initPosition
   */
  constructor ({ initPosition, grid, movementStyle, id, }) {
    this.id = id
    this.hash = 'organism'
    this.grid = grid
    // in iterations:
    this.lifespan = 10000
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
    this.routeTravelled = [initPosition, ]
    this.movementStyle = movementStyle
    this.nextPosition = initPosition
    this.moving = false
  }

  move () {
    if (this.lifespan && this.movementStyle.length) {
      
      this.previousPosition = new GridPosition({
        ...this.nextPosition,
      })
      // console.log(this.movementStyle[this.nextNextStep])
      applyPosition(this.movementStyle[this.step], this.nextPosition, this.grid)
      this.lifespan -= 1
      this.moving = false

      if (this.movementStyle.length - 1 === this.step) {
        this.step = 0
      } else {
        this.step += 1
      }
    }
  }

  /**
   * lifespan in number of steps.
   * @param {Number} lifespan
   */
  feed (lifespan) {
    this.lifespan = this.lifespan + lifespan
  }

  // by cloning itself
  giveBirth () {
    const chars = 'qwerttyuiopasdfghjklzxcvbnm'
    const child = Object.assign({}, this)
    child.hash = child.hash + chars[Random.rangeFloor(0, chars.length - 1)]
    child.nextPosition.x += 1
    return child
  }
}
