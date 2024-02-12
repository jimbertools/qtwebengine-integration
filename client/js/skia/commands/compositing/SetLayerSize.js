import PIXI from '../../libs/pixi.js';

function setLayerSize(layerId, width, height) {
    var layer = this.getLayer(layerId);
    layer.baseLayer.children[0].width = width;
    layer.baseLayer.children[0].height = height;
    if (layer.mask) {
        layer.baseLayer.removeChild(layer.mask);
        layer.mask.destroy({
            children: true,
            texture: true,
            baseTexture: true,
        });
    }
    layer.jwidth = parseInt(width);
    layer.jheight = parseInt(height);

    var graphics = new PIXI.Graphics();
    graphics.beginFill(0xff700b, 1);
    graphics.drawRect(0, 0, parseInt(width), parseInt(height));
    layer.mask = graphics;

    layer.baseLayer.addChild(graphics);
    layer.baseLayer.mask = graphics;

    layer.refreshTransform();
}

export default setLayerSize;
