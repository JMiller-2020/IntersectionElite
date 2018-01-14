console.log('intersection-elite.simulation.js running')

const CAR_WIDTH = 30
const CAR_HEIGHT = 50

var body
var svg
var fpsDisplay
var width = 600
var height = 400
var delta
var trafficData = {
  cars: [
    {
      x: 10,
      y: 50,
      angle: 30,
      width: 30,
      height: 50,

      vel: 5,
      turnAngle: 1,
      acc: 1,
      drag: 1
    },
    {
      x: 400,
      y: 200,
      angle: -10,
      width: 30,
      height: 70,

      vel: 10,
      turnAngle: -0.5,
      acc: 0.99,
      drag: 1
    }
  ]
}
var cars
const MAX_TURN_ANGLE = 1
const MAX_VEL = 10
const DEG2RAD = Math.PI / 180

window.onload = main // starts code after window finishes loading

var Key = {
  _pressed: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,

  isDown: function(keyCode) {
    return this._pressed[keyCode]
  },

  onKeydown: function(event) {
    this._pressed[event.keyCode] = true
  },

  onKeyup: function(event) {
    delete this._pressed[event.keyCode]
  }
}

window.addEventListener('keyup', (e) => { Key.onKeyup(e) }, false)
window.addEventListener('keydown', (e) => { Key.onKeydown(e) }, false)

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

  start()
}

function init() {
  console.log('initializing')
  setupSvg()
  generateCars()

  fpsDisplay = svg.append('text')
    .attr('x', 10)
    .attr('y', 20)
    .style('font-family', 'sans-serif')
    .style('fill', '#ddd')

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

// var count_ = 0

function mainLoop(timestamp) {

  // could add begin() for input and loop setup

  delta += (timestamp - lastFrameTimeMs) // note += here
  lastFrameTimeMs = timestamp

  if(timestamp > lastFpsUpdate + SECOND) { // updates every second
    fps = framesThisSecond

    // console.log(fps)
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
  // console.log(numUpdateSteps)

  draw()

  // could add end() for long running updates or cleanup
  if(running) {
    frameID = requestAnimationFrame(mainLoop)
  }
}

function update(timestep) {
  // console.log('.')

  if (Key.isDown(Key.UP)) trafficData.cars[0].acc = 2
  else trafficData.cars[0].acc = 0
  if (Key.isDown(Key.DOWN)) trafficData.cars[0].drag = 5
  else trafficData.cars[0].drag = 1
  if (Key.isDown(Key.RIGHT)) trafficData.cars[0].turnAngle += 0.05
  else if (Key.isDown(Key.LEFT)) trafficData.cars[0].turnAngle -= 0.05
  else trafficData.cars[0].turnAngle /= 2

  for(let i = 0; i < trafficData.cars.length; i++) {
    let car = trafficData.cars[i]
    car.turnAngle = Math.max(-MAX_TURN_ANGLE, Math.min(car.turnAngle, MAX_TURN_ANGLE))

    let angle = car.angle + car.turnAngle / 2
    car.vel = Math.max(0, Math.min(car.vel + car.acc - car.drag, MAX_VEL))

    car.x += Math.cos(angle * DEG2RAD - Math.PI / 2) * car.vel
    car.y += Math.sin(angle * DEG2RAD - Math.PI / 2) * car.vel

    car.angle += car.turnAngle * car.vel
    while(car.angle >= 360) {
      car.angle -= 360
    }

    // console.log(`${i}: ${JSON.stringify(car)}`)
  }
  // if(count_++ > 1000) {
  //   stop()
  // }
}

function draw() {
  // console.log('draw():')
  // svg.remove()
  // svg = d3.selectAll('body').append('svg')
  // console.log(cars)
  cars
    .attr('x', (d) => { return d.x - d.width / 2 })
    .attr('y', (d) => { return d.y - d.height / 2 })
    .attr('width', (d) => { return d.width })
    .attr('height', (d) => { return d.height })
    .style('fill', (d) => { return '#ddd' })
    .attr('transform', (d) => { return 'rotate(' + d.angle + ' ' + d.x + ' ' + d.y + ')' })

  // console.log(cars.size())

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

function generateCars() {
  cars = svg.selectAll('rect')
    .data(trafficData.cars)
    .enter()
    .append('rect')
    // .attr('x', (d) => { return d.x - d.width / 2 })
    // .attr('y', (d) => { return d.y - d.height / 2 })
    // .attr('width', (d) => { return d.width })
    // .attr('height', (d) => { return d.height })
    // .style('fill', (d) => { return '#ddd' })
    // .attr('transform', (d) => { return 'rotate(' + d.angle + ' ' + d.x + ' ' + d.y + ')' })
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
