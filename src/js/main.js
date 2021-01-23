import * as PIXI from 'pixi.js'
import Random from 'canvas-sketch-util/random'
import GridPosition from './gridPosition'
import Autotrophe from './organisms/organism'

const grid = {
  width: 100,
  height: 100
}

const colourRange = [
  0x121212, // dark grey
  0x2C575D, // dark cyan
  0x57BEB3, // grey cyan
  0xF4EED6, // warm white
  0xEC8F7A, // soft pink
  0xEA5150 // soft red
]

const interval = 200
const baseSize = 10
const orgWidth = baseSize
let organismTexture = null

const autotrophes = new Array(30).fill(0).map((i, index) => {
  const org = new Autotrophe({
    id: `autotrophe-${index}`,
    initPosition: new GridPosition({
      x: Math.round(Random.rangeFloor(0, grid.width)),
      y: Math.round(Random.rangeFloor(0, grid.height))
    }),
    grid,
    movementStyle: new Array(Random.rangeFloor(4, 6))
      .fill(0)
      .map(() => Random.rangeFloor(0, 3))
  })
  return org
})


const app = new PIXI.Application({
  width: grid.width * baseSize,
  height: grid.height * baseSize,
  backgroundColor: colourRange[0],
  view: document.querySelector('#scene'),
  resolution: window.devicePixelRatio || 1,
})

organismTexture = PIXI.Texture.from('assets/bulb.svg')
for (const org of autotrophes) {
const bulb = new PIXI.Sprite(organismTexture)
  bulb.anchor.set(0.5)
  bulb.x = org.currentPosition.x * baseSize
  bulb.y = org.currentPosition.y * baseSize
  app.stage.addChild(bulb)
  org.spriteRef = bulb
}

app.ticker.add((delta) => {
  // console.log(delta)
  for (const org of autotrophes) {
    // debugger
    org.move(grid)
    org.spriteRef.x = org.currentPosition.x * baseSize
    org.spriteRef.y = org.currentPosition.y * baseSize
  }
})
