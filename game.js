class PongGame {
    constructor(canvas, twoPlayerMode = false, ballSpeed = INITIAL_BALL_SPEED, 
                winningScore = 10, botDifficulty = 'MEDIUM', paddleShrinkEnabled = true) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = WINDOW_WIDTH;
        this.canvas.height = WINDOW_HEIGHT;
        
        // Game settings
        this.twoPlayerMode = twoPlayerMode;
        this.initialBallSpeed = ballSpeed;
        this.currentBallSpeed = ballSpeed;
        this.winningScore = winningScore;
        this.botDifficulty = botDifficulty;
        this.paddleShrinkEnabled = paddleShrinkEnabled;
        this.enabledAbilities = new Set(['1', '2', '3']); // Default enabled abilities
        
        // Game objects
        this.playerHeight = PADDLE_HEIGHT;
        this.opponentHeight = PADDLE_HEIGHT;
        
        this.player = {
            x: 50,
            y: WINDOW_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            color: COLORS.WHITE
        };
        
        this.opponent = {
            x: WINDOW_WIDTH - 50 - PADDLE_WIDTH,
            y: WINDOW_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            color: COLORS.WHITE
        };
        
        this.ball = {
            x: WINDOW_WIDTH / 2,
            y: WINDOW_HEIGHT / 2,
            width: BALL_SIZE,
            height: BALL_SIZE,
            speedX: this.currentBallSpeed * (Math.random() < 0.5 ? 1 : -1),
            speedY: this.currentBallSpeed * (Math.random() < 0.5 ? 1 : -1),
            color: COLORS.WHITE
        };
        
        // Scores
        this.playerScore = 0;
        this.opponentScore = 0;
        
        // AI variables
        this.lastAiUpdate = Date.now();
        this.targetY = null;
        this.lastAiAbilityCheck = Date.now();
        
        // Power-ups
        this.powerUpManager = new PowerUpManager();
        
        // Input handling
        this.keys = {};
        this.setupInputHandlers();
        
        // Game state
        this.isRunning = false;
        this.winner = null;
    }

    setupInputHandlers() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Handle ability activations
            if (this.isRunning) {
                if (this.enabledAbilities.has('1')) {
                    if (e.key === 'q') this.powerUpManager.activatePowerUp(true, this);
                    else if (e.key === 'ArrowLeft' && this.twoPlayerMode) this.powerUpManager.activatePowerUp(false, this);
                }
                if (this.enabledAbilities.has('2')) {
                    if (e.key === 'e') this.powerUpManager.activateSpeedPowerUp(true);
                    else if (e.key === 'ArrowRight' && this.twoPlayerMode) this.powerUpManager.activateSpeedPowerUp(false);
                }
                if (this.enabledAbilities.has('3')) {
                    if (e.key === 'a') this.powerUpManager.activateReversePowerUp(true, this);
                    else if (e.key === '/' && this.twoPlayerMode) this.powerUpManager.activateReversePowerUp(false, this);
                }
                if (this.enabledAbilities.has('4')) {
                    if (e.key === 'd') this.powerUpManager.activateSlowPowerUp(true, this);
                    else if (e.key === '.' && this.twoPlayerMode) this.powerUpManager.activateSlowPowerUp(false, this);
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    getRandomColor() {
        return `rgb(${Math.random() * 205 + 50}, ${Math.random() * 205 + 50}, ${Math.random() * 205 + 50})`;
    }

    shrinkPaddle(isPlayer) {
        if (!this.paddleShrinkEnabled) return;
        
        if (isPlayer) {
            this.playerHeight = Math.max(MIN_PADDLE_HEIGHT, 
                                       this.playerHeight - PADDLE_SHRINK_RATE);
            if (!this.powerUpManager.playerPowerUpActive) {
                this.player.height = this.playerHeight;
            }
        } else {
            this.opponentHeight = Math.max(MIN_PADDLE_HEIGHT, 
                                         this.opponentHeight - PADDLE_SHRINK_RATE);
            if (!this.powerUpManager.opponentPowerUpActive) {
                this.opponent.height = this.opponentHeight;
            }
        }
    }

    resetBall() {
        this.ball.x = WINDOW_WIDTH / 2;
        this.ball.y = WINDOW_HEIGHT / 2;
        this.currentBallSpeed = this.initialBallSpeed;
        this.ball.speedY = this.currentBallSpeed * (Math.random() < 0.5 ? 1 : -1);
        this.ball.speedX = this.currentBallSpeed * (Math.random() < 0.5 ? 1 : -1);
        this.ball.color = COLORS.WHITE;
        this.player.color = this.getRandomColor();
        this.opponent.color = this.getRandomColor();
    }

    increaseBallSpeed() {
        this.currentBallSpeed *= BALL_SPEED_INCREASE;
        const dirX = this.ball.speedX > 0 ? 1 : -1;
        const dirY = this.ball.speedY > 0 ? 1 : -1;
        this.ball.speedX = this.currentBallSpeed * dirX;
        this.ball.speedY = this.currentBallSpeed * dirY;
    }

    movePaddle(paddle, up) {
        let speed = PADDLE_SPEED;
        
        // Apply power-up effects to speed
        if ((paddle === this.player && this.powerUpManager.playerSpeedPowerUpActive) ||
            (paddle === this.opponent && this.powerUpManager.opponentSpeedPowerUpActive)) {
            speed *= SPEED_MULTIPLIER;
        }
        if ((paddle === this.player && this.powerUpManager.playerSlowActive) ||
            (paddle === this.opponent && this.powerUpManager.opponentSlowActive)) {
            speed *= SLOW_MULTIPLIER;
        }
        if ((paddle === this.player && this.powerUpManager.playerChaosActive) ||
            (paddle === this.opponent && this.powerUpManager.opponentChaosActive)) {
            speed *= CHAOS_SPEED_MULTIPLIER;
        }
        
        if (up && paddle.y > 0) {
            paddle.y -= speed;
        }
        if (!up && paddle.y + paddle.height < WINDOW_HEIGHT) {
            paddle.y += speed;
        }
    }

    updateBall() {
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;

        // Ball collision with top and bottom
        if (this.ball.y <= 0 || this.ball.y + this.ball.height >= WINDOW_HEIGHT) {
            this.ball.speedY *= -1;
        }

        // Ball collision with paddles
        if (this.checkCollision(this.ball, this.player)) {
            this.ball.speedX *= -1;
            if (this.powerUpManager.playerPowershotActive) {
                this.ball.speedX *= POWERSHOT_MULTIPLIER;
                this.ball.speedY *= POWERSHOT_MULTIPLIER;
                this.powerUpManager.playerPowershotActive = false;
            } else {
                this.increaseBallSpeed();
            }
        }

        if (this.checkCollision(this.ball, this.opponent)) {
            this.ball.speedX *= -1;
            if (this.powerUpManager.opponentPowershotActive) {
                this.ball.speedX *= POWERSHOT_MULTIPLIER;
                this.ball.speedY *= POWERSHOT_MULTIPLIER;
                this.powerUpManager.opponentPowershotActive = false;
            } else {
                this.increaseBallSpeed();
            }
        }

        // Score points
        if (this.ball.x <= 0) {
            if (this.opponentScore < this.winningScore) {
                this.opponentScore++;
                this.shrinkPaddle(false);
            }
            this.resetBall();
        }
        if (this.ball.x + this.ball.width >= WINDOW_WIDTH) {
            if (this.playerScore < this.winningScore) {
                this.playerScore++;
                this.shrinkPaddle(true);
            }
            this.resetBall();
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    updateAI() {
        if (!this.twoPlayerMode) {
            const currentTime = Date.now();
            const difficultySettings = BOT_DIFFICULTY[this.botDifficulty];
            
            // Update AI target with reaction delay
            if (this.targetY === null || 
                currentTime - this.lastAiUpdate >= difficultySettings.reactionDelay * 1000) {
                const predictionError = Math.random() * 2 * difficultySettings.predictionError - 
                                      difficultySettings.predictionError;
                this.targetY = this.ball.y + predictionError;
                this.lastAiUpdate = currentTime;
            }
            
            if (this.targetY !== null) {
                let aiSpeed = difficultySettings.speed;
                
                // Adjust speed based on active effects
                if (this.powerUpManager.opponentSpeedPowerUpActive) {
                    aiSpeed *= SPEED_MULTIPLIER;
                }
                if (this.powerUpManager.opponentSlowActive) {
                    aiSpeed *= SLOW_MULTIPLIER;
                }
                if (this.powerUpManager.opponentChaosActive) {
                    aiSpeed *= CHAOS_SPEED_MULTIPLIER;
                }
                
                // Move towards target
                if (this.opponent.y + this.opponent.height / 2 < this.targetY) {
                    this.movePaddle(this.opponent, false);
                } else if (this.opponent.y + this.opponent.height / 2 > this.targetY) {
                    this.movePaddle(this.opponent, true);
                }
            }
        }
    }

    update() {
        if (!this.isRunning || this.winner) return;

        // Handle input
        if (this.keys['w']) this.movePaddle(this.player, true);
        if (this.keys['s']) this.movePaddle(this.player, false);
        
        if (this.twoPlayerMode) {
            if (this.keys['ArrowUp']) this.movePaddle(this.opponent, true);
            if (this.keys['ArrowDown']) this.movePaddle(this.opponent, false);
        } else {
            this.updateAI();
        }

        // Update game objects
        this.updateBall();
        this.powerUpManager.updatePowerUps(this);

        // Check for winner
        if (this.winningScore !== Infinity) {
            if (this.playerScore >= this.winningScore) {
                this.winner = "Player 1 Wins!";
                this.isRunning = false;
            } else if (this.opponentScore >= this.winningScore) {
                this.winner = this.twoPlayerMode ? "Player 2 Wins!" : "Computer Wins!";
                this.isRunning = false;
            }
        }
    }

    drawAbilityRings() {
        const currentTime = Date.now();
        const powerUpManager = this.powerUpManager;

        // Helper function to draw a single ring
        const drawRing = (x, y, progress, text, isReady, label) => {
            // Draw the background ring
            this.ctx.beginPath();
            this.ctx.arc(x, y, RING_RADIUS, 0, Math.PI * 2);
            this.ctx.strokeStyle = COLORS.GRAY;
            this.ctx.lineWidth = RING_THICKNESS;
            this.ctx.stroke();

            // Draw the progress ring
            if (progress > 0) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, RING_RADIUS, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
                this.ctx.strokeStyle = isReady ? COLORS.GREEN : COLORS.RED;
                this.ctx.stroke();
            }

            // Draw the key binding
            this.ctx.fillStyle = isReady ? COLORS.WHITE : COLORS.GRAY;
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(text, x, y);

            // Draw the ability label
            this.ctx.font = '16px Arial';
            this.ctx.fillStyle = COLORS.WHITE;
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(label, x, y + RING_RADIUS + 5);
        };

        // Calculate cooldown progress for each ability
        const calculateProgress = (lastUseTime, cooldown) => {
            if (lastUseTime === 0) return 1;
            const elapsed = (currentTime - lastUseTime) / 1000;
            return Math.min(elapsed / cooldown, 1);
        };

        // Get array of enabled abilities
        const enabledAbilitiesArray = Array.from(this.enabledAbilities).sort();
        
        // Player 1 ability rings
        enabledAbilitiesArray.forEach((abilityKey, index) => {
            let progress = 1;
            let keyText = '';
            let abilityName = '';
            
            // Set the x position based on index
            const x = RING_START_X + (RING_SPACING * index);
            
            // Determine ability properties
            switch(abilityKey) {
                case '1':
                    progress = calculateProgress(powerUpManager.playerLastPowerUp, POWERUP_COOLDOWN);
                    keyText = 'Q';
                    abilityName = 'Size Up';
                    break;
                case '2':
                    progress = calculateProgress(powerUpManager.playerLastSpeedPowerUp, SPEED_POWERUP_COOLDOWN);
                    keyText = 'E';
                    abilityName = 'Speed Up';
                    break;
                case '3':
                    progress = calculateProgress(powerUpManager.playerLastReverse, REVERSE_POWERUP_COOLDOWN);
                    keyText = 'A';
                    abilityName = 'Reverse';
                    break;
                case '4':
                    progress = calculateProgress(powerUpManager.playerLastSlow, SLOW_POWERUP_COOLDOWN);
                    keyText = 'D';
                    abilityName = 'Slow';
                    break;
                case '5':
                    progress = calculateProgress(powerUpManager.playerLastChaos, CHAOS_POWERUP_COOLDOWN);
                    keyText = '2';
                    abilityName = 'Chaos';
                    break;
                case '6':
                    progress = calculateProgress(powerUpManager.playerLastPowershot, POWERSHOT_COOLDOWN);
                    keyText = '3';
                    abilityName = 'Powershot';
                    break;
                case '7':
                    progress = calculateProgress(powerUpManager.playerLastStealth, STEALTH_COOLDOWN);
                    keyText = '4';
                    abilityName = 'Stealth';
                    break;
                case '8':
                    progress = calculateProgress(powerUpManager.playerLastPinpoint, PINPOINT_COOLDOWN);
                    keyText = '5';
                    abilityName = 'Pinpoint';
                    break;
            }
            
            drawRing(x, WINDOW_HEIGHT - RING_BOTTOM_MARGIN, progress, keyText, progress === 1, abilityName);
        });

        // Player 2 ability rings (only in two-player mode)
        if (this.twoPlayerMode) {
            enabledAbilitiesArray.forEach((abilityKey, index) => {
                let progress = 1;
                let keyText = '';
                let abilityName = '';
                
                // Set the x position based on index (from right side)
                const x = WINDOW_WIDTH - RING_START_X - (RING_SPACING * index);
                
                // Determine ability properties
                switch(abilityKey) {
                    case '1':
                        progress = calculateProgress(powerUpManager.opponentLastPowerUp, POWERUP_COOLDOWN);
                        keyText = '←';
                        abilityName = 'Size Up';
                        break;
                    case '2':
                        progress = calculateProgress(powerUpManager.opponentLastSpeedPowerUp, SPEED_POWERUP_COOLDOWN);
                        keyText = '→';
                        abilityName = 'Speed Up';
                        break;
                    case '3':
                        progress = calculateProgress(powerUpManager.opponentLastReverse, REVERSE_POWERUP_COOLDOWN);
                        keyText = '/';
                        abilityName = 'Reverse';
                        break;
                    case '4':
                        progress = calculateProgress(powerUpManager.opponentLastSlow, SLOW_POWERUP_COOLDOWN);
                        keyText = '.';
                        abilityName = 'Slow';
                        break;
                    case '5':
                        progress = calculateProgress(powerUpManager.opponentLastChaos, CHAOS_POWERUP_COOLDOWN);
                        keyText = "'";
                        abilityName = 'Chaos';
                        break;
                    case '6':
                        progress = calculateProgress(powerUpManager.opponentLastPowershot, POWERSHOT_COOLDOWN);
                        keyText = ';';
                        abilityName = 'Powershot';
                        break;
                    case '7':
                        progress = calculateProgress(powerUpManager.opponentLastStealth, STEALTH_COOLDOWN);
                        keyText = 'L';
                        abilityName = 'Stealth';
                        break;
                    case '8':
                        progress = calculateProgress(powerUpManager.opponentLastPinpoint, PINPOINT_COOLDOWN);
                        keyText = 'K';
                        abilityName = 'Pinpoint';
                        break;
                }
                
                drawRing(x, WINDOW_HEIGHT - RING_BOTTOM_MARGIN, progress, keyText, progress === 1, abilityName);
            });
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = COLORS.BLACK;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw paddles
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        this.ctx.fillStyle = this.opponent.color;
        this.ctx.fillRect(this.opponent.x, this.opponent.y, this.opponent.width, this.opponent.height);
        
        // Draw ball (as a circle)
        this.ctx.fillStyle = this.ball.color;
        this.ctx.beginPath();
        this.ctx.arc(
            this.ball.x + this.ball.width / 2,  // x center
            this.ball.y + this.ball.height / 2, // y center
            this.ball.width / 2,                // radius (half of ball size)
            0,                                  // start angle
            Math.PI * 2                         // end angle (full circle)
        );
        this.ctx.fill();
        
        // Draw center line
        this.ctx.beginPath();
        this.ctx.setLineDash([5, 15]);
        this.ctx.moveTo(WINDOW_WIDTH / 2, 0);
        this.ctx.lineTo(WINDOW_WIDTH / 2, WINDOW_HEIGHT);
        this.ctx.strokeStyle = COLORS.WHITE;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw scores
        this.ctx.font = '74px Arial';
        this.ctx.fillStyle = COLORS.WHITE;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.playerScore.toString(), WINDOW_WIDTH / 4, 60);
        this.ctx.fillText(this.opponentScore.toString(), 3 * WINDOW_WIDTH / 4, 60);
        
        // Draw ability rings if game is running
        if (this.isRunning) {
            this.drawAbilityRings();
        }
        
        // Draw winner message if game is over
        if (this.winner) {
            this.ctx.font = '48px Arial';
            this.ctx.fillStyle = COLORS.WHITE;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.winner, WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Press SPACE to play again', WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 + 50);
            this.ctx.fillText('Press ESC to quit', WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 + 90);
        }
    }

    start() {
        this.isRunning = true;
        this.winner = null;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.playerHeight = PADDLE_HEIGHT;
        this.opponentHeight = PADDLE_HEIGHT;
        this.resetBall();
        this.powerUpManager.resetPowerUpStates();
        this.gameLoop();
    }

    gameLoop() {
        this.update();
        this.draw();
        if (this.isRunning) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Initialize game when window loads
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new PongGame(canvas);
    
    // Menu state
    const menuState = {
        currentMenu: 'main', // main, difficulty, score, shrink, abilities
        menuActive: true,
        selectedDifficulty: 'MEDIUM',
        selectedScore: 10,
        paddleShrinkEnabled: true,
        enabledAbilities: new Set(['1', '2', '3']), // Default enabled abilities
    };

    function drawMainMenu(ctx) {
        // Draw title
        ctx.font = '72px Arial';
        ctx.fillStyle = COLORS.WHITE;
        ctx.textAlign = 'center';
        ctx.fillText('CHAOTIC PONG', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.2);
        
        // Draw menu options with more spacing
        ctx.font = '36px Arial';
        ctx.fillText('Press 1 for Single Player', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.4);
        ctx.fillText('Press 2 for Two Players', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.5);
        
        // Draw controls info with better spacing
        ctx.font = '24px Arial';
        // Player 1 controls
        ctx.fillText('Player 1 Controls:', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.65);
        ctx.fillText('W/S to move', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.7);
        ctx.fillText('Q, E, A, D, 2-5 for abilities', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.75);
        
        // Player 2 controls
        ctx.fillText('Player 2 Controls:', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.85);
        ctx.fillText('↑/↓ to move', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.9);
        ctx.fillText('←, →, /, ., ;, \', L, K for abilities', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.95);
    }

    function drawDifficultyMenu(ctx) {
        // Draw title
        ctx.font = '48px Arial';
        ctx.fillStyle = COLORS.WHITE;
        ctx.textAlign = 'center';
        ctx.fillText('Select Difficulty', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.2);

        // Draw difficulty options with increased spacing
        const difficulties = ['EASY', 'MEDIUM', 'HARD', 'ULTRA'];
        difficulties.forEach((diff, index) => {
            ctx.font = '36px Arial';
            if (diff === menuState.selectedDifficulty) {
                ctx.fillStyle = COLORS.YELLOW;
            } else {
                ctx.fillStyle = COLORS.WHITE;
            }
            ctx.fillText(`${index + 1}. ${diff}`, WINDOW_WIDTH / 2, WINDOW_HEIGHT * (0.35 + index * 0.12));
        });

        // Draw instructions with better spacing
        ctx.font = '24px Arial';
        ctx.fillStyle = COLORS.GRAY;
        ctx.fillText('Press ENTER to confirm', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.9);
        ctx.fillText('Press ESC to go back', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.95);
    }

    function drawScoreMenu(ctx) {
        // Draw title
        ctx.font = '48px Arial';
        ctx.fillStyle = COLORS.WHITE;
        ctx.textAlign = 'center';
        ctx.fillText('Select Score Limit', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.2);

        // Draw score options with increased spacing
        Object.entries(SCORE_OPTIONS).forEach(([key, value], index) => {
            ctx.font = '36px Arial';
            if (value === menuState.selectedScore) {
                ctx.fillStyle = COLORS.YELLOW;
            } else {
                ctx.fillStyle = COLORS.WHITE;
            }
            const displayValue = value === Infinity ? '∞' : value;
            ctx.fillText(`${key}. ${displayValue} points`, WINDOW_WIDTH / 2, WINDOW_HEIGHT * (0.35 + index * 0.08));
        });

        // Draw instructions
        ctx.font = '24px Arial';
        ctx.fillStyle = COLORS.GRAY;
        ctx.fillText('Press ENTER to confirm', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.9);
        ctx.fillText('Press ESC to go back', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.95);
    }

    function drawShrinkMenu(ctx) {
        // Draw title
        ctx.font = '48px Arial';
        ctx.fillStyle = COLORS.WHITE;
        ctx.textAlign = 'center';
        ctx.fillText('Paddle Shrink Settings', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.2);

        // Draw options
        ctx.font = '36px Arial';
        ctx.fillStyle = menuState.paddleShrinkEnabled ? COLORS.YELLOW : COLORS.WHITE;
        ctx.fillText('1. Enabled', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.4);
        
        ctx.fillStyle = !menuState.paddleShrinkEnabled ? COLORS.YELLOW : COLORS.WHITE;
        ctx.fillText('2. Disabled', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.5);

        // Draw description
        ctx.font = '24px Arial';
        ctx.fillStyle = COLORS.GRAY;
        ctx.fillText('When enabled, paddles shrink each time a point is scored', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.7);

        // Draw instructions
        ctx.fillText('Press ENTER to confirm', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.9);
        ctx.fillText('Press ESC to go back', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.95);
    }

    function drawAbilitiesMenu(ctx) {
        // Draw title
        ctx.font = '48px Arial';
        ctx.fillStyle = COLORS.WHITE;
        ctx.textAlign = 'center';
        ctx.fillText('Select Abilities (Max 3)', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.15);

        // Draw ability options with increased spacing
        Object.entries(ABILITIES).forEach(([key, [name, description]], index) => {
            const yPos = WINDOW_HEIGHT * (0.25 + index * 0.09); // Increased spacing between abilities
            
            // Draw ability name
            ctx.font = '32px Arial';
            if (menuState.enabledAbilities.has(key)) {
                ctx.fillStyle = COLORS.GREEN;
            } else {
                ctx.fillStyle = menuState.enabledAbilities.size >= 3 && !menuState.enabledAbilities.has(key) 
                    ? COLORS.GRAY 
                    : COLORS.RED;
            }
            ctx.fillText(`${key}. ${name}`, WINDOW_WIDTH / 2, yPos);
            
            // Draw ability description with adjusted spacing
            ctx.font = '20px Arial';
            ctx.fillStyle = COLORS.GRAY;
            ctx.fillText(description, WINDOW_WIDTH / 2, yPos + 30);
        });

        // Draw selection counter and instructions with better spacing
        ctx.font = '24px Arial';
        ctx.fillStyle = COLORS.WHITE;
        ctx.fillText(`Selected: ${menuState.enabledAbilities.size}/3`, WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.88);

        ctx.fillStyle = COLORS.GRAY;
        ctx.fillText('Press number to toggle ability', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.92);
        ctx.fillText('Press ENTER to confirm, ESC to go back', WINDOW_WIDTH / 2, WINDOW_HEIGHT * 0.96);
    }

    // Menu loop
    function menuLoop() {
        if (!menuState.menuActive) return;
        
        const ctx = canvas.getContext('2d');
        
        // Clear the canvas
        ctx.fillStyle = COLORS.BLACK;
        ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        
        // Draw current menu
        switch (menuState.currentMenu) {
            case 'main':
                drawMainMenu(ctx);
                break;
            case 'difficulty':
                drawDifficultyMenu(ctx);
                break;
            case 'score':
                drawScoreMenu(ctx);
                break;
            case 'shrink':
                drawShrinkMenu(ctx);
                break;
            case 'abilities':
                drawAbilitiesMenu(ctx);
                break;
        }
        
        requestAnimationFrame(menuLoop);
    }
    
    // Start menu loop
    menuLoop();
    
    // Handle menu input
    window.addEventListener('keydown', (e) => {
        if (menuState.menuActive) {
            switch (menuState.currentMenu) {
                case 'main':
                    if (e.key === '1') {
                        game.twoPlayerMode = false;
                        menuState.currentMenu = 'difficulty';
                    } else if (e.key === '2') {
                        game.twoPlayerMode = true;
                        menuState.currentMenu = 'score';
                    }
                    break;

                case 'difficulty':
                    if (e.key >= '1' && e.key <= '4') {
                        const difficulties = ['EASY', 'MEDIUM', 'HARD', 'ULTRA'];
                        menuState.selectedDifficulty = difficulties[parseInt(e.key) - 1];
                    } else if (e.key === 'Enter') {
                        game.botDifficulty = menuState.selectedDifficulty;
                        menuState.currentMenu = 'score';
                    } else if (e.key === 'Escape') {
                        menuState.currentMenu = 'main';
                    }
                    break;

                case 'score':
                    if (e.key >= '1' && e.key <= '8') {
                        menuState.selectedScore = SCORE_OPTIONS[e.key];
                    } else if (e.key === 'Enter') {
                        game.winningScore = menuState.selectedScore;
                        menuState.currentMenu = 'shrink';
                    } else if (e.key === 'Escape') {
                        menuState.currentMenu = game.twoPlayerMode ? 'main' : 'difficulty';
                    }
                    break;

                case 'shrink':
                    if (e.key === '1') {
                        menuState.paddleShrinkEnabled = true;
                    } else if (e.key === '2') {
                        menuState.paddleShrinkEnabled = false;
                    } else if (e.key === 'Enter') {
                        game.paddleShrinkEnabled = menuState.paddleShrinkEnabled;
                        menuState.currentMenu = 'abilities';
                    } else if (e.key === 'Escape') {
                        menuState.currentMenu = 'score';
                    }
                    break;

                case 'abilities':
                    if (e.key >= '1' && e.key <= '8') {
                        if (menuState.enabledAbilities.has(e.key)) {
                            menuState.enabledAbilities.delete(e.key);
                        } else if (menuState.enabledAbilities.size < 3) {
                            menuState.enabledAbilities.add(e.key);
                        }
                    } else if (e.key === 'Enter' && menuState.enabledAbilities.size > 0) {
                        // Ensure AI has exactly 3 abilities in single-player mode
                        if (!game.twoPlayerMode) {
                            const availableAbilities = ['1', '2', '3', '4', '5', '6', '7', '8']
                                .filter(key => !menuState.enabledAbilities.has(key));
                            
                            while (menuState.enabledAbilities.size < 3 && availableAbilities.length > 0) {
                                const randomIndex = Math.floor(Math.random() * availableAbilities.length);
                                const ability = availableAbilities.splice(randomIndex, 1)[0];
                                menuState.enabledAbilities.add(ability);
                            }
                        }
                        
                        game.enabledAbilities = new Set(menuState.enabledAbilities);
                        menuState.menuActive = false;
                        game.start();
                    } else if (e.key === 'Escape') {
                        menuState.currentMenu = 'shrink';
                    }
                    break;
            }
        } else if (!game.isRunning && game.winner) {
            if (e.key === ' ') {
                game.start();
            } else if (e.key === 'Escape') {
                menuState.menuActive = true;
                menuState.currentMenu = 'main';
                game.winner = null;
                menuLoop();
            }
        }
    });
}); 