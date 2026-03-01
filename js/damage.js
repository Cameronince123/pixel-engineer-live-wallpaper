export function createDamageSystem(app) {

    let damageSpots = [];

    function create(x, y) {
        const texture = PIXI.Texture.from('assets/damage.png');
        const crack = new PIXI.Sprite(texture);

        crack.anchor.set(0.5);
        crack.x = x;
        crack.y = y;

        // Randomize scale and rotation for variety
        crack.scale.set(0.1 + Math.random() * 0.1);
        crack.rotation = Math.random() * Math.PI * 2;
        crack.alpha = 0.8;

        app.stage.addChild(crack);
        damageSpots.push(crack);
    }

    function getDamage() {
        return damageSpots;
    }

    return { create, getDamage };
}