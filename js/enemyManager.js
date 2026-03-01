export function createEnemySystem(app) {

    let enemies = [];

    function create(x, y) {
        const texture = PIXI.Texture.from('assets/enemy.png');
        const enemy = new PIXI.Sprite(texture);

        enemy.anchor.set(0.5);
        enemy.x = x;
        enemy.y = y;

        // Randomize scale for variety
        enemy.scale.set(0.3 + Math.random() * 0.2); // Larger robo asset base scale

        // Simple vibration animation for enemies
        app.ticker.add(function wobble() {
            if (!enemies.includes(enemy)) {
                app.ticker.remove(wobble);
                return;
            }
            enemy.rotation = Math.sin(Date.now() * 0.02) * 0.1;
        });

        app.stage.addChild(enemy);
        enemies.push(enemy);
    }

    function getEnemies() {
        return enemies;
    }

    return { create, getEnemies };
}