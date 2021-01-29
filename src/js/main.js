import * as PIXI from 'pixi.js'
import Random from 'canvas-sketch-util/random'
import GridPosition from './gridPosition'
import Autotrophe from './organisms/organism'

const grid = {
  width: 200,
  height: 200,
}

const showGrid = false

const colourRange = {
  bgMonotone: 0x121212, // dark grey
  bg: 0x2C575D, // dark cyan
  lightBg: 0x57BEB3, // grey cyan
  carnivore: 0xF4EED6, // warm white
  herbivore: 0xEC8F7A, // soft pink
  autotrophe: 0xEA5150, // soft red
}

const baseSize = 30
const ticksInSingleStep = 100 // frames per second

const autotrophes = new Array(300).fill(0).map((i, index) => {
  const org = new Autotrophe({
    id: `autotrophe-${index}`,
    initPosition: new GridPosition({
      // x: 2, y: 2,
      x: Math.round(Random.rangeFloor(0, grid.width)),
      y: Math.round(Random.rangeFloor(0, grid.height)),
    }),
    grid,
    colour: colourRange.autotrophe,
    movementStyle:
      new Array(Random.rangeFloor(4, 6))
        .fill(0)
        .map(() => Random.rangeFloor(0, 3)),
  })
  return org
})

PIXI.autoDetectRenderer({ antialias: true, })

const app = new PIXI.Application({
  antialias: true,
  width: grid.width * baseSize,
  height: grid.height * baseSize,
  backgroundColor: colourRange.bgMonotone,
  view: document.querySelector('#scene'),
  resolution: window.devicePixelRatio || 1,
})

if (showGrid) {
  for (let h = 1; h < grid.height; h++) {
    for (let w = 1; w < grid.width; w++) {
      const dot = new PIXI.Graphics()
      dot.beginFill(colourRange.lightBg)
      dot.drawCircle(0, 0, 2)
      dot.endFill()
      dot.x = w * baseSize
      dot.y = h * baseSize
      app.stage.addChild(dot)
    }
  }
}

for (const org of autotrophes) {
  org.spriteRef = new PIXI.Graphics()
  org.spriteRef.beginFill(org.colour)
  org.spriteRef.drawCircle(0, 0, 0.5 * baseSize)
  org.spriteRef.endFill()
  org.spriteRef.x = org.nextPosition.x * baseSize
  org.spriteRef.y = org.nextPosition.y * baseSize
  app.stage.addChild(org.spriteRef)
}

app.ticker.minFPS = ticksInSingleStep
app.ticker.maxFPS = ticksInSingleStep
app.ticker.stop()

if (!app.ticker.started) {
  app.ticker.start()
}

let ticksTracker = 0
app.ticker.add(() => {
  if (ticksTracker === ticksInSingleStep) {
    ticksTracker = 0
  } else {
    ticksTracker += 1
  }

  const ticksDiff = ticksTracker / ticksInSingleStep

  for (const org of autotrophes) {
    if (ticksTracker === 0) {
      org.move()
    }
    if (org.previousPosition) {
      org.spriteRef.x = (org.previousPosition.x + ((org.nextPosition.x - org.previousPosition.x) * ticksDiff)) * baseSize
      org.spriteRef.y = (org.previousPosition.y + ((org.nextPosition.y - org.previousPosition.y) * ticksDiff)) * baseSize
    }
  }
})
