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
        this.celestialContainer = new PIXI.Container();
        this.cloudContainer = new PIXI.Container();
        this.skyContainer.addChild(this.skyOverlay);
        this.skyContainer.addChild(this.starsContainer);
        this.skyContainer.addChild(this.celestialContainer);
        this.skyContainer.addChild(this.cloudContainer);
        this.groundContainer.addChild(this.groundOverlay);

        this.clouds = [];
        this.initSky();
        this.initGround();
        this.initForeground();

        // Atmosphere Color Config (Deep palettes for gradients)
        this.atmospheres = {
            night: {
                skyTop: 0x02020a, skyMid: 0x050518, horizon: 0x0a1435,
                ground: 0x0a1a0a, alpha: 1.0
            },
            dawn: {
                skyTop: 0x2c3e50, skyMid: 0xff7e5f, horizon: 0xfeb47b,
                ground: 0x4a7a3a, alpha: 1.0
            },
            noon: {
                skyTop: 0x0072ff, skyMid: 0x00bfff, horizon: 0x87ceeb,
                ground: 0x79b456, alpha: 1.0
            },
            dusk: {
                skyTop: 0x2c3e50, skyMid: 0x8e44ad, horizon: 0xc0392b,
                ground: 0x2c3e50, alpha: 1.0
            }
        };
    }

    initSky() {
        // Celestial Bodies (Sprites)
        this.sun = PIXI.Sprite.from('assets/sun.png');
        this.sun.anchor.set(0.5);
        this.sun.scale.set(0.18);
        this.celestialContainer.addChild(this.sun);

        this.moon = PIXI.Sprite.from('assets/moon.png');
        this.moon.anchor.set(0.5);
        this.moon.scale.set(0.12);
        this.celestialContainer.addChild(this.moon);

        // Interaction for Time Display
        this.sun.eventMode = 'static';
        this.moon.eventMode = 'static';
        this.sun.cursor = 'help';
        this.moon.cursor = 'help';

        this.timeDisplay = document.getElementById('time-display');
        this.timeEl = this.timeDisplay.querySelector('.time');
        this.dayEl = this.timeDisplay.querySelector('.day');
        this.dateEl = this.timeDisplay.querySelector('.date');

        const onHover = (e) => {
            const sprite = e.currentTarget;
            const pos = sprite.toGlobal(new PIXI.Point(0, 0));

            // Safety Margin from top of screen
            const topMargin = 20;
            const xOffset = 60;
            const yOffset = (sprite.height / 2) + 15;

            // Ensure Y is at least topMargin + half height of display
            let targetY = pos.y + yOffset;
            const displayHeight = 60; // Approximate
            if (targetY < topMargin + displayHeight / 2) {
                targetY = topMargin + displayHeight / 2;
            }

            if (pos.x < window.innerWidth / 2) {
                this.timeDisplay.style.left = `${pos.x + xOffset}px`;
                this.timeDisplay.style.transform = `translate(0, -50%)`;
            } else {
                this.timeDisplay.style.left = `${pos.x - xOffset}px`;
                this.timeDisplay.style.transform = `translate(-100%, -50%)`;
            }

            this.timeDisplay.style.top = `${targetY}px`;
            this.timeDisplay.classList.add('visible');
            this.updateTimeDisplay();
        };

        const onOut = () => {
            this.timeDisplay.classList.remove('visible');
        };

        this.sun.on('pointerover', onHover);
        this.moon.on('pointerover', onHover);
        this.sun.on('pointerout', onOut);
        this.moon.on('pointerout', onOut);

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
        this.cloudContainer.addChild(cloud);
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
            this.updateTimeDisplay();
        }
    }

    updateTimeDisplay() {
        if (!this.timeDisplay.classList.contains('visible')) return;

        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // 12h Format
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Handle 0 as 12
        const hStr = String(hours).padStart(2, '0');
        const mStr = String(now.getMinutes()).padStart(2, '0');

        this.timeEl.textContent = `${hStr}:${mStr} ${ampm}`;
        this.dayEl.textContent = days[now.getDay()];
        this.dateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
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

        // Logical Transitions (Expanded for Cinematic feel)
        // Night: 8:24 PM (0.85) - 3:36 AM (0.15)
        // Dawn: 3:36 AM (0.15) - 8:24 AM (0.35)
        // Day: 8:24 AM (0.35) - 2:52 PM (0.62)
        // Dusk: 2:52 PM (0.62) - 8:24 PM (0.85)

        if (time < 0.15 || time > 0.85) { // Night
            currentState = this.atmospheres.night;
        } else if (time >= 0.15 && time < 0.35) { // Dawn
            t = (time - 0.15) / 0.20;
            currentState = {
                skyTop: this.lerpColor(this.atmospheres.night.skyTop, this.atmospheres.dawn.skyTop, t),
                skyMid: this.lerpColor(this.atmospheres.night.skyMid, this.atmospheres.dawn.skyMid, t),
                horizon: this.lerpColor(this.atmospheres.night.horizon, this.atmospheres.dawn.horizon, t),
                ground: this.lerpColor(this.atmospheres.night.ground, this.atmospheres.dawn.ground, t),
                alpha: this.lerp(this.atmospheres.night.alpha, this.atmospheres.dawn.alpha, t)
            };
        } else if (time >= 0.35 && time < 0.62) { // Noon
            t = (time - 0.35) / 0.1;
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
        } else { // Dusk (0.62 to 0.85)
            t = (time - 0.62) / 0.23;
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
        for (let i = -overscan; i < middleSky; i += 5) { // Start from overscan!
            const ratio = (i + overscan) / (middleSky + overscan);
            const col = this.lerpColor(currentState.skyTop, currentState.skyMid, ratio);
            this.skyOverlay.beginFill(col, currentState.alpha);
            this.skyOverlay.drawRect(-overscan, i, width + (overscan * 2), 6);
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

        // 3. Horizon to Ground Blend (Moved to groundOverlay for occlusion)
        this.groundOverlay.clear();
        const blendZone = 80;
        for (let i = 0; i < blendZone; i += 4) {
            const ratio = i / blendZone;
            const blendedColor = this.lerpColor(currentState.horizon, currentState.ground, ratio);
            this.groundOverlay.beginFill(blendedColor, currentState.alpha);
            this.groundOverlay.drawRect(-overscan, skyHeight + i - (blendZone / 2), width + (overscan * 2), 5);
            this.groundOverlay.endFill();
        }

        // 4. Ground Base
        this.groundOverlay.beginFill(currentState.ground, currentState.alpha);
        this.groundOverlay.drawRect(-overscan, skyHeight + (blendZone / 2), width + (overscan * 2), height - skyHeight + overscan);
        this.groundOverlay.endFill();
    }

    updateSunMoon(time) {
        const width = this.app.screen ? this.app.screen.width : window.innerWidth;
        const height = this.app.screen ? this.app.screen.height : window.innerHeight;
        const skyHeight = height * 0.15;

        // Transitions: 5 AM (0.21) to 7:30 PM (0.81)
        const sunStart = 0.21;
        const sunEnd = 0.81;
        const fadeDuration = 0.05;

        if (time >= sunStart - fadeDuration && time <= sunEnd + fadeDuration) {
            this.sun.visible = true;

            // Calculate Alpha
            let alpha = 1.0;
            if (time < sunStart) {
                alpha = (time - (sunStart - fadeDuration)) / fadeDuration;
            } else if (time > sunEnd) {
                alpha = 1.0 - (time - sunEnd) / fadeDuration;
            }
            this.sun.alpha = Math.max(0, Math.min(1, alpha));

            const progress = (time - sunStart) / (sunEnd - sunStart);
            this.sun.x = width * progress;
            // Lowered at horizon (progress=0 or 1) so it sits behind ground haze
            this.sun.y = (skyHeight * 0.9) + Math.sin(progress * Math.PI) * -(skyHeight * 0.7);

            // Add warm tint during dawn/dusk
            const tintFactor = 1.0 - this.sun.alpha;
            this.sun.tint = this.lerpColor(0xFFFFFF, 0xFFCC33, tintFactor);
        } else {
            this.sun.visible = false;
        }

        // Moon: 7:30 PM (0.81) to 5 AM (0.21)
        const moonStart = 0.81;
        const moonEnd = 0.21;

        const isMoonTime = (time > moonStart - fadeDuration || time < moonEnd + fadeDuration);

        if (isMoonTime) {
            this.moon.visible = true;

            let alpha = 1.0;
            if (time > moonStart - fadeDuration && time < moonStart) {
                alpha = (time - (moonStart - fadeDuration)) / fadeDuration;
            } else if (time > moonEnd && time < moonEnd + fadeDuration) {
                alpha = 1.0 - (time - moonEnd) / fadeDuration;
            }
            this.moon.alpha = Math.max(0, Math.min(1, alpha));

            let progress;
            if (time > moonStart) {
                progress = (time - moonStart) / (1 - moonStart + moonEnd);
            } else {
                progress = (1 - moonStart + time) / (1 - moonStart + moonEnd);
            }
            this.moon.x = width * progress;
            // Lowered at horizon
            this.moon.y = (skyHeight * 0.9) + Math.sin(progress * Math.PI) * -(skyHeight * 0.7);
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
