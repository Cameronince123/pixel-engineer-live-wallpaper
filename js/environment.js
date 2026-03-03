export class Environment {
    constructor(app) {
        this.app = app;
        this.skyContainer = new PIXI.Container();
        this.groundContainer = new PIXI.Container();
        this.foregroundContainer = new PIXI.Container();

        this.app.stage.addChild(this.skyContainer);
        this.app.stage.addChild(this.groundContainer);
        this.app.stage.addChild(this.foregroundContainer);

        // Atmosphere Layers (Subtle overlays + Stars)
        this.skyOverlay = new PIXI.Graphics();
        this.groundOverlay = new PIXI.Graphics();
        this.starsContainer = new PIXI.Container();
        this.skyContainer.addChild(this.skyOverlay);
        this.skyContainer.addChild(this.starsContainer);
        this.groundContainer.addChild(this.groundOverlay);

        this.clouds = [];
        this.initSky();
        this.initGround();
        this.initForeground();

        // Atmosphere Color Config (Deep palettes for gradients)
        this.atmospheres = {
            night: {
                skyTop: 0x010105, skyMid: 0x030310, horizon: 0x05051a,
                ground: 0x050510, alpha: 0.8 // Increased alpha for darkness
            },
            dawn: {
                skyTop: 0x2c3e50, skyMid: 0xff7e5f, horizon: 0xfeb47b,
                ground: 0x4a7a3a, alpha: 0.4
            },
            noon: {
                skyTop: 0x0072ff, skyMid: 0x00bfff, horizon: 0x87ceeb,
                ground: 0x79b456, alpha: 0.0
            },
            dusk: {
                skyTop: 0x2c3e50, skyMid: 0x8e44ad, horizon: 0xc0392b,
                ground: 0x2c3e50, alpha: 0.5
            }
        };
    }

    initSky() {
        // Celestial Bodies (Sprites)
        this.sun = PIXI.Sprite.from('assets/sun.png');
        this.sun.anchor.set(0.5);
        this.sun.scale.set(0.18); // Slightly smaller to ensure full view
        this.skyContainer.addChild(this.sun);

        this.moon = PIXI.Sprite.from('assets/moon.png');
        this.moon.anchor.set(0.5);
        this.moon.scale.set(0.12);
        this.skyContainer.addChild(this.moon);

        // Fix order: Overlay at bottom, celestial bodies on top
        this.skyContainer.setChildIndex(this.skyOverlay, 0);
        this.skyContainer.setChildIndex(this.sun, this.skyContainer.children.length - 1);
        this.skyContainer.setChildIndex(this.moon, this.skyContainer.children.length - 1);

        this.initStars();

        for (let i = 0; i < 3; i++) {
            this.addCloud(Math.random() * window.innerWidth);
        }
    }

    initStars() {
        this.stars = [];
        const starCount = 130;
        for (let i = 0; i < starCount; i++) {
            const star = new PIXI.Graphics();
            const size = Math.random() * 1.2 + 0.3; // Much sharper variety
            star.beginFill(0xFFffff);
            star.drawCircle(0, 0, size);
            star.endFill();
            star.x = Math.random() * window.innerWidth;
            star.y = Math.random() * (window.innerHeight * 0.15);
            star.alpha = 0;
            star.twinkleSpeed = 0.005 + Math.random() * 0.03;
            star.baseAlpha = 0.4 + Math.random() * 0.6;
            this.starsContainer.addChild(star);
            this.stars.push(star);
        }
    }

    addCloud(x) {
        const cloud = PIXI.Sprite.from('assets/cloud.png');
        cloud.anchor.set(0.5);
        cloud.x = x;
        // Varied height within top 40px
        cloud.y = 15 + Math.random() * 35;
        cloud.alpha = 0.15 + Math.random() * 0.15;
        // Varied scale for depth effect
        const scale = 0.07 + Math.random() * 0.15;
        cloud.scale.set(scale);
        // Slower movement for further away (smaller) clouds
        cloud.speed = (0.04 + Math.random() * 0.08) * (scale * 10);
        this.skyContainer.addChild(cloud);
        this.clouds.push(cloud);
    }

    initGround() {
        for (let i = 0; i < 15; i++) {
            const grass = PIXI.Sprite.from('assets/grass.png');
            grass.anchor.set(0.5, 1);
            grass.x = Math.random() * window.innerWidth;
            grass.y = window.innerHeight * 0.15 + Math.random() * (window.innerHeight * 0.85);
            grass.scale.set(0.04 + Math.random() * 0.06);
            grass.alpha = 0.4 + Math.random() * 0.3;
            this.groundContainer.addChild(grass);
        }
    }

    initForeground() {
        const spacing = 150;
        for (let x = 0; x < window.innerWidth + spacing; x += spacing) {
            if (Math.random() > 0.4) {
                const grass = PIXI.Sprite.from('assets/grass.png');
                grass.anchor.set(0.5, 1);
                grass.x = x + (Math.random() - 0.5) * 80;
                grass.y = window.innerHeight + 10;
                grass.scale.set(0.3 + Math.random() * 0.15);
                grass.alpha = 0.9;
                this.foregroundContainer.addChild(grass);
            }
        }
    }

    update(delta, time) {
        // Animate clouds
        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed * delta;
            if (cloud.x > window.innerWidth + 200) {
                cloud.x = -200;
            }
        });

        if (time !== undefined) {
            this.updateAtmosphere(time);
            this.updateSunMoon(time);
            this.updateStars(time, delta);
        }
    }

    updateStars(time, delta) {
        // Stars visible between 8 PM (0.83) and 5 AM (0.21)
        const nightStart = 0.81;
        const nightEnd = 0.21;

        let targetAlpha = 0;
        if (time > nightStart || time < nightEnd) {
            targetAlpha = 1;
        }

        this.stars.forEach(star => {
            // Smoothly fade in/out starfield
            star.alpha = this.lerp(star.alpha, targetAlpha, 0.02 * delta);

            // Twinkle effect
            if (star.alpha > 0.1) {
                star.alpha = (star.baseAlpha * targetAlpha) * (0.7 + Math.sin(Date.now() * star.twinkleSpeed) * 0.3);
            }
        });
    }

    updateAtmosphere(time) {
        const width = this.app.screen ? this.app.screen.width : window.innerWidth;
        const height = this.app.screen ? this.app.screen.height : window.innerHeight;

        let currentState;
        let t = 0;

        // Logical Transitions (IST-aligned)
        // Night: 7:30 PM (0.81) - 5 AM (0.21)
        // Dawn: 5 AM (0.21) - 7 AM (0.29)
        // Day: 7 AM (0.29) - 5 PM (0.71)
        // Dusk: 5 PM (0.71) - 7:30 PM (0.81)

        if (time < 0.21 || time > 0.81) { // Night
            currentState = this.atmospheres.night;
        } else if (time >= 0.21 && time < 0.29) { // Dawn
            t = (time - 0.21) / 0.08;
            currentState = {
                skyTop: this.lerpColor(this.atmospheres.night.skyTop, this.atmospheres.dawn.skyTop, t),
                skyMid: this.lerpColor(this.atmospheres.night.skyMid, this.atmospheres.dawn.skyMid, t),
                horizon: this.lerpColor(this.atmospheres.night.horizon, this.atmospheres.dawn.horizon, t),
                ground: this.lerpColor(this.atmospheres.night.ground, this.atmospheres.dawn.ground, t),
                alpha: this.lerp(this.atmospheres.night.alpha, this.atmospheres.dawn.alpha, t)
            };
        } else if (time >= 0.29 && time < 0.71) { // Noon
            t = (time - 0.29) / 0.1;
            if (t < 1) { // Morning transition
                currentState = {
                    skyTop: this.lerpColor(this.atmospheres.dawn.skyTop, this.atmospheres.noon.skyTop, t),
                    skyMid: this.lerpColor(this.atmospheres.dawn.skyMid, this.atmospheres.noon.skyMid, t),
                    horizon: this.lerpColor(this.atmospheres.dawn.horizon, this.atmospheres.noon.horizon, t),
                    ground: this.lerpColor(this.atmospheres.dawn.ground, this.atmospheres.noon.ground, t),
                    alpha: this.lerp(this.atmospheres.dawn.alpha, this.atmospheres.noon.alpha, t)
                };
            } else {
                currentState = this.atmospheres.noon;
            }
        } else { // Dusk (0.71 to 0.81)
            t = (time - 0.71) / 0.1;
            currentState = {
                skyTop: this.lerpColor(this.atmospheres.noon.skyTop, this.atmospheres.dusk.skyTop, t),
                skyMid: this.lerpColor(this.atmospheres.noon.skyMid, this.atmospheres.dusk.skyMid, t),
                horizon: this.lerpColor(this.atmospheres.noon.horizon, this.atmospheres.dusk.horizon, t),
                ground: this.lerpColor(this.atmospheres.noon.ground, this.atmospheres.dusk.ground, t),
                alpha: this.lerp(this.atmospheres.noon.alpha, this.atmospheres.dusk.alpha, t)
            };
        }

        // Add OVERSCAN for shake
        const overscan = 100;
        const skyHeight = height * 0.15;
        const middleSky = skyHeight * 0.6; // Point where mid transition happens

        this.skyOverlay.clear();

        // 1. Sky Top to Mid
        for (let i = 0; i < middleSky; i += 5) {
            const ratio = i / middleSky;
            const col = this.lerpColor(currentState.skyTop, currentState.skyMid, ratio);
            this.skyOverlay.beginFill(col, currentState.alpha);
            this.skyOverlay.drawRect(-overscan, i - overscan, width + (overscan * 2), 6);
            this.skyOverlay.endFill();
        }

        // 2. Sky Mid to Horizon
        const horizonPart = skyHeight - middleSky;
        for (let i = middleSky; i < skyHeight; i += 4) {
            const ratio = (i - middleSky) / horizonPart;
            const col = this.lerpColor(currentState.skyMid, currentState.horizon, ratio);
            this.skyOverlay.beginFill(col, currentState.alpha);
            this.skyOverlay.drawRect(-overscan, i, width + (overscan * 2), 5);
            this.skyOverlay.endFill();
        }

        // 3. Horizon to Ground Blend (Feathered edge)
        const blendZone = 60;
        for (let i = 0; i < blendZone; i += 4) {
            const ratio = i / blendZone;
            const blendedColor = this.lerpColor(currentState.horizon, currentState.ground, ratio);
            const blendedAlpha = this.lerp(currentState.alpha, currentState.alpha * 0.4, ratio);

            this.skyOverlay.beginFill(blendedColor, blendedAlpha);
            this.skyOverlay.drawRect(-overscan, skyHeight + i - (blendZone / 2), width + (overscan * 2), 5);
            this.skyOverlay.endFill();
        }

        // 4. Ground Base
        this.groundOverlay.clear();
        this.groundOverlay.beginFill(currentState.ground, currentState.alpha * 0.4);
        this.groundOverlay.drawRect(-overscan, skyHeight + (blendZone / 2), width + (overscan * 2), height - skyHeight + overscan);
        this.groundOverlay.endFill();
    }

    updateSunMoon(time) {
        const width = this.app.screen ? this.app.screen.width : window.innerWidth;
        const height = this.app.screen ? this.app.screen.height : window.innerHeight;
        const skyHeight = height * 0.15; // Increased to 15%

        // Sun: 5 AM (0.21) to 7:30 PM (0.81)
        const sunStart = 0.21;
        const sunEnd = 0.81;

        if (time >= sunStart && time <= sunEnd) {
            this.sun.visible = true;
            this.skyContainer.setChildIndex(this.sun, this.skyContainer.children.length - 1);
            const progress = (time - sunStart) / (sunEnd - sunStart);
            this.sun.x = width * progress;
            // Arc logic: use more vertical space
            this.sun.y = (skyHeight * 0.7) + Math.sin(progress * Math.PI) * -(skyHeight * 0.5);
        } else {
            this.sun.visible = false;
        }

        // Moon: 7:30 PM (0.81) to 5 AM (0.21)
        const moonStart = 0.81;
        const moonEnd = 0.21;

        if (time > moonStart || time < moonEnd) {
            this.moon.visible = true;
            this.skyContainer.setChildIndex(this.moon, this.skyContainer.children.length - 1);
            let progress;
            if (time > moonStart) {
                progress = (time - moonStart) / (1 - moonStart + moonEnd);
            } else {
                progress = (1 - moonStart + time) / (1 - moonStart + moonEnd);
            }
            this.moon.x = width * progress;
            this.moon.y = (skyHeight * 0.7) + Math.sin(progress * Math.PI) * -(skyHeight * 0.5);
        } else {
            this.moon.visible = false;
        }
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    lerpColor(c1, c2, t) {
        const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
        const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        return (r << 16) + (g << 8) + b;
    }
}
