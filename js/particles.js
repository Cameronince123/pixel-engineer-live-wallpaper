export function sparkEffect(app, x, y) {

    for (let i = 0; i < 10; i++) {

        const p = new PIXI.Graphics();
        p.beginFill(0xffff00);
        p.drawRect(0, 0, 3, 3);
        p.endFill();

        p.x = x;
        p.y = y;
        p.vx = (Math.random() - 0.5) * 4;
        p.vy = (Math.random() - 0.5) * 4;
        p.life = 30;

        app.stage.addChild(p);

        app.ticker.add(function update() {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;

            if (p.life <= 0) {
                app.stage.removeChild(p);
                app.ticker.remove(update);
            }
        });
    }
}