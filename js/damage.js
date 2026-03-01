export function createDamageSystem(app) {

    let damageSpots = [];

    function create(x, y) {

        const hole = new PIXI.Graphics();
        hole.beginFill(0x000000);
        hole.drawCircle(0, 0, 20);
        hole.endFill();

        hole.x = x;
        hole.y = y;

        app.stage.addChild(hole);
        damageSpots.push(hole);
    }

    function getDamage() {
        return damageSpots;
    }

    return { create, getDamage };
}