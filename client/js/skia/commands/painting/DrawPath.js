import JTools from '../../JTools.js';

function drawPath(layerId, tileX, tileY, pathbase64, color, paintType, transformb64, clipb64) {
    var tile = this.getLayer(layerId).getTile(tileX, tileY);
    this.checkForFlush(tile);

    var transformStr = atob(transformb64);
    var transform = transformStr.split(';');
    transform.forEach((tr, i) => {
        transform[i] = parseFloat(tr);
    });
    var clipPath = CanvasKit.MakePathFromSVGString(atob(clipb64));

    tile.skiaCanvas.save();
    tile.skiaCanvas.setTransform(transform[0], transform[1], transform[2], transform[3], transform[4], transform[5]);
    const paint = new CanvasKit.SkPaint();
    paint.setColor(CanvasKit.UintColor(color));
    paint.setAntiAlias(true);
    tile.skiaCanvas.clipPath(clipPath, true);

    var path = CanvasKit.MakePathFromSVGString(atob(pathbase64));

    paint.setStyle({ value: parseInt(paintType) });
    tile.skiaCanvas.drawPath(path, paint);
    tile.skiaCanvas.restore();
    paint.delete();
    clipPath.delete();
    path.delete();
}

export default drawPath;
