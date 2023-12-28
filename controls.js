class Controls {
  constructor(type) {
    this.foward = false
    this.left = false
    this.right = false
    this.reverse = false

    switch (type) {
      case 'KEYS':
        this.#addKeyboardListeners()
        break
      case 'DUMMY':
        this.foward = true
        break
    }
  }

  #addKeyboardListeners() {
    document.onkeyup = (event) => {
      switch (event.key) {
        case 'ArrowRight':
          this.right = false
          break
        case 'ArrowUp':
          this.foward = false
          break
        case 'ArrowDown':
          this.reverse = false
          break
        case 'ArrowLeft':
          this.left = false
          break
      }
    }
    document.onkeydown = (event) => {
      switch (event.key) {
        case 'ArrowRight':
          this.right = true
          break
        case 'ArrowUp':
          this.foward = true
          break
        case 'ArrowDown':
          this.reverse = true
          break
        case 'ArrowLeft':
          this.left = true
          break
      }
    }

  }
}