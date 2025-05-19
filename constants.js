// Canvas dimensions
const WINDOW_WIDTH = 1200;
const WINDOW_HEIGHT = 900;

// Paddle dimensions
const PADDLE_WIDTH = 22;
const PADDLE_HEIGHT = 135;
const MIN_PADDLE_HEIGHT = 60;
const PADDLE_SHRINK_RATE = 8;
const PADDLE_SPEED = 8;

// Ball settings
const BALL_SIZE = 22;
const INITIAL_BALL_SPEED = 10;
const BALL_SPEED_INCREASE = 1.05;

// Colors
const COLORS = {
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    BLUE: '#0064FF',
    RED: '#FF0000',
    GREEN: '#00FF00',
    GRAY: '#808080',
    ORANGE: '#FFA500',
    YELLOW: '#FFFF00',
    PINK: '#FFC0CB',
    DARK_BLUE: '#00008B',
    BRIGHT_RED: '#FF4500'
};

// Power-up constants
const POWERUP_DURATION = 5;
const POWERUP_COOLDOWN = 10;
const POWERUP_MULTIPLIER = 1.5;

// Speed power-up constants
const SPEED_POWERUP_DURATION = 3;
const SPEED_POWERUP_COOLDOWN = 15;
const SPEED_MULTIPLIER = 2;

// Reverse power-up constants
const REVERSE_POWERUP_COOLDOWN = 30;

// Slow-down power-up constants
const SLOW_POWERUP_DURATION = 5;
const SLOW_POWERUP_COOLDOWN = 20;
const SLOW_MULTIPLIER = 0.7;

// Chaos power-up constants
const CHAOS_POWERUP_DURATION = 3;
const CHAOS_POWERUP_COOLDOWN = 30;
const CHAOS_SPEED_MULTIPLIER = 4;
const CHAOS_SIZE_MULTIPLIER = 0.75;

// Powershot constants
const POWERSHOT_COOLDOWN = 15;
const POWERSHOT_MULTIPLIER = 3;

// Stealth constants
const STEALTH_DURATION = 2;
const STEALTH_COOLDOWN = 15;

// Pinpoint constants
const PINPOINT_COOLDOWN = 10;

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
const RING_BOTTOM_MARGIN = 80;
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

// Available abilities
const ABILITIES = {
    '1': ['Size-up', 'Increase paddle size by 50%'],
    '2': ['Speed-up', 'Double paddle speed'],
    '3': ['Reverse', 'Reverse ball direction'],
    '4': ['Slow-down', 'Slow opponent by 30%'],
    '5': ['Chaos', 'Make opponent 400% faster but 25% smaller'],
    '6': ['Powershot', 'Triple ball speed on next paddle hit'],
    '7': ['Stealth', 'Turn ball black for 2 seconds'],
    '8': ['Pinpoint', 'Align paddle with ball position']
}; 