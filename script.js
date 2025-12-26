// --- Scramble Text Effect for Logo ---
const logo = document.getElementById("logo-text");
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]";
const originalText = logo.innerText;

logo.addEventListener("mouseover", () => {
  let iterations = 0;
  const interval = setInterval(() => {
    logo.innerText = originalText
      .split("")
      .map((letter, index) => {
        if (index < iterations) return originalText[index];
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join("");

    if (iterations >= originalText.length) clearInterval(interval);
    iterations += 1 / 3;
  }, 30);
});

// --- Hero Canvas Animation (Matrix / Particles) ---
const canvas = document.getElementById("hero-canvas");
const ctx = canvas.getContext("2d");

let width, height;
let particles = [];

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 2;
    this.color = Math.random() > 0.9 ? "#ccff00" : "#333"; // Mostly dark, some lime
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 100; i++) particles.push(new Particle());
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  // Connect particles near mouse
  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
resize();
initParticles();
animate();

// --- Terminal Logic ---
const termInput = document.getElementById("term-input");
const termOutput = document.getElementById("term-output");
const snakeCanvas = document.getElementById("snake-canvas");
const snakeCtx = snakeCanvas.getContext("2d");
const dpadControls = document.getElementById("dpad-controls");
const snakeGameContainer = document.getElementById("snake-game-container");

// DEBUG: Log terminal dimensions on page load
window.addEventListener('load', () => {
  const termWrapper = document.querySelector('.terminal-wrapper');
  console.log('=== TERMINAL DEBUG INFO ===');
  console.log('Terminal wrapper height:', termWrapper.offsetHeight + 'px');
  console.log('Terminal output height:', termOutput.offsetHeight + 'px');
  console.log('Terminal output scrollHeight:', termOutput.scrollHeight + 'px');
  console.log('Terminal output computed style:', window.getComputedStyle(termOutput).height);
  console.log('Terminal wrapper computed style:', window.getComputedStyle(termWrapper).height);
  console.log('Terminal output content:', termOutput.innerText);
  console.log('==========================');
});

// Snake Game State
let snakeGame = {
  running: false,
  snake: [],
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
  food: { x: 0, y: 0 },
  gridSize: 20,
  canvasSize: 400,
  score: 0,
  gameLoop: null,
  speed: 150
};

// Initialize snake canvas
snakeCanvas.width = snakeGame.canvasSize;
snakeCanvas.height = snakeGame.canvasSize;

function initSnakeGame() {
  snakeGame.snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  snakeGame.direction = { x: 1, y: 0 };
  snakeGame.nextDirection = { x: 1, y: 0 };
  snakeGame.score = 0;
  snakeGame.running = true;
  spawnFood();
  snakeGameContainer.style.display = "block";
  
  // Show d-pad on touch devices
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    dpadControls.style.display = "block";
  }
  
  termInput.disabled = true;
  termInput.placeholder = "Use arrow keys to control snake";
  
  if (snakeGame.gameLoop) clearInterval(snakeGame.gameLoop);
  snakeGame.gameLoop = setInterval(updateSnakeGame, snakeGame.speed);
}

function spawnFood() {
  const maxPos = snakeGame.canvasSize / snakeGame.gridSize;
  do {
    snakeGame.food = {
      x: Math.floor(Math.random() * maxPos),
      y: Math.floor(Math.random() * maxPos)
    };
  } while (snakeGame.snake.some(segment => segment.x === snakeGame.food.x && segment.y === snakeGame.food.y));
}

function updateSnakeGame() {
  if (!snakeGame.running) return;

  // Update direction
  snakeGame.direction = { ...snakeGame.nextDirection };

  // Calculate new head position
  const head = {
    x: snakeGame.snake[0].x + snakeGame.direction.x,
    y: snakeGame.snake[0].y + snakeGame.direction.y
  };

  // Check wall collision
  const maxPos = snakeGame.canvasSize / snakeGame.gridSize;
  if (head.x < 0 || head.x >= maxPos || head.y < 0 || head.y >= maxPos) {
    gameOver();
    return;
  }

  // Check self collision
  if (snakeGame.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return;
  }

  // Add new head
  snakeGame.snake.unshift(head);

  // Check food collision
  if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
    snakeGame.score += 10;
    spawnFood();
  } else {
    snakeGame.snake.pop();
  }

  drawSnakeGame();
}

