/* global FileReader, Image, Konva, ColorThief, nearestColor */
var imageForm = document.getElementById('imageForm')
var render = document.getElementById('render')
var patternGenerator = document.getElementById('pattern-generate')
var gridonholder = document.getElementById('gridonholder')
var gridon = document.getElementById('gridon')
var imageLoader = document.getElementById('imageLoader')
var form = document.getElementById('form')
var flex = document.getElementById('flex')
var container = document.getElementById('container')
var rows = document.getElementById('rows')
var columns = document.getElementById('columns')
var colorsInput = document.getElementById('colors')

var pattern // Uploaded image
var stage // Konva canvas container
var layer // Konva canvas layer
var hlines // number of horizontal lines
var vlines // number of vertical lines
var gw // grid width
var gh // grid height
var tr // transform handle
var hInc // horizontal line pixel increment
var vInc // vertical line pixel increment
var width // screen width
var height // screen height
var gridWidth // grid width init before fitting to container
var gridHeight // grid height init before fitting to container
var gridMaxWidth // total width of the grid in pixels
var gridMaxHeight // total height of the grid in pixels
const colorThief = new ColorThief()
var colors // total number of colors to extract from pattern
var palette // color palette of pattern
var rgbpalette // color palette of pattern
var getColor // nearest color calculator
var renderedGrid // 2d array of grid colors
var renderCanvas // rendered Canvas
var renderCTX // rendered Canvas context
var isGridEnabled = true // toggle grid on and off
const colorNameMap = {} // map hex colors to a nickname

form.addEventListener('submit', process)

function process (e) {
  e.preventDefault()
  calculateGrid()
  initializeStage()
  bindImageUpload()
  bindTransform()
  bindRenderButton()
  console.log({renderedGrid});
}

function calculateGrid () {
  form.classList.add('hide')
  imageForm.classList.add('active')

  // Initial dimensions can be as big as the screen(-ish)
  width = window.innerWidth
  height = window.innerHeight
  gridWidth = width - 15
  gridHeight = height - 5

  // How many divisions will we use?
  gw = parseInt(columns.value, 10)
  gh = parseInt(rows.value, 10)
  colors = parseInt(colorsInput.value, 10)

  // Calculate the increments we can use to make that many lines
  hInc = Math.floor(gridWidth / gw)
  vInc = Math.floor(gridHeight / gh)

  // Use the smaller increment size to keep the grid square and still fit
  if (hInc > vInc) hInc = vInc
  else vInc = hInc

  // Multiply it back out so we have the actual grid dimensions
  gridMaxWidth = hInc * gw
  gridMaxHeight = vInc * gh
}

function initializeStage () {
  stage = new Konva.Stage({
    container: 'container',
    width: gridMaxWidth + 1,
    height: gridMaxHeight + 1
  })

  layer = new Konva.Layer()
  stage.add(layer)
  layer.draw()

  // Draw all the lines across the horizontal axis
  var hArray = []
  for (var i = 1; i <= gridMaxWidth; i += hInc) {
    hArray.push(i, 1)
    hArray.push(i, gridMaxHeight - 1)
    hArray.push(i, 1)
  }

  // Draw all the lines across the vertical axis
  vlines = new Konva.Line({
    points: hArray,
    stroke: 'blue',
    strokeWidth: 0.1,
    lineCap: 'round',
    lineJoin: 'round'
  })

  var vArray = []
  for (i = 1; i <= gridMaxHeight; i += vInc) {
    vArray.push(1, i)
    vArray.push(gridMaxWidth - 1, i)
    vArray.push(1, i)
  }
  hlines = new Konva.Line({
    points: vArray,
    stroke: 'blue',
    strokeWidth: 0.1,
    lineCap: 'round',
    lineJoin: 'round'
  })

  layer.add(vlines)
  layer.add(hlines)
}

