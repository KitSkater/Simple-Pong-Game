const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;
const PLAYER_X = 10;
const AI_X = canvas.width - PADDLE_WIDTH - 10;
const PADDLE_RADIUS = 8; // for rounded paddle corners

// Game state
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ball = {
    x: canvas.width / 2 - BALL_SIZE / 2,
    y: canvas.height / 2 - BALL_SIZE / 2,
    vx: 4 * (Math.random() > 0.5 ? 1 : -1),
    vy: 3 * (Math.random() > 0.5 ? 1 : -1),
    speed: 5
};

// Mouse control
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    // Clamp paddle within canvas
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Drawing functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawPaddle(x, y, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + PADDLE_RADIUS, y);
    ctx.lineTo(x + PADDLE_WIDTH - PADDLE_RADIUS, y);
    ctx.quadraticCurveTo(x + PADDLE_WIDTH, y, x + PADDLE_WIDTH, y + PADDLE_RADIUS);
    ctx.lineTo(x + PADDLE_WIDTH, y + PADDLE_HEIGHT - PADDLE_RADIUS);
    ctx.quadraticCurveTo(x + PADDLE_WIDTH, y + PADDLE_HEIGHT, x + PADDLE_WIDTH - PADDLE_RADIUS, y + PADDLE_HEIGHT);
    ctx.lineTo(x + PADDLE_RADIUS, y + PADDLE_HEIGHT);
    ctx.quadraticCurveTo(x, y + PADDLE_HEIGHT, x, y + PADDLE_HEIGHT - PADDLE_RADIUS);
    ctx.lineTo(x, y + PADDLE_RADIUS);
    ctx.quadraticCurveTo(x, y, x + PADDLE_RADIUS, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawBall(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
}

function drawCenterLine() {
    ctx.strokeStyle = '#888';
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Collision detection
function checkCollision(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Game update
function update() {
    // Update ball position
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Ball collision with top/bottom
    if (ball.y <= 0 || ball.y + BALL_SIZE >= canvas.height) {
        ball.vy *= -1;
        ball.y = Math.max(0, Math.min(canvas.height - BALL_SIZE, ball.y));
    }

    // Ball collision with player paddle
    if (checkCollision(ball.x, ball.y, BALL_SIZE, BALL_SIZE, PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT)) {
        ball.x = PLAYER_X + PADDLE_WIDTH;
        ball.vx *= -1.1; // reflect & increase speed
        // Add a bit of "spin" depending on where it hit the paddle
        let hit = (ball.y + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
        ball.vy = hit * 0.2;
    }

    // Ball collision with AI paddle
    if (checkCollision(ball.x, ball.y, BALL_SIZE, BALL_SIZE, AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT)) {
        ball.x = AI_X - BALL_SIZE;
        ball.vx *= -1.1;
        let hit = (ball.y + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
        ball.vy = hit * 0.2;
    }

    // Ball out of bounds (score)
    if (ball.x < 0 || ball.x > canvas.width) {
        resetBall();
    }

    // Basic AI: move AI paddle towards ball
    let aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (aiCenter < ball.y + BALL_SIZE / 2 - 10) {
        aiY += 3.2;
    } else if (aiCenter > ball.y + BALL_SIZE / 2 + 10) {
        aiY -= 3.2;
    }
    // Clamp AI paddle within canvas
    aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

function resetBall() {
    ball.x = canvas.width / 2 - BALL_SIZE / 2;
    ball.y = canvas.height / 2 - BALL_SIZE / 2;
    ball.vx = 4 * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = 3 * (Math.random() > 0.5 ? 1 : -1);
}

// Game render
function render() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Draw paddles & ball
    drawPaddle(PLAYER_X, playerY, '#0f0');
    drawPaddle(AI_X, aiY, '#f00');
    drawBall(ball.x, ball.y, BALL_SIZE, '#fff');
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();