function drawSnakeGame() {
  // Clear canvas
  snakeCtx.fillStyle = "#000";
  snakeCtx.fillRect(0, 0, snakeGame.canvasSize, snakeGame.canvasSize);

  // Draw grid (subtle)
  snakeCtx.strokeStyle = "#1a1a1a";
  snakeCtx.lineWidth = 0.5;
  for (let i = 0; i <= snakeGame.canvasSize; i += snakeGame.gridSize) {
    snakeCtx.beginPath();
    snakeCtx.moveTo(i, 0);
    snakeCtx.lineTo(i, snakeGame.canvasSize);
    snakeCtx.stroke();
    snakeCtx.beginPath();
    snakeCtx.moveTo(0, i);
    snakeCtx.lineTo(snakeGame.canvasSize, i);
    snakeCtx.stroke();
  }

  // Draw food
  snakeCtx.fillStyle = "#ccff00";
  snakeCtx.fillRect(
    snakeGame.food.x * snakeGame.gridSize + 2,
    snakeGame.food.y * snakeGame.gridSize + 2,
    snakeGame.gridSize - 4,
    snakeGame.gridSize - 4
  );

  // Draw snake
  snakeGame.snake.forEach((segment, index) => {
    snakeCtx.fillStyle = index === 0 ? "#ccff00" : "#888";
    snakeCtx.fillRect(
      segment.x * snakeGame.gridSize + 1,
      segment.y * snakeGame.gridSize + 1,
      snakeGame.gridSize - 2,
      snakeGame.gridSize - 2
    );
  });

  // Draw score
  snakeCtx.fillStyle = "#ccff00";
  snakeCtx.font = "14px JetBrains Mono";
  snakeCtx.fillText(`Score: ${snakeGame.score}`, 10, snakeGame.canvasSize - 10);
}

function gameOver() {
  snakeGame.running = false;
  clearInterval(snakeGame.gameLoop);
  
  // Draw game over on canvas
  snakeCtx.fillStyle = "rgba(0, 0, 0, 0.8)";
  snakeCtx.fillRect(0, 0, snakeGame.canvasSize, snakeGame.canvasSize);
  
  snakeCtx.fillStyle = "#ccff00";
  snakeCtx.font = "bold 24px JetBrains Mono";
  snakeCtx.textAlign = "center";
  snakeCtx.fillText("GAME OVER", snakeGame.canvasSize / 2, snakeGame.canvasSize / 2 - 40);
  
  snakeCtx.font = "16px JetBrains Mono";
  snakeCtx.fillText(`Final Score: ${snakeGame.score}`, snakeGame.canvasSize / 2, snakeGame.canvasSize / 2 - 10);
  
  // High score prompt
  snakeCtx.font = "12px JetBrains Mono";
  snakeCtx.fillStyle = "#ccff00";
  snakeCtx.fillText("Got a high score?", snakeGame.canvasSize / 2, snakeGame.canvasSize / 2 + 20);
  snakeCtx.fillText("Send it to hi@dwalton.info", snakeGame.canvasSize / 2, snakeGame.canvasSize / 2 + 35);
  snakeCtx.fillText("with a screenshot!", snakeGame.canvasSize / 2, snakeGame.canvasSize / 2 + 50);
  
  // Check if touch device
  snakeCtx.fillStyle = "#ccff00";
  snakeCtx.font = "14px JetBrains Mono";
  snakeCtx.fillText("Press 'r' or tap to restart", snakeGame.canvasSize / 2, snakeGame.canvasSize / 2 + 75);
  snakeCtx.textAlign = "left";
}

function stopSnakeGame() {
  snakeGame.running = false;
  if (snakeGame.gameLoop) clearInterval(snakeGame.gameLoop);
  snakeGameContainer.style.display = "none";
  dpadControls.style.display = "none";
  termInput.disabled = false;
  termInput.placeholder = "";
  termInput.focus();
}

