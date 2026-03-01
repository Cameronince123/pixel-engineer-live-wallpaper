import { StateMachine } from './stateMachine.js';
import { sparkEffect } from './particles.js';

export class Engineer {

    constructor(app, mousePos) {

        this.app = app;
        this.mousePos = mousePos;

        // Define animations: Down, Up, Left, Right
        const dirs = ['down', 'up', 'left', 'right'];
        this.animations = {};

        dirs.forEach(dir => {
            const textures = [];
            for (let i = 0; i < 4; i++) {
                textures.push(PIXI.Texture.from(`assets/frames/${dir}_${i}.png`));
            }
            this.animations[dir] = new PIXI.AnimatedSprite(textures);
        });

        this.currentDirection = 'down';
        this.sprite = this.animations[this.currentDirection];
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.scale.set(0.25); // Scale down the 300x449 high-res frames
        this.sprite.x = window.innerWidth / 2;
        this.sprite.y = window.innerHeight - 200;
        this.sprite.animationSpeed = 0.12;
        this.sprite.play();

        this.speed = 4; // Slightly faster for the new world
        this.target = null;
        this.enemies = [];

        this.app.stage.addChild(this.sprite);

        this.stateMachine = new StateMachine("idle", {
            idle: {
                enter: () => { },
                update: () => {
                    if (this.enemies.length > 0) {
                        this.stateMachine.transition("moveToCombat");
                    } else {
                        // Follow the cursor if it's not too close
                        const dx = this.mousePos.x - this.sprite.x;
                        const dy = this.mousePos.y - this.sprite.y;
                        const dist = Math.hypot(dx, dy);

                        if (dist > 80) { // Keep some distance or follow
                            this.sprite.x += (dx / dist) * this.speed * 0.5; // Follow slowly
                            this.sprite.y += (dy / dist) * this.speed * 0.5;
                        } else if (dist < 40) {
                            this.sprite.x -= (dx / dist) * 1.5; // Flee if very close
                            this.sprite.y -= (dy / dist) * 1.5;
                        } else {
                            this.patrol();
                        }
                    }
                }
            },

            moveToCombat: {
                enter: () => {
                    this.target = this.enemies[0];
                },
                update: () => {
                    if (!this.target || !this.enemies.includes(this.target)) {
                        this.stateMachine.transition("idle");
                        return;
                    }

                    const dx = this.target.x - this.sprite.x;
                    const dy = this.target.y - this.sprite.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist > 10) {
                        this.sprite.x += (dx / dist) * this.speed;
                        this.sprite.y += (dy / dist) * this.speed;
                    } else {
                        this.stateMachine.transition("attack");
                    }
                }
            },

            attack: {
                enter: () => {
                    sparkEffect(this.app, this.target.x, this.target.y);
                    this.app.stage.removeChild(this.target);
                    const index = this.enemies.indexOf(this.target);
                    if (index > -1) {
                        this.enemies.splice(index, 1);
                    }
                },
                update: () => {
                    this.target = null;
                    this.stateMachine.transition("idle");
                }
            }
        }, this);
    }

    setDirection(dir) {
        if (this.currentDirection === dir) return;

        const prevX = this.sprite.x;
        const prevY = this.sprite.y;

        this.app.stage.removeChild(this.sprite);
        this.currentDirection = dir;
        this.sprite = this.animations[dir];
        this.sprite.x = prevX;
        this.sprite.y = prevY;
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.scale.set(0.25);
        this.sprite.animationSpeed = 0.12;
        this.sprite.play();
        this.app.stage.addChild(this.sprite);
    }

    update(enemies) {
        this.enemies = enemies;

        const prevPos = { x: this.sprite.x, y: this.sprite.y };
        this.stateMachine.update();

        this.handleCursorReaction();
        this.keepInBounds();

        // Update animation based on movement
        const dx = this.sprite.x - prevPos.x;
        const dy = this.sprite.y - prevPos.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0.1) this.setDirection('right');
            else if (dx < -0.1) this.setDirection('left');
        } else {
            if (dy > 0.1) this.setDirection('down');
            else if (dy < -0.1) this.setDirection('up');
        }

        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
            this.sprite.stop();
        } else {
            this.sprite.play();
        }
    }

    patrol() {
        this.sprite.x += Math.sin(Date.now() * 0.001) * 0.5;
        this.sprite.y += Math.cos(Date.now() * 0.001) * 0.5;
    }

    handleCursorReaction() {
        const dx = this.mousePos.x - this.sprite.x;
        const dy = this.mousePos.y - this.sprite.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 100) {
            this.sprite.x -= dx / dist * 1.5;
            this.sprite.y -= dy / dist * 1.5;
        }
    }

    keepInBounds() {
        this.sprite.x = Math.max(30, Math.min(window.innerWidth - 30, this.sprite.x));
        this.sprite.y = Math.max(30, Math.min(window.innerHeight - 30, this.sprite.y));
    }
}