/// <reference types="cypress" />
import GridPosition from '../../../src/js/gridPosition'
import Organism from '../../../src/js/organisms/organism'
import Organismm, { Direction, giveBirth } from '../../../src/js/organisms/organism'

const initPosition = new GridPosition({ x: 2, y: 2, })
const grid = {
  width: 10,
  height: 10,
}
const movementStyle = [Direction.down, Direction.right,]
const id = 'an-unique-string'

context('Actions', () => {
  it('increments lifespan when feed is called', () => {
    const org = new Organismm({ initPosition, grid, movementStyle, id, })
    const orginalLifeSpan = org.lifespan
    org.feed(2)
    expect(org.lifespan).to.eq((orginalLifeSpan + 2), 'lifespan is calculated wrong')
  })

  it('update step, lifespan and position based on a set of movements', () => {
    const org = new Organismm({
      initPosition: new GridPosition({ x: 2, y: 2, }),
      grid,
      movementStyle: [
        Direction.down,
        Direction.right,
        Direction.up,
        Direction.left,
      ],
      id,
    })
    expect(org.step).to.equal(0, 'starts at 0')
    const initLifespan = org.lifespan

    org.move()
    expect(org.lifespan).to.equal(initLifespan - 1)
    expect(org.previousPosition).to.deep.equal({ x: 2, y: 2, })
    expect(org.nextPosition).to.deep.equal({ x: 2, y: 3, })
    expect(org.step).to.equal(1)

    org.move()
    expect(org.previousPosition).to.deep.equal({ x: 2, y: 3, })
    expect(org.nextPosition).to.deep.equal({ x: 3, y: 3, })
    expect(org.step).to.equal(2)

    org.move()
    expect(org.previousPosition).to.deep.equal({ x: 3, y: 3, })
    expect(org.nextPosition).to.deep.equal({ x: 3, y: 2, })
    expect(org.step).to.equal(3)

    org.move()
    expect(org.previousPosition).to.deep.equal({ x: 3, y: 2, })
    expect(org.step).to.equal(0, 'goes back to the beginning')
    expect(org.nextPosition).to.deep.equal({ x: 2, y: 2, })
  })

  it('`giveBirth` creates an new Organism based on its input', () => {
    const newOrg = giveBirth({
      initPosition: new GridPosition({ x: 2, y: 2, }),
      grid,
      movementStyle: [
        Direction.down,
        Direction.right,
        Direction.up,
        Direction.left,
      ],
      id,
      colour: 0xff4422,
    })

    expect(newOrg).to.be.instanceOf(Organism)
  })
})
