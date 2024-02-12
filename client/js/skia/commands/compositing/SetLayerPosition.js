function setLayerPosition(layerId, x, y) {
    var layer = this.getLayer(layerId);
    try {
        layer.baseLayer.x = x - layer.offset.x;
        layer.baseLayer.y = y - layer.offset.y;
        layer.position = { x, y };
        layer.refreshTransform();
        return layer;
    } catch (error) {
        console.log(layerId, error);
    }
}

export default setLayerPosition;
