const carCanvas = document.getElementById('carCanvas')
carCanvas.width = 400

const networkCanvas = document.getElementById('networkCanvas')
networkCanvas.width = 500

const carCtx = carCanvas.getContext('2d')
const networkCtx = networkCanvas.getContext('2d')

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, 5)

const cars = generateCars(1000)
let bestCar = cars[0]

if (localStorage.getItem('bestBrain')) {
  for (let i = 1; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem('bestBrain'))
    if (i !== 0) {
      NeuralNetwork.mutate({
        network: cars[i].brain,
        amount: 0.2
      })
    }
  }
}

const traffic = [
  new Car({
    x: road.getLaneCenter(3),
    y: -500
  }),
  new Car({
    x: road.getLaneCenter(1),
    y: -500
  }),
  new Car({
    x: road.getLaneCenter(2),
    y: -300
  }),
  new Car({
    x: road.getLaneCenter(3),
    y: -150
  }),
  new Car({
    x: road.getLaneCenter(1),
    y: -150
  }),
  new Car({
    x: road.getLaneCenter(0),
    y: -300
  }),
  new Car({
    x: road.getLaneCenter(4),
    y: -300
  }),
]

animate()

function animate() {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update({
      roadBorders: road.borders,
      trafficBorders: []
    })
  }

  for (let index = 0; index < cars.length; index++) {
    cars[index].update({
      roadBorders: road.borders,
      trafficBorders: traffic
    })
  }

  const maxDistance = Math.min(...cars.map(car => car.y))
  const maxSpeed = Math.max(...cars.map(car => car.speed))

  const bestCar = cars.find(
    car => car.y === maxDistance    // car => car.y === maxDistance && car.speed === car.maxSpeed
  )

  carCanvas.height = window.innerHeight
  networkCanvas.height = window.innerHeight

  carCtx.save()
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.75)
  road.draw(carCtx)

  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx)
  }

  carCtx.globalAlpha = 0.2
  for (let index = 0; index < cars.length; index++) {
    cars[index].draw(carCtx)
  }
  carCtx.globalAlpha = 1

  bestCar.drawSensors = true
  bestCar.draw(carCtx)

  carCtx.restore()

  Visualizer.drawNetwork({
    ctx: networkCtx,
    network: bestCar.brain
  })
  requestAnimationFrame(animate)
}

function generateCars(numberOfCars) {
  const cars = []

  cars.push(new Car({
    x: road.getLaneCenter(2),
    y: 100,
    color: "blue",
    controlType: "AI",
    acceleration: 0.15,
    maxSpeed: 3,
    drawSensors: true
  }))

  for (let index = 1; index < numberOfCars; index++) {
    cars.push(new Car({
      x: road.getLaneCenter(2),
      y: 100,
      color: "blue",
      controlType: "AI",
      acceleration: 0.15,
      maxSpeed: 3,
    }))
  }

  return cars
}

function save() {
  console.log('saved')
  // bestCar.brain.id++
  localStorage.setItem('bestBrain',
    JSON.stringify(bestCar.brain)
  )

  // console.log(JSON.parse(localStorage.getItem('bestBrain')).id)
}

function discard() {
  console.log('discarted')
  localStorage.removeItem('bestBrain')
}