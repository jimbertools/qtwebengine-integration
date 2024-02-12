function setLayerScrollOffset(layerId, x, y) {
    var layer = this.getLayer(layerId);
    if (!layer) return;
    layer.offset = { x: parseFloat(x), y: parseFloat(y) };
    layer.baseLayer.x = layer.position.x - x;
    layer.baseLayer.y = layer.position.y - y;
}

export default setLayerScrollOffset;
