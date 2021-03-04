function newElement(tagName, className) {
  const elem = document.createElement(tagName)
  elem.className = className
  return elem
}

function Barrier(reverse = false) {
  this.elem = newElement('div', 'barrier')

  const pipeEdge = newElement('div', 'pipeEdge')
  const pipeBody = newElement('div', 'pipeBody')
  this.elem.appendChild(reverse ? pipeBody : pipeEdge)
  this.elem.appendChild(reverse ? pipeEdge : pipeBody)

  this.setHeight = height => pipeBody.style.height = `${height}px`
}

function BarrierPair(height, gap, x) {
  this.elem = newElement('div', 'barrier-pair')

  this.superior = new Barrier(true)
  this.inferior = new Barrier(false)

  this.elem.appendChild(this.superior.elem)
  this.elem.appendChild(this.inferior.elem)

  this.randomGap = () => {
    const supHeight = Math.random() * (height - gap)
    const infHeight = height - gap - supHeight
    this.superior.setHeight(supHeight)
    this.inferior.setHeight(infHeight)
  }

  this.getX = () => parseInt(this.elem.style.left.split('px')[0])
  this.setX = x => this.elem.style.left = `${x}px`
  this.getWidth = () => this.elem.clientWidth

  this.randomGap()
  this.setX(x)
}

function Barriers(height, width, gap, distance, updateScore) {
  this.pairs = [
    new BarrierPair(height, gap, width),
    new BarrierPair(height, gap, width + distance),
    new BarrierPair(height, gap, width + distance * 2),
    new BarrierPair(height, gap, width + distance * 3)
  ]

  const slide = 3
  this.animate = () => {
    this.pairs.forEach(pair => {
      pair.setX(pair.getX() - slide)

      //when barriers exit out of game area
      if (pair.getX() < -pair.getWidth()) {
        pair.setX(pair.getX() + distance * this.pairs.length)
        pair.randomGap()
      }
      const half = (width / 2) - 180
      const crossedHalf = pair.getX() + slide >= half
        && pair.getX() < half
      if (crossedHalf) updateScore()
    })
  }
}

function Bird(gameHeight) {
  let flying = false

  this.elem = newElement('img', 'bird')
  this.elem.src = 'imgs/bird.png'

  this.getY = () => parseInt(this.elem.style.bottom.split('px')[0])
  this.setY = y => this.elem.style.bottom = `${y}px`
  //holding any keyboard key or touching screen - bird flies up
  window.onkeydown = e => flying = true
  window.ontouchstart = e => flying = true
  //relasing keyboard key or not touching screen - bird flies down
  window.onkeyup = e => flying = false
  window.ontouchend = e => flying = false

  this.animate = () => {
    const newY = this.getY() + (flying ? 6 : -3)
    const maxHeight = gameHeight - this.elem.clientHeight

    if (newY <= 0) {
      this.setY(0)
    } else if (newY >= maxHeight) {
      this.setY(maxHeight)
    } else {
      this.setY(newY)
    }
  }

  this.setY(gameHeight / 2)
}



function Progress() {
  this.elem = newElement('span', 'progress')
  this.updateScore = score => {
    this.elem.innerHTML = `Score ${score}`
  }
  this.updateScore(0)
}

function HighScore() {
  this.elem = newElement('span', 'high-score')
  if (!localStorage.flappyhighscore) {
    localStorage.flappyhighscore = 0
  } 
  const storedScore = Number(localStorage.flappyhighscore)
  this.elem.innerHTML = `High Score ${storedScore}`
  this.updateHighScore = highScore => {
    if (highScore > storedScore) {
      this.elem.innerHTML = `High Score ${highScore}`
      localStorage.flappyhighscore = highScore
    }
  }
}

function overlapping(elemA, elemB) {
  const a = elemA.getBoundingClientRect()
  const b = elemB.getBoundingClientRect()
  const horizontal = a.left + a.width >= b.left &&
    b.left + b.width >= a.left
  const vertical = a.top + a.height >= b.top &&
    b.top + b.height >= a.top
  return horizontal && vertical
}

function bumped(bird, barriers) {
  let bumped = false
  barriers.pairs.forEach(barrierPair => {
    if (!bumped) {
      const superior = barrierPair.superior.elem
      const inferior = barrierPair.inferior.elem
      bumped = overlapping(bird.elem, superior) ||
        overlapping(bird.elem, inferior)
    }
  })
  return bumped
}

function FlappyBird() {
  let score = 0

  const gameArea = document.querySelector('[flappy]')
  const height = gameArea.clientHeight
  const width = gameArea.clientWidth

  const progress = new Progress()
  const highScore = new HighScore()
  const barriers = new Barriers(height, width, 200, 400,
    () => progress.updateScore(++score))
  const bird = new Bird(height)

  gameArea.appendChild(progress.elem)
  gameArea.appendChild(highScore.elem)
  gameArea.appendChild(bird.elem)
  barriers.pairs.forEach(pair => gameArea.appendChild(pair.elem))

  this.start = () => {
    //game loop
    const timer = setInterval(() => {
      barriers.animate()
      bird.animate()
      if (bumped(bird, barriers)) {
        clearInterval(timer)
        highScore.updateHighScore(score)
        const gameOver = newElement('span', 'game-over')
        gameOver.innerHTML = "Game Over!!"
        gameArea.appendChild(gameOver)
        const restart = newElement('span', 'restart')
        restart.innerHTML = "Refresh to restart!"
        gameArea.appendChild(restart)
      }
    }, 20)
  }
}

new FlappyBird().start()