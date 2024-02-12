function removeLayer(layerId) {
    var layer = this.getLayer(layerId);
    var i = layer.baseLayer.children.length; // get number of tiles and layers
    while (i--) {
        if (layer.baseLayer.children[i].isTile) {
            layer.baseLayer.children[i].destroy({
                // destroy tiles and textures
                children: true,
                texture: true,
                baseTexture: true,
            });
        }

        layer.baseLayer.removeChild(layer.baseLayer.children[i]);
    }
    if (layer.baseLayer.parent != null) {
        layer.baseLayer.parent.removeChild(layer.baseLayer);
    }
    this.layers[layerId] = undefined;
}

export default removeLayer;
