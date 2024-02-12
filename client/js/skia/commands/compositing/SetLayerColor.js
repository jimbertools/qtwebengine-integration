import JTools from '../../JTools.js';

function setLayerColor(layerId, color) {
    var layer = this.getLayer(layerId);
    if (layer && layer.baseLayer && layer.baseLayer.children.length > 0) {
        var colors = CanvasKit.getColorComponents(color);
        var hex = JTools.RGBToHex(colors[0], colors[1], colors[2]);
        layer.baseLayer.children[0].alpha = colors[3];
        layer.baseLayer.children[0].tint = hex;
        layer.jbackgroundcolor = color;
    }
}

export default setLayerColor;
