class ModernSnakeGame {
  constructor() {
    this.startBtn = document.getElementById("startTimerBtn")
    this.playBoard = document.querySelector(".play-board")
    this.scoreElement = document.querySelector(".score")
    this.highScoreElement = document.querySelector(".high-score")
    this.controls = document.querySelectorAll(".control-btn")
    this.colorPicker = document.getElementById("snakeColorPicker")
    this.bgMusic = document.getElementById("gameBGM")
    this.gameOverSound = document.getElementById("gameOverSound")
    this.timerDisplay = document.getElementById("snakeTimerDisplay")
    this.timerSelect = document.getElementById("timerSelect")

    this.gameOver = false
    this.gamePaused = false
    this.foodList = []
    this.specialFood = null
    this.snakeX = 50
    this.snakeY = 50
    this.snakeBody = []
    this.velocityX = 0
    this.velocityY = 0
    this.setIntervalId = null
    this.timerInterval = null
    this.score = 0
    this.gridSize = window.innerWidth <= 768 ? 20 : 25
    this.snakeColor = localStorage.getItem("snakeColor") || "#00ff88"
    this.highScore = localStorage.getItem("high-score") || 0
    this.timeLeft = 0 // detik

    this.init()
  }

  init() {
    this.highScoreElement.innerText = this.highScore
    this.colorPicker.value = this.snakeColor
    this.setupEventListeners()
    this.updateCSSCustomProperty()
  }

