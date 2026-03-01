export class Environment {
    constructor(app) {
        this.app = app;
        this.skyContainer = new PIXI.Container();
        this.groundContainer = new PIXI.Container();
        this.foregroundContainer = new PIXI.Container();

        this.app.stage.addChild(this.skyContainer);
        this.app.stage.addChild(this.groundContainer);
        // Engineer will be added to app.stage normally, between these layers
        // We'll handle layering in main.js
        this.app.stage.addChild(this.foregroundContainer);

        this.clouds = [];
        this.initSky();
        this.initGround();
        this.initForeground();
    }

    initSky() {
        // Add a sun (Smaller proportional scale)
        const sun = PIXI.Sprite.from('assets/sun.png');
        sun.anchor.set(0.5);
        sun.x = window.innerWidth - 80;
        sun.y = 40;
        sun.scale.set(0.15); // Much smaller sun
        sun.alpha = 0.8;
        this.skyContainer.addChild(sun);

        // Add some clouds (Proportional to 10% sky)
        for (let i = 0; i < 3; i++) {
            this.addCloud(Math.random() * window.innerWidth);
        }
    }

    addCloud(x) {
        const cloud = PIXI.Sprite.from('assets/cloud.png');
        cloud.anchor.set(0.5);
        cloud.x = x;
        cloud.y = 20 + Math.random() * 40; // Stay in top 10%
        cloud.alpha = 0.2 + Math.random() * 0.2; // Very transparent
        cloud.scale.set(0.1 + Math.random() * 0.15);
        cloud.speed = 0.05 + Math.random() * 0.1; // Very slow
        this.skyContainer.addChild(cloud);
        this.clouds.push(cloud);
    }

    initGround() {
        // Add random transparent grass tufts on the ground area
        for (let i = 0; i < 15; i++) { // Reduced density
            const grass = PIXI.Sprite.from('assets/grass.png');
            grass.anchor.set(0.5, 1);
            grass.x = Math.random() * window.innerWidth;
            // Place below sky area (10% mark)
            grass.y = window.innerHeight * 0.15 + Math.random() * (window.innerHeight * 0.85);
            grass.scale.set(0.04 + Math.random() * 0.06);
            grass.alpha = 0.4 + Math.random() * 0.3; // More transparent
            this.groundContainer.addChild(grass);
        }
    }

    initForeground() {
        // Partially cover the bottom for 3D depth (not a continuous wall)
        const spacing = 150;
        for (let x = 0; x < window.innerWidth + spacing; x += spacing) {
            if (Math.random() > 0.4) { // 60% chance to spawn, creating gaps
                const grass = PIXI.Sprite.from('assets/grass.png');
                grass.anchor.set(0.5, 1);
                grass.x = x + (Math.random() - 0.5) * 80;
                grass.y = window.innerHeight + 10;
                grass.scale.set(0.3 + Math.random() * 0.15); // Large foreground scale
                grass.alpha = 0.9;
                this.foregroundContainer.addChild(grass);
            }
        }
    }

    update(delta) {
        // Animate clouds
        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed * delta;
            if (cloud.x > window.innerWidth + 200) {
                cloud.x = -200;
            }
        });

        // Parallax effect for foreground grass based on mouse would be nice
        // But let's keep it simple for now as requested
    }
}
