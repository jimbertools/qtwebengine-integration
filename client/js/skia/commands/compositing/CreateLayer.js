import Layer from '../../Layer.js';
import PIXI from '../../libs/pixi.js';

function createLayer(layerId) {
    var layer = new Layer(layerId, this);

    this.layers[layerId] = layer;
    if (layerId != 0) {
        var graphics = new PIXI.Graphics();
        graphics.beginFill(0x00ff00);
        graphics.drawRect(0, 0, 25, 5);
        graphics.drawRect(0, 0, 5, 25);
        let text = new PIXI.Text(layerId);
        layer.baseLayer.addChild(text);
        layer.baseLayer.addChild(graphics);
        layer.baseLayer.isLayer = true; // so we know in pixi tree this is a layer
        this.layers[0].baseLayer.addChild(layer.baseLayer);
    }
}

export default createLayer;
