import PIXI from '../../libs/pixi.js';

// var backingStore = new PIXI.RenderTexture.create(1920, 1080);
// var backingSprite = new PIXI.Sprite(backingStore)

function flushToStage() {
    if (this.prevTile != null) {
        this.flushTile();
    }
    this.updateScene();

    // fixing the flickering, draw everything on one texture before adding to child
    //slow
    // this.app.renderer.render(this.layers[0].baseLayer, backingStore, true);
    // this.app.stage.addChild(backingSprite);
    // var t1 = performance.now();
    // console.log("flush took", t1 - t0)
    //

    this.app.stage.addChild(this.layers[0].baseLayer);
}

export default flushToStage;
