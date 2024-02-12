import PIXI from '../../libs/pixi.js';

function setLayerTransform(layerId, a, b, c, d, e, f, anchorX, anchorY) {
    var layer = this.getLayer(layerId);
    try {
        var transform = new PIXI.Transform();
        transform.setFromMatrix(new PIXI.Matrix(a, b, c, d, e, f));
        layer.transform = transform;

        if (!layer.position) return;
        layer.baseLayer.setTransform(
            transform.position.x + layer.position.x - layer.offset.x,
            transform.position.y + layer.position.y - layer.offset.y,
            transform.scale.x,
            transform.scale.y,
            transform.rotation,
            transform.skew.x,
            transform.skew.y
        );
    } catch (error) {
        console.log(layerId, error);
    }
}

export default setLayerTransform;
