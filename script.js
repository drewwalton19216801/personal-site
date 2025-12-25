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

termInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const command = this.value.toLowerCase().trim();
    let response = "";

    switch (command) {
      case "help":
        response =
          "Available commands: \n- whoami: About Drew\n- stack: Tech stack\n- contact: Email me\n- clear: Clear terminal\n- snake: It's a joke, I didn't code snake here.";
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
        response = "Error: Python not found. Just kidding, maybe in v2.";
        break;
      case "clear":
        termOutput.innerText = "Visitor@DREW-PORTFOLIO:~$ ";
        this.value = "";
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
