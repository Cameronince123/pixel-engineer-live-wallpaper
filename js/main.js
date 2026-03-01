import { Engineer } from './engineer.js';
import { createDamageSystem } from './damage.js';

export const app = new PIXI.Application({
    resizeTo: window,
    backgroundColor: 0x0f0f1a,
    antialias: true
});

document.body.appendChild(app.view);

let mousePos = { x: 0, y: 0 };

window.addEventListener("mousemove", (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
});

const engineer = new Engineer(app, mousePos);
const damageSystem = createDamageSystem(app);

window.addEventListener("dblclick", (e) => {
    damageSystem.create(e.clientX, e.clientY);
});

app.ticker.add(() => {
    engineer.update(damageSystem.getDamage());
});