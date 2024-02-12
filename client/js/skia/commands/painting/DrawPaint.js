function drawPaint(layerId, tileX, tileY, color, blendmode, transformb64, clipb64) {
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
    // paint.setAntiAlias(true); Is this needed?
    //TODO support more blendmodes or create something that gets CanvasKit.BlendMode by string
    if (blendmode == 1) {
        paint.setBlendMode(CanvasKit.BlendMode.Clear);
    }
    tile.skiaCanvas.clipPath(clipPath, true);

    tile.skiaCanvas.drawPaint(paint);
    tile.skiaCanvas.restore();
    paint.delete();
    clipPath.delete();
}

export default drawPaint;
