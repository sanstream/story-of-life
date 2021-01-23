import GridPosition from '../gridPosition'
import Random from 'canvas-sketch-util/random'

const Direction = {
  up: 0,
  right: 1,
  down: 2,
  left: 3
}

function updatePosition (orientation, position, grid) {
  const maxY = grid.height - 1
  const maxX = grid.width - 1
  if (orientation === Direction.up) {
    if (position.y === 0) {
      position.y = maxY
    } else {
      position.y--
    }
  } else if (orientation === Direction.right) {
    if (position.x === maxX) {
      position.x = 0
    } else {
      position.x++
    }
  } else if (orientation === Direction.down) {
    if (position.y === maxY) {
      position.y = 0
    } else {
      position.y++
    }
  } else if (orientation === Direction.left) {
    if (position.x === 0) {
      position.x = maxX
    } else {
      position.x--
    }
  }
}

export default class Organism {
  /**
   *
   * @param {GridPosition} initPosition
   */
  constructor ({ initPosition, grid, movementStyle, id }) {
    this.id = id
    this.hash = 'organism'
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
    this.routeTravelled = [initPosition]
    this.movementStyle = movementStyle
    this.currentPosition = initPosition
    const nextPosition = new GridPosition({
      ...this.currentPosition
    })
    this.nextPosition = nextPosition
    if (this.movementStyle.length) {
      updatePosition(this.movementStyle[1], this.nextPosition, grid)
    }

    this.orientation = Direction.up

    this.moving = false
  }

  move (grid) {
    if (this.lifespan && this.movementStyle.length) {
      if (this.movementStyle.length - 1 === this.step) {
        this.step = 0
      } else {
        this.step += 0
      }

      const nextNextStep = this.step === this.movementStyle.length - 1 ? 0 : this.step += 1
      updatePosition(this.movementStyle[this.step], this.currentPosition, grid)
      updatePosition(this.movementStyle[nextNextStep], this.nextPosition, grid)
      this.lifespan -= 1
      this.moving = false
    }
  }

  /**
   * lifespan in number of steps.
   * @param {Number} lifespan
   */
  feed (lifespan) {
    this.lifespan += lifespan
  }

  // by cloning itself
  giveBirth () {
    const chars = 'qwerttyuiopasdfghjklzxcvbnm'
    const child = Object.assign({}, this)
    child.hash = child.hash + chars[Random.rangeFloor(0, chars.length - 1)]
    child.currentPosition.x += 1
    return child
  }
}
