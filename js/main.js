import { Engineer } from './engineer.js';
import { createEnemySystem } from './enemyManager.js';
import { SceneManager } from './sceneManager.js';
import { Environment } from './environment.js';

export const app = new PIXI.Application({
    resizeTo: window,
    backgroundAlpha: 0, // Transparent canvas to show CSS background
    antialias: true
});

// --- USER CONFIG ---
export const USER_CONFIG = {
    timezoneOffset: 5.5, // IST (India)
    cycleSpeed: 20000      // 1.0 = Real-time. Try 20000 to see the whole day in seconds.
};
// --------------------

app.view.id = 'pixi-canvas';
document.body.appendChild(app.view);

let mousePos = { x: 0, y: 0 };

window.addEventListener("mousemove", (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
});

const environment = new Environment(app);
const engineer = new Engineer(app, mousePos);
// Explicitly re-add engineer to ensure he is above ground but below foreground
app.stage.setChildIndex(engineer.sprite, app.stage.children.length - 2);

const enemySystem = createEnemySystem(app);
const sceneManager = new SceneManager(app, engineer, enemySystem);

window.addEventListener("dblclick", (e) => {
    enemySystem.create(e.clientX, e.clientY);
});

app.ticker.add((delta) => {
    // 1. Calculate Time with offset
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    let normalizedTime;
    if (USER_CONFIG.cycleSpeed > 1) {
        normalizedTime = (now * USER_CONFIG.cycleSpeed / dayInMs) % 1.0;
    } else {
        // Local time adjusted for offset correctly
        const d = new Date(now + (USER_CONFIG.timezoneOffset * 3600 * 1000));
        const ms = (d.getUTCHours() * 3600000) + (d.getUTCMinutes() * 60000) + (d.getUTCSeconds() * 1000) + d.getUTCMilliseconds();
        normalizedTime = ms / dayInMs;
    }

    // 2. Update Systems
    environment.update(delta, normalizedTime);
    engineer.update(enemySystem.getEnemies());
    sceneManager.update(delta);
});