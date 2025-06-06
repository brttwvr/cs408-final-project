// Based on game from https://github.com/kubowania/space-invaders

const grid = document.querySelector(".grid")
const resultDisplay = document.querySelector(".results")
let currentShooterIndex = 202
const width = 15
const aliensRemoved = []
let invadersId
let isGoingRight = true
let direction = 1
let results = 0

// Win counter
const winDisplay = document.querySelector(".wins")
let winCount = 0

// Loss counter
const lossDisplay = document.querySelector(".losses")
let lossCount = 0

// Lives counter
const livesDisplay = document.querySelector(".lives")
let lives = 3

// Restart button
const restartBtn = document.querySelector(".restart-btn")
let gameOver = false

// Pause button
const pauseBtn = document.querySelector(".pause-btn");
let isPaused = false;

// Shooter sprite selection
let selectedSprite = localStorage.getItem("sprite") || "shooter-clinton";
const spriteButtons = document.querySelectorAll(".sprite-btn");
spriteButtons.forEach(btn => {
  const sprite = btn.getAttribute("data-sprite");
  if (sprite === selectedSprite) btn.classList.add("selected");
  btn.addEventListener("click", () => {
    selectedSprite = sprite;
    localStorage.setItem("sprite", sprite);
    spriteButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    squares[currentShooterIndex].classList.remove("shooter-snider", "shooter-cooper", "shooter-simmons", "shooter-gwar", "shooter-bowie", "shooter-elvis", "shooter-clinton", "shooter-zappa");
    squares[currentShooterIndex].classList.add(selectedSprite);
  });
});

for (let i = 0; i < width * width; i++) {
  const square = document.createElement("div")
  grid.appendChild(square)
}

const squares = Array.from(document.querySelectorAll(".grid div"))

const alienInvaders = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
  30, 31, 32, 33, 34, 35, 36, 37, 38, 39
]

function draw() {
  for (let i = 0; i < alienInvaders.length; i++) {
    if (!aliensRemoved.includes(i)) {
      squares[alienInvaders[i]].classList.add("invader")
    }
  }
}

draw()
squares[currentShooterIndex].classList.add(selectedSprite)

function remove() {
  for (let i = 0; i < alienInvaders.length; i++) {
    squares[alienInvaders[i]].classList.remove("invader")
  }
}

function moveShooter(e) {
  squares[currentShooterIndex].classList.remove("shooter-snider", "shooter-cooper", "shooter-simmons", "shooter-gwar", "shooter-bowie", "shooter-elvis", "shooter-clinton", "shooter-zappa");
  switch (e.key) {
    case "ArrowLeft":
      if (currentShooterIndex % width !== 0) currentShooterIndex -= 1
      break
    case "ArrowRight":
      if (currentShooterIndex % width < width - 1) currentShooterIndex += 1
      break
  }
  squares[currentShooterIndex].classList.add(selectedSprite)
}

document.addEventListener("keydown", moveShooter)

function moveInvaders() {
  const leftEdge = alienInvaders[0] % width === 0
  const rightEdge = alienInvaders[alienInvaders.length - 1] % width === width - 1
  remove()

  if (rightEdge && isGoingRight) {
    for (let i = 0; i < alienInvaders.length; i++) {
      alienInvaders[i] += width + 1
    }
    direction = -1
    isGoingRight = false
  }

  if (leftEdge && !isGoingRight) {
    for (let i = 0; i < alienInvaders.length; i++) {
      alienInvaders[i] += width - 1
    }
    direction = 1
    isGoingRight = true
  }

  for (let i = 0; i < alienInvaders.length; i++) {
    alienInvaders[i] += direction
  }

  draw()

// Update to count lives and only show game over when out of lives
  if (squares[currentShooterIndex].classList.contains("invader")) {
    lives--
    livesDisplay.innerHTML = `Lives: ${lives}`
    clearInterval(invadersId)

    if (lives > 0) {
      setTimeout(resetRound, 2000)
    } else {
      resultDisplay.innerHTML = "GAME OVER"
      lossCount++
      lossDisplay.innerHTML = `Losses: ${lossCount}`
      gameOver = true

//   Update user's losses where available
      const username = localStorage.getItem("username")
      if (username) {
        fetch("https://upqugwxjmk.execute-api.us-east-2.amazonaws.com/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, losses: lossCount })
        });
      }
    }
  }

// Update to count wins
  if (aliensRemoved.length === alienInvaders.length) {
    resultDisplay.innerHTML = "YOU WIN"
    clearInterval(invadersId)
    winCount++
    winDisplay.innerHTML = `Wins: ${winCount}`

//   Update user's wins where available
    const username = localStorage.getItem("username")
    if (username) {
      fetch("https://upqugwxjmk.execute-api.us-east-2.amazonaws.com/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, wins: winCount })
      });
    }
    setTimeout(resetRound, 2000)
  }
}

invadersId = setInterval(moveInvaders, 600)

function shoot(e) {
  let laserId
  let currentLaserIndex = currentShooterIndex

  function moveLaser() {
    squares[currentLaserIndex].classList.remove("laser")
    currentLaserIndex -= width
    squares[currentLaserIndex].classList.add("laser")

    if (squares[currentLaserIndex].classList.contains("invader")) {
      squares[currentLaserIndex].classList.remove("laser")
      squares[currentLaserIndex].classList.remove("invader")
      squares[currentLaserIndex].classList.add("boom")

      setTimeout(() => squares[currentLaserIndex].classList.remove("boom"), 300)
      clearInterval(laserId)

      const alienRemoved = alienInvaders.indexOf(currentLaserIndex)
      aliensRemoved.push(alienRemoved)
      results++
      resultDisplay.innerHTML = results
    }
  }

  if (e.code === "Space") {
    laserId = setInterval(moveLaser, 100);
}
}

document.addEventListener('keydown', shoot)

// Function to reset 
function resetRound() {
    clearInterval(invadersId);
  
    squares.forEach(square => {
      square.classList.remove(
        "invader",
        "shooter-snider", "shooter-cooper", "shooter-simmons", "shooter-gwar", "shooter-bowie", "shooter-elvis", "shooter-clinton", "shooter-zappa",
        "laser",
        "boom"
      );
    });
  
    aliensRemoved.length = 0;
    results = 0;
    resultDisplay.innerHTML = results;
    currentShooterIndex = 202;
    squares[currentShooterIndex].classList.add(selectedSprite);
  
    for (let i = 0; i < alienInvaders.length; i++) {
      alienInvaders[i] = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39
      ][i];
    }
  
    draw();
  
    if (!gameOver && !isPaused) {
      invadersId = setInterval(moveInvaders, 600);
    }
  }

function resetGame() {
  lives = 3
  livesDisplay.innerHTML = `Lives: ${lives}`
  gameOver = false
  resultDisplay.innerHTML = 0
  resetRound()
}

restartBtn.addEventListener("click", resetGame)

// Function to pause game
pauseBtn.addEventListener("click", () => {
    if (isPaused) {
      invadersId = setInterval(moveInvaders, 600);
      pauseBtn.textContent = "Pause";
    } else {
      clearInterval(invadersId);
      pauseBtn.textContent = "Resume";
    }
    isPaused = !isPaused;
  });
  
