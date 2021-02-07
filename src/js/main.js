import * as PIXI from 'pixi.js'
import Random from 'canvas-sketch-util/random'
import GridPosition from './gridPosition'
import Autotrophe, { giveBirth } from './organisms/organism'

const nStartingOrganisms = 2000
const grid = {
  width: Math.round(Math.sqrt(nStartingOrganisms) * 0.9),
  height: Math.round(Math.sqrt(nStartingOrganisms) * 0.9),
}

const allPositions = new Map()

for (let x = 0; x < grid.width + 1; x += 1) {
  allPositions.set(x, new Map())
  for (let y = 0; y < grid.height + 1; y += 1) {
    allPositions.get(x).set(y, [])
  }
}

function resetAllPositions () {
  allPositions.forEach((yPositions) => {
    yPositions.forEach((_, yPosition) => {
      yPositions.set(yPosition, [])
    })
  })
}

const showGrid = false

const colourRange = {
  bgMonotone: 0x121212, // dark grey
  bg: 0x2C575D, // dark cyan
  lightBg: 0xF4EED6, // grey cyan
  carnivore: 0xCC3333, // soft red
  herbivore: 0xCC9933, // murky yellow
  autotrophe: 0x006666, // soft green
}

function randomMovements (minLength, maxLength) {
  const movements = new Array(Random.rangeFloor(minLength, maxLength)).fill(0)
  return movements.map(() => Random.rangeFloor(0, 3))
}

const baseSize = 30
const ticksInSingleStep = 120 // frames per second

const predefinedMovements = new Array(Math.round(nStartingOrganisms / 2))
  .fill(0).map(() => randomMovements(4, 8))

const organisms = {}

const organismType = {
  carnivore: 'carnivore',
  herbivore: 'herbivore',
  autotrophe: 'autotrophe',
}

const ordering = [
  organismType.autotrophe,
  organismType.herbivore,
  organismType.carnivore,
]

const organismTypeCounts = {
  [organismType.carnivore]: {
    count: Math.round(nStartingOrganisms * 0.1),
  },
  [organismType.herbivore]: {
    count: Math.round(nStartingOrganisms * 0.2),
  },
  [organismType.autotrophe]: {
    count: Math.round(nStartingOrganisms * 0.6),
  },
}

for (const type of ordering) {
  organisms[type] = new Array(organismTypeCounts[type].count)
    .fill(0)
    .map((_, index) => {
      const org = new Autotrophe({
        id: `${type}-${index}`,
        type,
        initPosition: new GridPosition({
          x: Math.round(Random.rangeFloor(0, grid.width)),
          y: Math.round(Random.rangeFloor(0, grid.height)),
        }),
        grid,
        colour: colourRange[type],
        movementStyle: type === 'autotrophe' ? [] : predefinedMovements[Random.rangeFloor(0, predefinedMovements.length - 1)],
      })
      return org
    })
}

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

for (const type in organisms) {
  for (const org of organisms[type]) {
    org.spriteRef = new PIXI.Graphics()
    org.spriteRef.beginFill(org.colour)
    org.spriteRef.drawCircle(0, 0, org.energy * 0.03 * baseSize)
    org.spriteRef.endFill()
    org.spriteRef.x = org.nextPosition.x * baseSize
    org.spriteRef.y = org.nextPosition.y * baseSize
    app.stage.addChild(org.spriteRef)
  }
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

  for (const type in organisms) {
    for (const org of organisms[type]) {
      // for (const org of autotrophes) {
      if (ticksTracker === 0) {
        org.move()
      }
      if (org.previousPosition) {
        org.spriteRef.x = (org.previousPosition.x + ((org.nextPosition.x - org.previousPosition.x) * ticksDiff)) * baseSize
        org.spriteRef.y = (org.previousPosition.y + ((org.nextPosition.y - org.previousPosition.y) * ticksDiff)) * baseSize
      }
    }
  }
})
