class Car {
  constructor({ x, y, width = 30, height = 50, controlType = 'DUMMY', maxSpeed = 2.5, acceleration = 0.1, color = 'black', drawSensors = false }) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.id = 0

    this.drawSensors = drawSensors
    this.color = color
    this.speed = 0
    this.maxSpeed = maxSpeed
    this.acceleration = acceleration
    this.friction = 0.05
    this.angle = 0
    this.damage = false

    this.useBrain = controlType === 'AI'

    if (controlType !== 'DUMMY') {
      this.sensors = new Sensor(this)
      this.brain = new NeuralNetwork({
        neuronCounts: [this.sensors.rayCount, 6, 4]
      })
    }

    this.controls = new Controls(controlType)
  }

  update({ roadBorders, trafficBorders }) {
    if (!this.damage) {
      this.#move()
      this.polygon = this.#createPolygon()
      this.damage = this.#assesDamage({
        roadBorders,
        trafficBorders
      })
    }
    if (this.sensors) {
      this.sensors.update({
        roadBorders,
        trafficBorders
      })
      const offsets = this.sensors.readings.map(
        s => s === null ? 0 : 1 - s.offset
      )
      const outputs = NeuralNetwork.feedForward({
        givenInputs: offsets,
        network: this.brain
      })

      if (this.useBrain) {
        this.controls.foward = outputs[0]
        this.controls.left = outputs[1]
        this.controls.right = outputs[2]
        this.controls.reverse = outputs[3]
      }
    }
  }

  #createPolygon() {
    const points = []
    const rad = Math.hypot(this.width, this.height) / 2
    const alpha = Math.atan2(this.width, this.height)
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad
    })
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad
    })
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
    })
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
    })

    return points
  }

  #assesDamage({ roadBorders, trafficBorders }) {
    for (let i = 0; i < roadBorders.length; i++) {
      if (polysIntersect(this.polygon, roadBorders[i]))
        return true
    }

    for (let i = 0; i < trafficBorders.length; i++) {
      if (polysIntersect(this.polygon, trafficBorders[i].polygon))
        return true
    }
    return false
  }

  #move() {
    if (this.controls.foward) {
      this.speed += this.acceleration
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration
    }

    if (this.speed > this.maxSpeed)
      this.speed = this.maxSpeed

    if (this.speed < -(this.maxSpeed / 2))
      this.speed = -(this.maxSpeed / 2)

    if (this.speed > 0) {
      this.speed -= this.friction
    }

    if (this.speed < 0) {
      this.speed += this.friction
    }

    if (Math.abs(this.speed) < this.friction) this.speed = 0

    if (this.speed !== 0) {
      const flip = this.speed > 0 ? 1 : -1
      if (this.controls.left) {
        this.angle += 0.03 * flip
        // this.x -= 2
      }

      if (this.controls.right) {
        this.angle -= 0.03 * flip
        // this.x += 2
      }
    }




    this.x -= Math.sin(this.angle) * this.speed
    this.y -= Math.cos(this.angle) * this.speed
  }

  draw(ctx) {
    if (this.damage)
      ctx.fillStyle = 'gray'
    else
      ctx.fillStyle = this.color

    ctx.beginPath()
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y)

    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
    }

    ctx.fill()

    if (this.sensors && this.drawSensors)
      this.sensors.draw(ctx)
  }
}