  setupEventListeners() {
    this.startBtn.addEventListener("click", () => this.startGame())

    this.colorPicker.addEventListener("input", (e) => {
      this.changeSnakeColor(e.target.value)
    })

    this.controls.forEach((control) => {
      control.addEventListener("click", (e) => {
        e.preventDefault()
        this.handleMobileDirection(control.dataset.key)
      })

      control.addEventListener("touchstart", (e) => {
        e.preventDefault()
        this.handleMobileDirection(control.dataset.key)
      })
    })

    document.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Escape") {
        e.preventDefault()
        this.togglePause()
      } else {
        this.changeDirection(e)
      }
    })
  }

  handleMobileDirection(direction) {
    if (this.gameOver || this.gamePaused) return

    switch (direction) {
      case "ArrowUp":
        if (this.velocityY !== 1) { this.velocityX = 0; this.velocityY = -1 }
        break
      case "ArrowDown":
        if (this.velocityY !== -1) { this.velocityX = 0; this.velocityY = 1 }
        break
      case "ArrowLeft":
        if (this.velocityX !== 1) { this.velocityX = -1; this.velocityY = 0 }
        break
      case "ArrowRight":
        if (this.velocityX !== -1) { this.velocityX = 1; this.velocityY = 0 }
        break
    }
  }

  startGame() {
    this.bgMusic.currentTime = 0
    this.bgMusic.play().catch(() => {})

    document.querySelector(".snake-customizer").style.display = "none"

    this.resetGame()
    this.changeFoodPosition()

    // mulai timer countdown
    const selectedTime = parseInt(this.timerSelect.value)
    if (selectedTime > 0) {
      this.timeLeft = selectedTime
      this.timerDisplay.style.display = "flex";
      this.timerDisplay.querySelector("#timeLeft").innerText = this.timeLeft

      this.timerInterval = setInterval(() => {
        if (!this.gamePaused && !this.gameOver) {
          this.timeLeft--
          this.timerDisplay.querySelector("#timeLeft").innerText = this.timeLeft
          if (this.timeLeft <= 0) {
            this.handleGameOver()
          }
        }
      }, 1000)
    } else {
      this.timerDisplay.classList.add("hidden")
    }

    // add initial head
    this.snakeBody.push([this.snakeX, this.snakeY])
    this.velocityX = 1
    this.velocityY = 0

    this.setIntervalId = setInterval(() => this.initGame(), 150)
  }

  resetGame() {
    this.gameOver = false
    this.gamePaused = false
    this.score = 0
    this.snakeX = Math.floor(this.gridSize / 2)
    this.snakeY = Math.floor(this.gridSize / 2)
    this.snakeBody = []
    this.velocityX = 0
    this.velocityY = 0
    this.scoreElement.innerText = "0"

    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }

  changeFoodPosition() {
    this.foodList = []

    const padding = 2
    const min = Math.floor(this.gridSize * 0.3)
    const max = Math.floor(this.gridSize * 0.7)

    for (let i = 0; i < 2; i++) {
      const x = Math.floor(Math.random() * (max - min)) + min
      const y = Math.floor(Math.random() * (max - min)) + min
      this.foodList.push({ x, y })
    }

    if (Math.random() < 0.10) {
      this.specialFood = {
        x: Math.floor(Math.random() * (this.gridSize - padding * 2)) + padding,
        y: Math.floor(Math.random() * (this.gridSize - padding * 2)) + padding
      }
    } else {
      this.specialFood = null
    }
  }

  changeDirection(e) {
    if (this.gameOver || this.gamePaused) return

    const key = e.key
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
      e.preventDefault()
    }

    if (key === "ArrowUp" && this.velocityY !== 1) {
      this.velocityX = 0; this.velocityY = -1
    } else if (key === "ArrowDown" && this.velocityY !== -1) {
      this.velocityX = 0; this.velocityY = 1
    } else if (key === "ArrowLeft" && this.velocityX !== 1) {
      this.velocityX = -1; this.velocityY = 0
    } else if (key === "ArrowRight" && this.velocityX !== -1) {
      this.velocityX = 1; this.velocityY = 0
    }
  }

  changeSnakeColor(color) {
    this.snakeColor = color
    localStorage.setItem("snakeColor", color)
    this.updateCSSCustomProperty()
  }

  updateCSSCustomProperty() {
    document.documentElement.style.setProperty("--snake-color", this.snakeColor)
  }

  togglePause() {
    if (this.gameOver || (this.velocityX === 0 && this.velocityY === 0)) return

    if (this.gamePaused) this.resumeGame()
    else this.pauseGame()
  }

  pauseGame() {
    this.gamePaused = true
    clearInterval(this.setIntervalId)
    document.getElementById("pauseModal").style.display = "flex"
    this.bgMusic.pause()
  }

  resumeGame() {
    this.gamePaused = false
    document.getElementById("pauseModal").style.display = "none"
    this.setIntervalId = setInterval(() => this.initGame(), 150)
    this.bgMusic.play().catch(() => {})
  }

  handleGameOver() {
    this.gameOver = true
    clearInterval(this.setIntervalId)
    if (this.timerInterval) clearInterval(this.timerInterval)

    this.bgMusic.pause()
    this.bgMusic.currentTime = 0
    this.gameOverSound.currentTime = 0
    this.gameOverSound.play().catch(() => {})

    if (this.score > this.highScore) {
      this.highScore = this.score
      localStorage.setItem("high-score", this.highScore)
      this.highScoreElement.innerText = this.highScore
    }

    document.getElementById("finalScore").innerText = this.score
    document.getElementById("gameOverModal").style.display = "flex"
  }

  initGame() {
    if (this.gameOver) return

    let htmlMarkup = ""
    this.foodList.forEach(food => {
      htmlMarkup += `<div class="food" style="grid-area:${food.y}/${food.x}"></div>`
    })

    if (this.specialFood) {
      htmlMarkup += `<div class="gold-food" style="grid-area:${this.specialFood.y}/${this.specialFood.x}"></div>`
    }

    this.foodList.forEach((food, index) => {
      if (this.snakeX === food.x && this.snakeY === food.y) {
        this.score += 10
        this.snakeBody.push([food.x, food.y])
        this.foodList.splice(index, 1)
      }
    })

    if (this.foodList.length === 0) this.changeFoodPosition()

    if (this.specialFood && this.snakeX === this.specialFood.x && this.snakeY === this.specialFood.y) {
      this.score += 50
      this.snakeBody.push([this.specialFood.x, this.specialFood.y])
      this.specialFood = null
    }

    this.scoreElement.innerText = this.score

    for (let i = this.snakeBody.length - 1; i > 0; i--) {
      this.snakeBody[i] = this.snakeBody[i - 1]
    }
    this.snakeBody[0] = [this.snakeX, this.snakeY]

    this.snakeX += this.velocityX
    this.snakeY += this.velocityY

    if (this.snakeX <= 0) this.snakeX = this.gridSize
    else if (this.snakeX > this.gridSize) this.snakeX = 1

    if (this.snakeY <= 0) this.snakeY = this.gridSize
    else if (this.snakeY > this.gridSize) this.snakeY = 1

    for (let i = 0; i < this.snakeBody.length; i++) {
      htmlMarkup += `<div class="head" style="grid-area:${this.snakeBody[i][1]}/${this.snakeBody[i][0]};background:${this.snakeColor}"></div>`
      if (i !== 0 && this.snakeBody[0][0] === this.snakeBody[i][0] && this.snakeBody[0][1] === this.snakeBody[i][1]) {
        this.handleGameOver()
      }
    }

    this.playBoard.innerHTML = htmlMarkup
  }
}

// Functions global
function restartGame() {
  document.getElementById("gameOverModal").style.display = "none"
  document.querySelector(".snake-customizer").style.display = "block"
  location.reload()
}

function resumeGame() {
  if (window.game) window.game.resumeGame()
}

document.addEventListener("DOMContentLoaded", () => {
  window.game = new ModernSnakeGame()
})

window.addEventListener("resize", () => {
  if (
    (window.innerWidth <= 768 && window.game.gridSize === 25) ||
    (window.innerWidth > 768 && window.game.gridSize === 20)
  ) {
    location.reload()
  }
})
