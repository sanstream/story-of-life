import Organism from './organism'

export default class Autotrophe extends Organism {
  constructor () {
    super(...arguments)
    this.movementStyle = []
    this.lifespan = 50
    this.hash = 'autotrophe'
  }

  // TODO: trying to debug why move is undefined

  // move () {
  //   // 1 step is removed from life in move
  //   super.move(...arguments)
  //   // we feed it another step:
  //   this.feed(2)
  // }

  giveBirth () {
    if (this.lifespan % 10 === 0) {
      return super.giveBirth()
    }
    return null
  }
}
