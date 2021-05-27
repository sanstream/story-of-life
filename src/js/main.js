import * as PIXI from 'pixi.js'
import Random from 'canvas-sketch-util/random'
import GridPosition from './gridPosition'
// eslint-disable-next-line import/extensions
import Organism, { giveBirth } from './organisms/organism'

const nStartingOrganisms = 10
const grid = {
  width: Math.round(Math.sqrt(nStartingOrganisms) * 0.9),
  height: Math.round(Math.sqrt(nStartingOrganisms) * 0.9),
}

const baseSize = 30
const ticksInSingleStep = 10 // frames per second

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

const colourRange = {
  bgMonotone: 0x121212, // dark grey
  bg: 0x2C575D, // dark cyan
  lightBg: 0xF4EED6, // grey cyan
  carnivore: 0xCC3333, // soft red
  herbivore: 0xCC9933, // murky yellow
  autotrophe: 0x006666, // soft green
}

const timesSmallerThanBaseSize = 0.5
const baseRadius = baseSize * 0.5 * timesSmallerThanBaseSize
const baseStrokeWidth = baseSize * 0.1 * timesSmallerThanBaseSize

function drawShapeFor (organism) {
  organism.spriteRef.lineStyle(baseStrokeWidth, colourRange.bgMonotone)
  organism.spriteRef.beginFill(organism.colour)
  organism.spriteRef.drawCircle(0, 0, baseRadius)
  // const growthRate = organism.energy < 9 ? organism.energy / 9 : 1
  // organism.spriteRef.scale.set(growthRate)
  organism.spriteRef.endFill()
}

const showGrid = false

function randomMovements (minLength, maxLength) {
  const movements = new Array(Random.rangeFloor(minLength, maxLength)).fill(0)
  return movements.map(() => Random.rangeFloor(0, 3))
}

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
      const org = new Organism({
        id: `${type}-${index}`,
        type,
        initPosition: new GridPosition({
          x: Math.round(Random.rangeFloor(0, grid.width)),
          y: Math.round(Random.rangeFloor(0, grid.height)),
        }),
        grid,
        colour: (index === 0) ? 0xFF00FF : colourRange[type],
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
    drawShapeFor(org)
    org.spriteRef.x = org.nextPosition.x * baseSize
    org.spriteRef.y = org.nextPosition.y * baseSize
    app.stage.addChild(org.spriteRef)
  }
}

app.ticker.minFPS = ticksInSingleStep
app.ticker.maxFPS = ticksInSingleStep
app.ticker.speed = 100
app.ticker.stop()

if (!app.ticker.started) {
  app.ticker.start()
}

let ticksTracker = 0
app.ticker.add(() => {
  resetAllPositions()
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
        if (!org.spriteRef) {
          org.spriteRef = new PIXI.Graphics()
          drawShapeFor(org)
          org.spriteRef.x = org.nextPosition.x * baseSize
          org.spriteRef.y = org.nextPosition.y * baseSize
          app.stage.addChild(org.spriteRef)
        } else {
          const growthRate = org.energy < 9 ? org.energy / 9 : 1
          org.spriteRef.scale.set(growthRate)
          if (org.lifespan < 5) {
            org.spriteRef.alpha = org.lifespan / 5
          }
          const { x, y, } = org.nextPosition // is current position!
          allPositions.get(x).get(y).push(org)
          org.move(grid)
          if (org.lifespan === 0) {
            app.stage.removeChild(org.spriteRef)
            continue
          }
        }
      }
      if (org.previousPosition) {
        org.spriteRef.x = (org.previousPosition.x + ((org.nextPosition.x - org.previousPosition.x) * ticksDiff)) * baseSize
        org.spriteRef.y = (org.previousPosition.y + ((org.nextPosition.y - org.previousPosition.y) * ticksDiff)) * baseSize
      }
    }
  }

  allPositions.forEach((yPositions, x) => {
    yPositions.forEach((organismsInOneSpot, y) => {
      if (organismsInOneSpot.length > 1) {
        if (organismsInOneSpot.length === 2) {
          // console.log(organismsInOneSpot)
          if (organismsInOneSpot[0].type === organismsInOneSpot[1].type && organismsInOneSpot[0].type !== organismType.autotrophe) {
            // console.log(organismsInOneSpot[0].type, organismsInOneSpot[1].type)
            const child = giveBirth(organismsInOneSpot)
            if (child) {
              // console.log(child.type, child.movementStyle)
              organisms[child.type].push(child)
            }
          }
        }
      }
    })
  })
})
