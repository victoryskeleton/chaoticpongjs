class PowerUpManager {
    constructor() {
        this.resetPowerUpStates();
    }

    resetPowerUpStates() {
        // Size power-up state
        this.playerPowerUpActive = false;
        this.opponentPowerUpActive = false;
        this.playerPowerUpStart = 0;
        this.opponentPowerUpStart = 0;
        this.playerLastPowerUp = 0;
        this.opponentLastPowerUp = 0;

        // Speed power-up state
        this.playerSpeedPowerUpActive = false;
        this.opponentSpeedPowerUpActive = false;
        this.playerSpeedPowerUpStart = 0;
        this.opponentSpeedPowerUpStart = 0;
        this.playerLastSpeedPowerUp = 0;
        this.opponentLastSpeedPowerUp = 0;

        // Reverse power-up state
        this.playerLastReverse = 0;
        this.opponentLastReverse = 0;

        // Slow-down power-up state
        this.playerSlowActive = false;
        this.opponentSlowActive = false;
        this.playerSlowStart = 0;
        this.opponentSlowStart = 0;
        this.playerLastSlow = 0;
        this.opponentLastSlow = 0;

        // Chaos power-up state
        this.playerChaosActive = false;
        this.opponentChaosActive = false;
        this.playerChaosStart = 0;
        this.opponentChaosStart = 0;
        this.playerLastChaos = 0;
        this.opponentLastChaos = 0;

        // Powershot state
        this.playerPowershotActive = false;
        this.opponentPowershotActive = false;
        this.playerLastPowershot = 0;
        this.opponentLastPowershot = 0;

        // Stealth state
        this.playerStealthActive = false;
        this.opponentStealthActive = false;
        this.playerStealthStart = 0;
        this.opponentStealthStart = 0;
        this.playerLastStealth = 0;
        this.opponentLastStealth = 0;

        // Pinpoint state
        this.playerLastPinpoint = 0;
        this.opponentLastPinpoint = 0;
    }

    activatePowerUp(isPlayer, game) {
        const currentTime = Date.now();
        if (isPlayer) {
            if (!this.playerPowerUpActive && 
                currentTime - this.playerLastPowerUp >= POWERUP_COOLDOWN * 1000) {
                this.playerPowerUpActive = true;
                this.playerPowerUpStart = currentTime;
                this.playerLastPowerUp = currentTime;
                game.player.height = game.playerHeight * POWERUP_MULTIPLIER;
            }
        } else {
            if (!this.opponentPowerUpActive && 
                currentTime - this.opponentLastPowerUp >= POWERUP_COOLDOWN * 1000) {
                this.opponentPowerUpActive = true;
                this.opponentPowerUpStart = currentTime;
                this.opponentLastPowerUp = currentTime;
                game.opponent.height = game.opponentHeight * POWERUP_MULTIPLIER;
            }
        }
    }

    activateSpeedPowerUp(isPlayer) {
        const currentTime = Date.now();
        if (isPlayer) {
            if (!this.playerSpeedPowerUpActive && 
                currentTime - this.playerLastSpeedPowerUp >= SPEED_POWERUP_COOLDOWN * 1000) {
                this.playerSpeedPowerUpActive = true;
                this.playerSpeedPowerUpStart = currentTime;
                this.playerLastSpeedPowerUp = currentTime;
            }
        } else {
            if (!this.opponentSpeedPowerUpActive && 
                currentTime - this.opponentLastSpeedPowerUp >= SPEED_POWERUP_COOLDOWN * 1000) {
                this.opponentSpeedPowerUpActive = true;
                this.opponentSpeedPowerUpStart = currentTime;
                this.opponentLastSpeedPowerUp = currentTime;
            }
        }
    }

    activateReversePowerUp(isPlayer, game) {
        const currentTime = Date.now();
        if (isPlayer) {
            if (currentTime - this.playerLastReverse >= REVERSE_POWERUP_COOLDOWN * 1000) {
                game.ball.speedX *= -1;
                game.ball.speedY *= -1;
                this.playerLastReverse = currentTime;
            }
        } else {
            if (currentTime - this.opponentLastReverse >= REVERSE_POWERUP_COOLDOWN * 1000) {
                game.ball.speedX *= -1;
                game.ball.speedY *= -1;
                this.opponentLastReverse = currentTime;
            }
        }
    }

    activateSlowPowerUp(isPlayer, game) {
        const currentTime = Date.now();
        if (isPlayer) {
            if (!this.playerSlowActive && 
                currentTime - this.playerLastSlow >= SLOW_POWERUP_COOLDOWN * 1000) {
                this.opponentSlowActive = true;
                this.playerSlowStart = currentTime;
                this.playerLastSlow = currentTime;
                game.opponent.color = COLORS.BLUE;
            }
        } else {
            if (!this.opponentSlowActive && 
                currentTime - this.opponentLastSlow >= SLOW_POWERUP_COOLDOWN * 1000) {
                this.playerSlowActive = true;
                this.opponentSlowStart = currentTime;
                this.opponentLastSlow = currentTime;
                game.player.color = COLORS.BLUE;
            }
        }
    }

    activateChaosPowerUp(isPlayer, game) {
        const currentTime = Date.now();
        if (isPlayer) {
            if (!this.opponentChaosActive && 
                currentTime - this.playerLastChaos >= CHAOS_POWERUP_COOLDOWN * 1000) {
                this.opponentChaosActive = true;
                this.playerChaosStart = currentTime;
                this.playerLastChaos = currentTime;
                game.opponent.height = game.opponentHeight * CHAOS_SIZE_MULTIPLIER;
            }
        } else {
            if (!this.playerChaosActive && 
                currentTime - this.opponentLastChaos >= CHAOS_POWERUP_COOLDOWN * 1000) {
                this.playerChaosActive = true;
                this.opponentChaosStart = currentTime;
                this.opponentLastChaos = currentTime;
                game.player.height = game.playerHeight * CHAOS_SIZE_MULTIPLIER;
            }
        }
    }

    activatePowershot(isPlayer) {
        const currentTime = Date.now();
        if (isPlayer) {
            if (!this.playerPowershotActive && 
                currentTime - this.playerLastPowershot >= POWERSHOT_COOLDOWN * 1000) {
                this.playerPowershotActive = true;
                this.playerLastPowershot = currentTime;
            }
        } else {
            if (!this.opponentPowershotActive && 
                currentTime - this.opponentLastPowershot >= POWERSHOT_COOLDOWN * 1000) {
                this.opponentPowershotActive = true;
                this.opponentLastPowershot = currentTime;
            }
        }
    }

    activateStealth(isPlayer, game) {
        const currentTime = Date.now();
        if (isPlayer) {
            if (!this.playerStealthActive && 
                currentTime - this.playerLastStealth >= STEALTH_COOLDOWN * 1000) {
                this.playerStealthActive = true;
                this.playerStealthStart = currentTime;
                this.playerLastStealth = currentTime;
                game.ball.color = COLORS.BLACK;
            }
        } else {
            if (!this.opponentStealthActive && 
                currentTime - this.opponentLastStealth >= STEALTH_COOLDOWN * 1000) {
                this.opponentStealthActive = true;
                this.opponentStealthStart = currentTime;
                this.opponentLastStealth = currentTime;
                game.ball.color = COLORS.BLACK;
            }
        }
    }

    activatePinpoint(isPlayer, game) {
        const currentTime = Date.now();
        if (isPlayer) {
            if (currentTime - this.playerLastPinpoint >= PINPOINT_COOLDOWN * 1000) {
                game.player.y = game.ball.y - game.player.height / 2;
                if (game.player.y < 0) game.player.y = 0;
                if (game.player.y + game.player.height > WINDOW_HEIGHT) {
                    game.player.y = WINDOW_HEIGHT - game.player.height;
                }
                this.playerLastPinpoint = currentTime;
            }
        } else {
            if (currentTime - this.opponentLastPinpoint >= PINPOINT_COOLDOWN * 1000) {
                game.opponent.y = game.ball.y - game.opponent.height / 2;
                if (game.opponent.y < 0) game.opponent.y = 0;
                if (game.opponent.y + game.opponent.height > WINDOW_HEIGHT) {
                    game.opponent.y = WINDOW_HEIGHT - game.opponent.height;
                }
                this.opponentLastPinpoint = currentTime;
            }
        }
    }

    updatePowerUps(game) {
        const currentTime = Date.now();

        // Update size powerup
        if (this.playerPowerUpActive && 
            currentTime - this.playerPowerUpStart >= POWERUP_DURATION * 1000) {
            this.playerPowerUpActive = false;
            game.player.height = game.playerHeight;
        }
        if (this.opponentPowerUpActive && 
            currentTime - this.opponentPowerUpStart >= POWERUP_DURATION * 1000) {
            this.opponentPowerUpActive = false;
            game.opponent.height = game.opponentHeight;
        }

        // Update speed powerup
        if (this.playerSpeedPowerUpActive && 
            currentTime - this.playerSpeedPowerUpStart >= SPEED_POWERUP_DURATION * 1000) {
            this.playerSpeedPowerUpActive = false;
        }
        if (this.opponentSpeedPowerUpActive && 
            currentTime - this.opponentSpeedPowerUpStart >= SPEED_POWERUP_DURATION * 1000) {
            this.opponentSpeedPowerUpActive = false;
        }

        // Update slow powerup
        if (this.playerSlowActive && 
            currentTime - this.playerSlowStart >= SLOW_POWERUP_DURATION * 1000) {
            this.playerSlowActive = false;
            game.player.color = COLORS.WHITE;
        }
        if (this.opponentSlowActive && 
            currentTime - this.opponentSlowStart >= SLOW_POWERUP_DURATION * 1000) {
            this.opponentSlowActive = false;
            game.opponent.color = COLORS.WHITE;
        }

        // Update chaos powerup
        if (this.playerChaosActive && 
            currentTime - this.opponentChaosStart >= CHAOS_POWERUP_DURATION * 1000) {
            this.playerChaosActive = false;
            game.player.height = game.playerHeight;
        }
        if (this.opponentChaosActive && 
            currentTime - this.playerChaosStart >= CHAOS_POWERUP_DURATION * 1000) {
            this.opponentChaosActive = false;
            game.opponent.height = game.opponentHeight;
        }

        // Update stealth powerup
        if (this.playerStealthActive && 
            currentTime - this.playerStealthStart >= STEALTH_DURATION * 1000) {
            this.playerStealthActive = false;
            if (!this.opponentStealthActive) {
                game.ball.color = COLORS.WHITE;
            }
        }
        if (this.opponentStealthActive && 
            currentTime - this.opponentStealthStart >= STEALTH_DURATION * 1000) {
            this.opponentStealthActive = false;
            if (!this.playerStealthActive) {
                game.ball.color = COLORS.WHITE;
            }
        }
    }
} 