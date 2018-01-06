console.log('intersection-elite.simulation.js running')

var body
var svg
var fpsDisplay
var width = 600
var height = 400
var delta
var rectsData = [
    {
      cx: width / 2,
      cy: height / 2,
      width: 50,
      height: 30,
      rot: 30,
      fill: '#8fd',
    }, {
      cx: width / 4,
      cy: height / 4,
      width: 60,
      height: 40,
      rot: 60,
      fill: '#abc',
    }, {
      cx: 500,
      cy: 150,
      width: 20,
      height: 80,
      rot: 45,
      fill: '#2f4',
    }
  ]

window.onload = main // starts code after window finish loading
window.addEventListener('beforeunload', (e) => {
  console.log('stopping')
  rectsData[0].fill = '#000'
  (e || window.event).returnValue = null
  return null
})

var frameID
var running = false
var started = false

function start() {
  console.log('starting')
  if(!started) { // don't request multiple mainLoop's
    started = true
    // dummy frame to init timestamp/drawing
    // track frame ID if it needs to be cancelled quickly
    frameID = requestAnimationFrame(function(timestamp) {
      draw(1) // initial draw
      running = true
      // reset time tracking vars
      lastFrameTimeMs = timestamp
      lastFpsUpdate = timestamp
      framesThisSecond = 0
      // actually start mainLoop
      frameID = requestAnimationFrame(mainLoop)
    })
  }
}

function stop() {
  console.log('pausing mainLoop')
  running = false
  started = false
  cancelAnimationFrame(frameID)
  // also cancel other requests...
}

function main() {
  init()

  var centerPoint = svg.append('circle')
    .attr('cx', width / 2)
    .attr('cy', height / 2)
    .attr('r', 2)
    .style('fill', '#fff')
    .style('stroke', '#000')

  fpsDisplay = svg.append('text')
    .attr('x', 10)
    .attr('y', 10)
    .style('font-family', 'sans-serif')
    .style('color', '#111')

  requestAnimationFrame(mainLoop)
}

function init() {
  console.log('initializing')
  setupSvg()
  delta = 0
}

// mainLoop design from:
// http://isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing
var lastFrameTimeMs = 0
const SECOND = 1000
const TARGET_FPS = 60
const TIMESTEP = SECOND / TARGET_FPS

var fps = TARGET_FPS
var framesThisSecond = 0
var lastFpsUpdate = 0

function mainLoop(timestamp) {

  // could add begin() for input and loop setup

  delta += (timestamp - lastFrameTimeMs) // note += here
  lastFrameTimeMs = timestamp

  if(timestamp > lastFpsUpdate + SECOND) { // updates every second
    fps = framesThisSecond

    console.log(fps)
    lastFpsUpdate = timestamp
    framesThisSecond = 0
  }
  framesThisSecond++

  // Simulate total elapsed time in fixed-size chunks
  var numUpdateSteps = 0
  while(delta >= TIMESTEP) {

    update(TIMESTEP)

    delta -= TIMESTEP
    if(++numUpdateSteps >= 240) { // falls four seconds behind
      console.log('panicking!!!')
      delta = 0 // ignore missed updates
      break
    }
  }
  console.log(numUpdateSteps)

  draw()

  // could add end() for long running updates or cleanup

  frameID = requestAnimationFrame(mainLoop)
}

function update(timestep) {
  // console.log('.')
  rectsData[0].cx += 1
}

function draw() {
  // console.log('drawing')
  var rects = svg.selectAll('rect')
    .data(rectsData)
    .enter()
    .append('rect')
    .attr('x', (d) => { return d.cx - d.width / 2 })
    .attr('y', (d) => { return d.cy - d.height / 2 })
    .attr('width', (d) => { return d.width })
    .attr('height', (d) => { return d.height })
    .style('fill', (d) => { return d.fill })
    .attr('transform', (d) => { return 'rotate(' + d.rot + ' ' + d.cx + ' ' + d.cy + ')' })

  rects.exit().remove()

  // TODO: make this work
  fpsDisplay.text(fps)
}

function setupSvg() {
  body = d3.select('body')

  // responsive svg from:
  // https://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js
  // (might need to change css)
  var svgContainer = body.append('div') // container to make svg responsive
    .classed('svg-container', true)

  svg = svgContainer.append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .classed('svg-content-responsive', true) // class to make svg responsive
    .style('background-color', '#333')
}

// This polyfill is adapted from the MIT-licensed
// https://github.com/underscorediscovery/realtime-multiplayer-in-html5
var requestAnimationFrame = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (function() {
    var lastTimestamp = Date.now(),
        now,
        timeout;
    return function(callback) {
        now = Date.now();
        timeout = Math.max(0, timestep - (now - lastTimestamp));
        lastTimestamp = now + timeout;
        return setTimeout(function() {
            callback(now + timeout);
        }, timeout);
    };
})(),

cancelAnimationFrame = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : clearTimeout;