// Keyboard controls for snake game
document.addEventListener("keydown", function (e) {
  if (!snakeGame.running && snakeGameContainer.style.display === "block") {
    // Game over state - allow restart
    if (e.key.toLowerCase() === "r") {
      initSnakeGame();
    }
    return;
  }

  if (!snakeGame.running) return;

  switch (e.key) {
    case "ArrowUp":
      if (snakeGame.direction.y !== 1) {
        snakeGame.nextDirection = { x: 0, y: -1 };
      }
      e.preventDefault();
      break;
    case "ArrowDown":
      if (snakeGame.direction.y !== -1) {
        snakeGame.nextDirection = { x: 0, y: 1 };
      }
      e.preventDefault();
      break;
    case "ArrowLeft":
      if (snakeGame.direction.x !== 1) {
        snakeGame.nextDirection = { x: -1, y: 0 };
      }
      e.preventDefault();
      break;
    case "ArrowRight":
      if (snakeGame.direction.x !== -1) {
        snakeGame.nextDirection = { x: 1, y: 0 };
      }
      e.preventDefault();
      break;
    case "Escape":
      stopSnakeGame();
      break;
  }
});

// --- Mobile D-Pad Touch Controls ---
const dpadQuadrants = document.querySelectorAll('.dpad-quadrant');

function handleDirectionChange(direction) {
  if (!snakeGame.running) return;

  switch (direction) {
    case 'up':
      if (snakeGame.direction.y !== 1) {
        snakeGame.nextDirection = { x: 0, y: -1 };
      }
      break;
    case 'down':
      if (snakeGame.direction.y !== -1) {
        snakeGame.nextDirection = { x: 0, y: 1 };
      }
      break;
    case 'left':
      if (snakeGame.direction.x !== 1) {
        snakeGame.nextDirection = { x: -1, y: 0 };
      }
      break;
    case 'right':
      if (snakeGame.direction.x !== -1) {
        snakeGame.nextDirection = { x: 1, y: 0 };
      }
      break;
  }
}

// Add touch event listeners to each d-pad quadrant
dpadQuadrants.forEach(quadrant => {
  const direction = quadrant.dataset.direction;

  // Touch start
  quadrant.addEventListener('touchstart', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if game over - restart on tap
    if (!snakeGame.running && snakeGameContainer.style.display === "block") {
      initSnakeGame();
      return;
    }
    
    handleDirectionChange(direction);
    quadrant.classList.add('active');
  }, { passive: false });

  // Touch end
  quadrant.addEventListener('touchend', function(e) {
    e.preventDefault();
    e.stopPropagation();
    quadrant.classList.remove('active');
  }, { passive: false });

  // Touch cancel
  quadrant.addEventListener('touchcancel', function(e) {
    e.preventDefault();
    e.stopPropagation();
    quadrant.classList.remove('active');
  }, { passive: false });

  // Mouse events for desktop testing
  quadrant.addEventListener('mousedown', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if game over - restart on click
    if (!snakeGame.running && snakeGameContainer.style.display === "block") {
      initSnakeGame();
      return;
    }
    
    handleDirectionChange(direction);
    quadrant.classList.add('active');
  });

  quadrant.addEventListener('mouseup', function(e) {
    quadrant.classList.remove('active');
  });

  quadrant.addEventListener('mouseleave', function(e) {
    quadrant.classList.remove('active');
  });
});

termInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const command = this.value.toLowerCase().trim();
    let response = "";

    switch (command) {
      case "help":
        response =
          "Available commands: \n- whoami: About Drew\n- stack: Tech stack\n- contact: Email me\n- clear: Clear terminal\n- snake: Play snake game!";
        break;
      case "whoami":
        response = "Drew Walton. Engineer. Builder. 2025.";
        break;
      case "stack":
        response = "Rust, Go, PHP, Laravel, React, Linux.";
        break;
      case "contact":
        response = "Opening mail client...";
        window.location.href = "mailto:hi@dwalton.info";
        break;
      case "snake":
        response = "Starting snake game...\nUse arrow keys or touch controls to move. Press ESC to quit.";
        initSnakeGame();
        break;
      case "clear":
        termOutput.innerText = "Visitor@DREW-PORTFOLIO:~$ ";
        this.value = "";
        stopSnakeGame();
        return; // Exit early
      default:
        response = `Command not found: ${command}. Try 'help'.`;
    }

    const prompt = "Visitor@DREW-PORTFOLIO:~$";
    if (termOutput.innerText.includes("type 'help' for commands...")) {
      termOutput.innerText = `${prompt} ${this.value}\n> ${response}`;
    } else {
      termOutput.innerText += `\n${prompt} ${this.value}\n> ${response}`;
    }
    this.value = "";
    // Auto scroll to bottom
    termOutput.scrollTop = termOutput.scrollHeight;
    // Scroll the entire page to the bottom
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });
  }
});
