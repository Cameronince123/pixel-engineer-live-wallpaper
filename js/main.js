import { Engineer } from './engineer.js';
import { createEnemySystem } from './enemyManager.js';
import { SceneManager } from './sceneManager.js';
import { Environment } from './environment.js';

export const app = new PIXI.Application({
    resizeTo: window,
    backgroundAlpha: 0, // Transparent canvas to show CSS background
    antialias: true
});

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
    environment.update(delta);
    engineer.update(enemySystem.getEnemies());
    sceneManager.update(delta);
});