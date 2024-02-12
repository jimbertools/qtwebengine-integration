function drawText(layerId, tileX, tileY, posX, posY, text, size, color, transformb64, clipb64) {
    var tile = this.getLayer(layerId).getTile(tileX, tileY);
    this.checkForFlush(tile);

    posX = parseFloat(posX);
    posY = parseFloat(posY);
    var clipPath = CanvasKit.MakePathFromSVGString(atob(clipb64));

    tile.skiaCanvas.save();

    var transformStr = atob(transformb64);
    var transform = transformStr.split(';');
    transform.forEach((tr, i) => {
        transform[i] = parseFloat(tr);
    });
    tile.skiaCanvas.clipPath(clipPath, true);

    tile.skiaCanvas.setTransform(
        transform[0],
        transform[1],
        transform[2],
        transform[3],
        transform[4] + posX,
        transform[5] + posY
    );
    const textPaint = new CanvasKit.SkPaint();
    textPaint.setColor(CanvasKit.UintColor(color));
    textPaint.setAntiAlias(true);
    // text = b64DecodeUnicode(text);
    text = atob(text);
    const font = new CanvasKit.SkFont(null, parseFloat(size));

    font.setHinting(CanvasKit.FontHinting.kSlight);

    text = CanvasKit.SkTextBlob.MakeFromText(text, font);

    tile.skiaCanvas.drawTextBlob(text, 0, 0, textPaint);

    tile.skiaCanvas.restore();
    font.delete();
    clipPath.delete();
    textPaint.delete();
    text.delete();
}

export default drawText;
