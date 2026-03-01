import { StateMachine } from './stateMachine.js';
import { sparkEffect } from './particles.js';

export class Engineer {

    constructor(app, mousePos) {

        this.app = app;
        this.mousePos = mousePos;

        this.texture = PIXI.Texture.from('assets/engineer.png');

        this.sprite = new PIXI.Sprite(this.texture);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.4);
        this.sprite.x = window.innerWidth / 2;
        this.sprite.y = window.innerHeight - 200;

        this.speed = 2;
        this.target = null;
        this.damageSpots = [];

        this.app.stage.addChild(this.sprite);

        this.stateMachine = new StateMachine("idle", {
            idle: {
                enter: () => {},
                update: () => {
                    if (this.damageSpots.length > 0) {
                        this.stateMachine.transition("moveToRepair");
                    } else {
                        this.patrol();
                    }
                }
            },

            moveToRepair: {
                enter: () => {
                    this.target = this.damageSpots[0];
                },
                update: () => {
                    if (!this.target) {
                        this.stateMachine.transition("idle");
                        return;
                    }

                    const dx = this.target.x - this.sprite.x;
                    const dy = this.target.y - this.sprite.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist > 5) {
                        this.sprite.x += (dx / dist) * this.speed;
                        this.sprite.y += (dy / dist) * this.speed;
                    } else {
                        this.stateMachine.transition("repair");
                    }
                }
            },

            repair: {
                enter: () => {
                    sparkEffect(this.app, this.sprite.x, this.sprite.y);
                    this.app.stage.removeChild(this.target);
                    this.damageSpots.shift();
                },
                update: () => {
                    this.target = null;
                    this.stateMachine.transition("idle");
                }
            }
        }, this);
    }

    update(damageSpots) {
        this.damageSpots = damageSpots;

        this.stateMachine.update();

        this.handleCursorReaction();
        this.keepInBounds();
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