function bindImageUpload () {
  /* Upload Image */
  imageLoader.addEventListener('change', handleImage, false)
  function handleImage (e) {
    var reader = new FileReader()
    reader.onload = function (event) {
      var img = new Image()
      img.onload = function () {
        pattern = new Konva.Image({
          x: 50,
          y: 50,
          name: 'pattern',
          image: img,
          draggable: true
        })

        pattern.scale(autoScale(img))
        container.classList.add('active')
        render.classList.add('active')
        imageForm.classList.remove('active')
        layer.add(pattern)
        pattern.moveToBottom()
        layer.batchDraw()
        // palette = colorThief.getPalette(img, colors);
        rgbpalette = [];
        colorjs.prominent(img, { amount: colors, group: 40, sample: 10 }).then(colorPalette => {
          console.log({colorPalette})
          const palette = colorPalette.map(x => rgbToHex(x[0], x[1], x[2]));
          rgbpalette = palette;
          // rgbpalette = palette.map(x => rgbToHex(x[0], x[1], x[2]))
          console.log({rgbpalette});
          getColor = nearestColor.from(rgbpalette);
        })
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(e.target.files[0])
  }
}

function bindTransform () {
  stage.on('click tap', function (e) {
    if (e.target === stage) {
      stage.find('Transformer').destroy()
      layer.draw()
      return
    }
    if (!e.target.hasName('pattern')) {
      return
    }
    stage.find('Transformer').destroy()
    tr = new Konva.Transformer({
      node: e.target,
      keepRatio: true,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
    })
    layer.add(tr)
    layer.draw()
  })
}

function bindPatternButton () {
  console.log({renderedGrid});
  patternGenerator.innerHTML = 'Pattern';
  patternGenerator.addEventListener('click', () => {
    var text = 'Starting from Bottom Right, First Row RTL\n';
    var currentColor = '';
    var currentChain = 0;
    console.log({inverted: invert2DArray(renderedGrid)});
    // Reverse rows to start from bottom right
    invert2DArray(renderedGrid).reverse().forEach((row, rowIndex) => {
      currentColor = '';
      currentChain = 0;
      let rightSide = false;
      // Starting from bottom right, first crocheted row is RTL (right side)
      if (rowIndex % 2 === 0) {
        row = row.reverse();
        rightSide = true;
      }
      text = `${text}Row ${rowIndex+1}. (${rightSide ? 'RS' : 'WS'})`;
      row.forEach((px, pxIdx) => {
        const colorName = colorNameMap[px];
        if (currentColor === colorName || !currentColor.length) {
          currentChain ++;
          currentColor = colorName;
          if (pxIdx === row.length-1) text = `${text} (${currentChain} ${currentColor})`;
        } else {
          text = `${text} (${currentChain} ${currentColor})`;
          currentColor = colorName;
          currentChain = 1;
        }

      });
      text = `${text}\n`
    });
    console.log({text});
    download(`stitchy-pattern-${new Date().toISOString()}.txt`, text);
  })
}

function bindRenderButton () {
  render.addEventListener('click', () => {
    // turn off the transformer if it's still on
    stage.find('Transformer').destroy()
    layer.draw()
    // Unbind click handler on stage
    stage.off('click tap')

    setTimeout(function () {
      // Get reference to raw canvas object in Konva
      var content = document.querySelector('.konvajs-content')
      var canvas = content.getElementsByTagName('canvas')[0]
      var ctx = canvas.getContext('2d')

      // Create new canvas object for flat output render
      renderCanvas = document.createElement('canvas')
      renderCTX = renderCanvas.getContext('2d')
      renderCanvas.width = gridMaxWidth
      renderCanvas.height = gridMaxHeight
      flex.appendChild(renderCanvas)

      renderedGrid = []
      for (var i = 0; i < gw; ++i) {
        renderedGrid[i] = []
        for (var j = 0; j < gh; ++j) {
          let R = 0
          let G = 0
          let B = 0
          let A = 0
          const data = ctx.getImageData(i * hInc * window.devicePixelRatio, j * vInc * window.devicePixelRatio, hInc * window.devicePixelRatio, vInc * window.devicePixelRatio).data
          const components = data.length
          for (let i = 0; i < components; i += 4) {
            // A single pixel (R, G, B, A) will take 4 positions in the array:
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const a = data[i + 3]
            R += r
            G += g
            B += b
            A += a
          }
          const pixelsPerChannel = components / 4
          R = R / pixelsPerChannel | 0
          G = G / pixelsPerChannel | 0
          B = B / pixelsPerChannel | 0
          A = A / pixelsPerChannel / 255
          // flatten RGBA colors to RGB to prep for nearest-neighbor calc
          var rgb = rgba2rgb(R, G, B, A)
          var hex = getColor(rgbToHex(rgb[0], rgb[1], rgb[2]))
          // Fill square in output canvas with captured color
          renderedGrid[i][j] = hex
        }
      }

      // draw Render canvas
      drawRenderCanvas()
      // bind mouse clicks on the render canvas to change colors
      bindRenderCanvas()
      // bind grid on toggle
      bindGridOn()
      // Destroy Konva canvas
      stage.destroy()
      // Remove render button
      render.classList.remove('active')
      // Show grid on checkbox
      gridonholder.classList.add('active')

      // Create download link
      var link = document.createElement('a')
      link.innerHTML = 'Download'
      link.id = 'download'
      var todayDate = new Date().toISOString().slice(0, 10)
      link.download = 'stitchy-pattern-' + todayDate + '.png'
      link.addEventListener('click', function () {
        link.href = renderCanvas.toDataURL()
      }, false)
      document.body.appendChild(link);
      console.log({rgbpalette});
      const colorPicker = document.getElementById('colorpicker');
      rgbpalette.forEach(color => {
        const textBox = document.createElement('span');

        textBox.textContent = color;
        textBox
        textBox.style.backgroundColor = color;
        textBox.style.color = invert(color, true);
        const input = document.createElement('input');
        input.value = color;
        input.style.color = invert(color, true);
        input.onkeyup = debounce((e) => (changeColorNameMap(color, e.target.value)), 300);
        textBox.append(input);
        textBox.id = `colorpicker-${color}`;
        colorPicker.appendChild(textBox);
        colorNameMap[color] = color;
      })
      bindPatternButton();
    }, 300)
  })
}

function changeColorNameMap (hexColor, name) {
  colorNameMap[hexColor] = name;
  console.log({colorNameMap})
}

function bindRenderCanvas () {
  renderCanvas.addEventListener('click', function (e) {
    console.log({renderedGrid});
    var mouseX, mouseY
    if (e.offsetX) {
      mouseX = e.offsetX
      mouseY = e.offsetY
    } else if (e.layerX) {
      mouseX = e.layerX
      mouseY = e.layerY
    }
    var i = Math.floor(mouseX / hInc)
    var j = Math.floor(mouseY / vInc)
    var colorMatch = rgbpalette.indexOf(renderedGrid[i][j])
    if (colorMatch === -1) {
      console.log('We don\'t match anything in the palette. Probably a grid line.')
    } else if (colorMatch === rgbpalette.length - 1) {
      colorMatch = 0
    } else {
      colorMatch++
    }
    renderedGrid[i][j] = rgbpalette[colorMatch]
    drawRenderCanvas()
  })
}

function bindGridOn () {
  gridon.checked = true
  gridon.addEventListener('change', function () {
    if (gridon.checked) {
      isGridEnabled = true
    } else {
      isGridEnabled = false
    }
    drawRenderCanvas()
  })
}

function drawRenderCanvas () {
  renderCTX.fillStyle = 'white'
  renderCTX.fillRect(0, 0, renderCanvas.width, renderCanvas.height)
  for (var i = 0; i < gw; ++i) {
    for (var j = 0; j < gh; ++j) {
      renderCTX.fillStyle = renderedGrid[i][j]
      renderCTX.fillRect(i * hInc, j * vInc, hInc, vInc)
    }
  }

  if (isGridEnabled) {
    // Draw vertical grid lines on top
    for (i = 1; i <= gridMaxWidth; i += hInc) {
      renderCTX.beginPath()
      renderCTX.moveTo(i, 1)
      renderCTX.lineTo(i, gridMaxHeight)
      renderCTX.strokeStyle = '#000'
      renderCTX.stroke()
    }

    // Draw horizontal grid lines on top
    for (i = 1; i <= gridMaxHeight; i += vInc) {
      renderCTX.beginPath()
      renderCTX.moveTo(1, i)
      renderCTX.lineTo(gridMaxWidth, i)
      renderCTX.strokeStyle = '#000'
      renderCTX.stroke()
    }
  }
}

function rgba2rgb (r, g, b, a) {
  return [
    Math.round((1 - a) * 255 + a * r),
    Math.round((1 - a) * 255 + a * g),
    Math.round((1 - a) * 255 + a * b)
  ]
}

function rgbToHex (r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

function autoScale (imgEle) {
  var rW = gridMaxWidth / imgEle.width
  var rH = gridMaxHeight / imgEle.height
  var scale = Math.min(rH < rW ? rH : rW, 1)
  return { x: scale, y: scale }
}

const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
}

const invert2DArray = (array) => {
  return array[0].map((_, colIndex) => array.map(row => row[colIndex]));
}

function download(filename, text) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);

  if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
  }
  else {
      pom.click();
  }
}
