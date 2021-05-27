/**
 * taken from https://css-tricks.com/converting-color-spaces-in-javascript/
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 */
function RGBToHSL (r, g, b) {
  // Make r, g, and b fractions of 1
  r /= 255
  g /= 255
  b /= 255

  // Find greatest and smallest channel values
  const cmin = Math.min(r, g, b)
  const cmax = Math.max(r, g, b)
  const delta = cmax - cmin
  const h = 0
  let s = 0
  let l = 0
  // Calculate lightness
  l = (cmax + cmin) / 2

  // Calculate saturation
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  // Multiply l and s by 100
  s = +(s * 100).toFixed(1)
  l = +(l * 100).toFixed(1)

  return {
    h, s, l,
  }
}

/**
 * taken from https://css-tricks.com/converting-color-spaces-in-javascript/
 * @param {Number} h In the range of 0 - 360
 * @param {Number} s In the range of 0 - 1
 * @param {Number} l In the range of 0 - 1
 */
function HSLToRGB (h, s, l) {
  // Must be fractions of 1
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x
  }
  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return {
    r, g, b,
  }
}

function hexToHSL (H) {
  // Convert hex to RGB first
  let r = 0; let g = 0; let b = 0
  if (H.length === 4) {
    r = '0x' + H[1] + H[1]
    g = '0x' + H[2] + H[2]
    b = '0x' + H[3] + H[3]
  } else if (H.length === 7) {
    r = '0x' + H[1] + H[2]
    g = '0x' + H[3] + H[4]
    b = '0x' + H[5] + H[6]
  }
  // Then to HSL
  r /= 255
  g /= 255
  b /= 255
  const cmin = Math.min(r, g, b)
  const cmax = Math.max(r, g, b)
  const delta = cmax - cmin
  let h = 0
  let s = 0
  let l = 0

  if (delta === 0) { h = 0 } else if (cmax === r) { h = ((g - b) / delta) % 6 } else if (cmax === g) { h = (b - r) / delta + 2 } else { h = (r - g) / delta + 4 }

  h = Math.round(h * 60)

  if (h < 0) { h += 360 }

  l = (cmax + cmin) / 2
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  s = +(s * 100).toFixed(1)
  l = +(l * 100).toFixed(1)

  return 'hsl(' + h + ',' + s + '%,' + l + '%)'
}

function HSLToHex (h, s, l) {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x
  }
  // Having obtained RGB, convert channels to hex
  r = Math.round((r + m) * 255).toString(16)
  g = Math.round((g + m) * 255).toString(16)
  b = Math.round((b + m) * 255).toString(16)

  // Prepend 0s, if necessary
  if (r.length === 1) { r = '0' + r }
  if (g.length === 1) { g = '0' + g }
  if (b.length === 1) { b = '0' + b }

  return '0x' + r + g + b
}

export function shiftHue (originalColour) {
  // 0xff4422 becomes 'ff4422'
  const colourAsHexString = originalColour.toString(16)
  // 'ff4422' gets split up in its rgb components and converted into rgb values
  const r = parseInt(colourAsHexString.substring(0, 2), 16) // ff as 255
  const g = parseInt(colourAsHexString.substring(2, 4), 16) // 44 as ...
  const b = parseInt(colourAsHexString.substring(4, 6), 16) // 22 as ...
  const hslvalue = RGBToHSL(r, g, b)

  // tweak value of hue:
  const potentialNewHue = hslvalue.h + 1
  const newHue = potentialNewHue > 360 ? (potentialNewHue) - 360 : potentialNewHue

  return parseInt(HSLToHex(newHue, hslvalue.s, hslvalue.l), 16)
}
