const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
  constructor() {
    this.width = 50;
    this.height = 50;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 10;
    this.speed = 5;
    this.dx = 0;
  }

  draw() {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.x += this.dx;

    // Prevent player from going out of canvas
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x + this.width > canvas.width) {
      this.x = canvas.width - this.width;
    }

    this.draw();
  }

  moveRight() {
    this.dx = this.speed;
  }

  moveLeft() {
    this.dx = -this.speed;
  }

  stop() {
    this.dx = 0;
  }
}

class Bullet {
  constructor(x, y) {
    this.width = 5;
    this.height = 20;
    this.x = x;
    this.y = y;
    this.dy = -7;
  }

  draw() {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y += this.dy;
    this.draw();
  }
}

class Enemy {
  constructor(x, y, speed, color, points) {
    this.width = 50;
    this.height = 50;
    this.x = x;
    this.y = y;
    this.dy = speed;
    this.color = color;
    this.points = points;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y += this.dy;
    this.draw();
  }
}

let player;
let bullets;
let enemies;
let gameOver;
let score;
let enemySpeed;

function init() {
  player = new Player();
  bullets = [];
  enemies = [];
  gameOver = false;
  score = 0;
  enemySpeed = 3;
}

function handlePlayerMovement() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      player.moveRight();
    } else if (e.key === 'ArrowLeft') {
      player.moveLeft();
    } else if (e.key === ' ' && !gameOver) {
      bullets.push(new Bullet(player.x + player.width / 2 - 2.5, player.y));
    } else if (e.key === ' ' && gameOver) {
      init();
      update();
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      player.stop();
    }
  });
}

function spawnEnemies() {
  const colors = ['blue', 'red', 'yellow'];
  const points = { blue: 10, red: 20, yellow: 30 };

  setInterval(() => {
    if (!gameOver) {
      const x = Math.random() * (canvas.width - 50);
      const y = -50;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const enemy = new Enemy(x, y, enemySpeed, color, points[color]);
      enemies.push(enemy);
    }
  }, 1000);
}

function detectCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function endGame() {
  gameOver = true;
  ctx.fillStyle = 'red';
  ctx.font = '48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
  ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 50);
}

function updateScore() {
  ctx.fillStyle = 'white';
  ctx.font = '24px sans-serif';
  ctx.fillText(`Score: ${score}`, 10, 30);
}

function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.update();

  bullets.forEach((bullet, bIndex) => {
    bullet.update();

    // Remove bullets that are off the screen
    if (bullet.y + bullet.height < 0) {
      bullets.splice(bIndex, 1);
    }

    enemies.forEach((enemy, eIndex) => {
      if (detectCollision(bullet, enemy)) {
        enemies.splice(eIndex, 1);
        bullets.splice(bIndex, 1);
        score += enemy.points;  // Add points based on enemy color
        if (score % 50 === 0) {  // Increase enemy speed every 50 points
          enemySpeed += 1;
        }
      }
    });
  });

  enemies.forEach((enemy, index) => {
    enemy.update();

    // Check for collision with player
    if (detectCollision(player, enemy)) {
      endGame();
    }

    // Remove enemies that are off the screen
    if (enemy.y > canvas.height) {
      enemies.splice(index, 1);
    }
  });

  updateScore();

  requestAnimationFrame(update);
}

init();
handlePlayerMovement();
spawnEnemies();
update();
