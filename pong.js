// Constants
const WINDOW_WIDTH = 1200;
const WINDOW_HEIGHT = 900;
const PADDLE_WIDTH = 22;
const PADDLE_HEIGHT = 135;
const MIN_PADDLE_HEIGHT = 60;
const PADDLE_SHRINK_RATE = 8;
const BALL_SIZE = 22;
const PADDLE_SPEED = 8;

// Ball speed constants
const BALL_SPEED_INCREASE = 1.05;
const INITIAL_BALL_SPEED = 10;

// Colors
const WHITE = "rgb(255, 255, 255)";
const BLACK = "rgb(0, 0, 0)";
const BLUE = "rgb(0, 100, 255)";
const RED = "rgb(255, 0, 0)";
const GREEN = "rgb(0, 255, 0)";
const GRAY = "rgb(128, 128, 128)";
const ORANGE = "rgb(255, 165, 0)";
const YELLOW = "rgb(255, 255, 0)";
const PINK = "rgb(255, 192, 203)";
const DARK_BLUE = "rgb(0, 0, 139)";
const BRIGHT_RED = "rgb(255, 69, 0)";

// Fire effect colors
const FIRE_COLORS = [
  "rgb(255, 255, 0)",    // Yellow core
  "rgb(255, 165, 0)",    // Orange
  "rgb(255, 69, 0)",     // Red-Orange
  "rgb(255, 0, 0)"       // Red outer
];

// Fire effect constants
const FIRE_MIN_SPEED = INITIAL_BALL_SPEED;
const FIRE_MAX_SPEED = INITIAL_BALL_SPEED * 3;  // Adjust based on typical max speed
const FIRE_MIN_PARTICLES = 2;
const FIRE_MAX_PARTICLES = 5;

// Explosion effect constants
const EXPLOSION_DURATION = 0.5;  // seconds
const EXPLOSION_MIN_RADIUS = 10;
const EXPLOSION_MAX_RADIUS = 60;
const EXPLOSION_PARTICLES = 8;
const EXPLOSION_COLORS = [
  "rgb(255, 255, 0)",   // Yellow
  "rgb(255, 165, 0)",   // Orange
  "rgb(255, 69, 0)",    // Red-Orange
  "rgb(255, 0, 0)"      // Red
];

// Title color change interval (in seconds)
const TITLE_COLOR_CHANGE_INTERVAL = 0.5;

// Initialize canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Time variables
let lastTitleColorChange = Date.now();
let currentTitleColor = WHITE;

// Bot difficulty settings
const BOT_DIFFICULTY = {
    EASY: { speed: 4, reactionDelay: 0.3, predictionError: 100 },
    MEDIUM: { speed: 6, reactionDelay: 0.15, predictionError: 50 },
    HARD: { speed: 8, reactionDelay: 0.05, predictionError: 20 },
    ULTRA: { speed: 10, reactionDelay: 0, predictionError: 5 }
};

// UI Constants
const RING_RADIUS = 25;
const RING_THICKNESS = 5;
const RING_SPACING = 180;
const RING_BOTTOM_MARGIN = 45;
const RING_START_X = 100;
const TEXT_OFFSET = 35;

// Score options
const SCORE_OPTIONS = {
  '1': 1,
  '2': 2,
  '3': 5,
  '4': 10,
  '5': 15,
  '6': 20,
  '7': 50,
  '8': Infinity
};

// Key name mapping for display
const KEY_NAMES = {
  'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D',
  'e': 'E', 'f': 'F', 'g': 'G', 'h': 'H',
  'i': 'I', 'j': 'J', 'k': 'K', 'l': 'L',
  'm': 'M', 'n': 'N', 'o': 'O', 'p': 'P',
  'q': 'Q', 'r': 'R', 's': 'S', 't': 'T',
  'u': 'U', 'v': 'V', 'w': 'W', 'x': 'X',
  'y': 'Y', 'z': 'Z', '1': '1', '2': '2',
  '3': '3', '4': '4', '5': '5', '6': '6',
  '7': '7', '8': '8', '9': '9', '0': '0',
  'ArrowLeft': 'Left', 'ArrowRight': 'Right', 'ArrowUp': 'Up',
  'ArrowDown': 'Down', 'Space': 'Space', 'Enter': 'Enter',
  '/': '/', '.': '.', ',': ',',
  "'": "'", ';': ';', '-': '-',
  '=': '=', '`': '`', 'Tab': 'Tab'
};

// Fonts (using Canvas font styles)
const largeFont = '111px sans-serif';
const menuFont = '54px sans-serif';
const smallFont = '36px sans-serif';

// Helper function for random color
function getRandomColor() {
  return `rgb(${Math.floor(Math.random() * 205 + 50)}, ${Math.floor(Math.random() * 205 + 50)}, ${Math.floor(Math.random() * 205 + 50)})`;
}

// Draw the main menu
function drawMenu() {
  const currentTime = Date.now();
  if ((currentTime - lastTitleColorChange) / 1000 >= TITLE_COLOR_CHANGE_INTERVAL) {
    currentTitleColor = getRandomColor();
    lastTitleColorChange = currentTime;
  }
  
  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
  
  ctx.fillStyle = currentTitleColor;
  ctx.font = largeFont;
  const titleWidth = ctx.measureText("PONG").width;
  ctx.fillText("PONG", (WINDOW_WIDTH - titleWidth) / 2, 100);
  
  ctx.fillStyle = WHITE;
  ctx.font = menuFont;
  const onePlayerWidth = ctx.measureText("Press 1 for Single Player").width;
  ctx.fillText("Press 1 for Single Player", (WINDOW_WIDTH - onePlayerWidth) / 2, 300);
  const twoPlayerWidth = ctx.measureText("Press 2 for Two Players").width;
  ctx.fillText("Press 2 for Two Players", (WINDOW_WIDTH - twoPlayerWidth) / 2, 350);
}

// Countdown timer
function countdownTimer() {
  for (let i = 3; i > 0; i--) {
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
    ctx.fillStyle = WHITE;
    ctx.font = largeFont;
    const countText = i.toString();
    const countWidth = ctx.measureText(countText).width;
    ctx.fillText(countText, (WINDOW_WIDTH - countWidth) / 2, WINDOW_HEIGHT / 2);
    setTimeout(() => {}, 1000);
  }
  
  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
  ctx.fillStyle = WHITE;
  ctx.font = largeFont;
  const goText = "GO!";
  const goWidth = ctx.measureText(goText).width;
  ctx.fillText(goText, (WINDOW_WIDTH - goWidth) / 2, WINDOW_HEIGHT / 2);
  setTimeout(() => {}, 500);
}

// Initialize game
function startGame() {
  // To be implemented later
}

// Set up event listeners for key presses
window.addEventListener('keydown', function (event) {
  if (event.key === '1') {
    startGame();
  }
  if (event.key === '2') {
    startGame(true); // Two player mode
  }
});

// Draw the menu initially
drawMenu();
