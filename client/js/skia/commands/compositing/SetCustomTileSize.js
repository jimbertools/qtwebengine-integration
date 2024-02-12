function setCustomTileSize(layerId, width, height) {
    var layer = this.getLayer(layerId);
    if (layer) {
        layer.tileWidth = parseInt(width) - 2;
        layer.tileHeight = parseInt(height) - 2;
    }
}

export default setCustomTileSize;
