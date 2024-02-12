import JTools from '../../JTools.js';

function drawRRect(
    layerId,
    tileX,
    tileY,
    posX,
    posY,
    width,
    height,
    topLx,
    topLy,
    topRx,
    topRy,
    bottomRx,
    bottomRy,
    bottomLx,
    bottomLy,
    color,
    paintType,
    blendmode,
    shaderStr,
    transformb64,
    clipb64
) {
    var tile = this.getLayer(layerId).getTile(tileX, tileY);
    this.checkForFlush(tile);
    posX = parseFloat(posX);
    posY = parseFloat(posY);
    width = parseFloat(width);
    height = parseFloat(height);
    topLx = parseFloat(topLx);
    topLy = parseFloat(topLy);
    topRx = parseFloat(topRx);
    topRy = parseFloat(topRy);
    bottomLx = parseFloat(bottomLx);
    bottomLy = parseFloat(bottomLy);
    bottomRx = parseFloat(bottomRx);
    bottomRy = parseFloat(bottomRy);
    var clipPath = CanvasKit.MakePathFromSVGString(atob(clipb64));

    var paint = new CanvasKit.SkPaint();

    var transformStr = atob(transformb64);
    var transform = transformStr.split(';');
    transform.forEach((tr, i) => {
        transform[i] = parseFloat(tr);
    });
    tile.skiaCanvas.save();
    tile.skiaCanvas.clipPath(clipPath, true);

    tile.skiaCanvas.setTransform(
        transform[0],
        transform[1],
        transform[2],
        transform[3],
        transform[4] + posX,
        transform[5] + posY
    );
    var shader;
    if (shaderStr.length > 0) {
        shader = JTools.makeShaderFromString(shaderStr, posX, posY);
        paint.setShader(shader);
    }

    paint.setBlendMode({ value: parseInt(blendmode) });
    paint.setStyle({ value: parseInt(paintType) });
    paint.setColor(CanvasKit.UintColor(color));
    paint.setAntiAlias(true);
    var skrrect = {
        rect: CanvasKit.XYWHRect(0, 0, width, height),
        rx1: topLx,
        ry1: topLy,
        rx2: topRx,
        ry2: topRy,
        rx3: bottomRx,
        ry3: bottomRy,
        rx4: bottomLx,
        ry4: bottomLy,
    };
    tile.skiaCanvas.drawRRect(skrrect, paint);
    tile.skiaCanvas.restore();
    paint.delete();
    clipPath.delete();
    if (shader) shader.delete();
}

export default drawRRect;
