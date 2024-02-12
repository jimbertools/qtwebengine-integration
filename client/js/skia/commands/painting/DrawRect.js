import JTools from '../../JTools.js';

function drawRect(
    layerId,
    tileX,
    tileY,
    posX,
    posY,
    width,
    height,
    color,
    blendmode,
    paintType,
    shaderStr,
    transformb64,
    clipb64
) {
    var layer = this.getLayer(layerId);
    if (!layer) return;
    var tile = layer.getTile(tileX, tileY);
    this.checkForFlush(tile);

    posX = parseFloat(posX);
    posY = parseFloat(posY);
    width = parseFloat(width);
    height = parseFloat(height);

    var clipPath = CanvasKit.MakePathFromSVGString(atob(clipb64));
    var transformStr = atob(transformb64);
    var transform = transformStr.split(';');
    transform.forEach((tr, i) => {
        transform[i] = parseFloat(tr);
    });
    tile.skiaCanvas.save();
    var paint = new CanvasKit.SkPaint();

    var shader;
    if (shaderStr.length > 0) {
        shader = JTools.makeShaderFromString(shaderStr, posX, posY);
        paint.setShader(shader);
    }

    tile.skiaCanvas.clipPath(clipPath, true);
    tile.skiaCanvas.setTransform(
        transform[0],
        transform[1],
        transform[2],
        transform[3],
        transform[4] + posX,
        transform[5] + posY
    );

    paint.setStyle({ value: parseInt(paintType) });
    paint.setColor(CanvasKit.UintColor(color));
    paint.setAntiAlias(true);
    paint.setBlendMode({ value: parseInt(blendmode) });

    tile.skiaCanvas.drawRect(CanvasKit.XYWHRect(0, 0, width, height), paint);
    tile.skiaCanvas.restore();
    paint.delete();
    clipPath.delete();
    if (shader) shader.delete();
}

export default drawRect;
