//Clear over multiple tiles
function invalidateRect(layerId, x, y, width, height) {
    x = parseFloat(x);
    y = parseFloat(y);
    width = parseFloat(width);
    height = parseFloat(height);

    //TODO @JohnKarl Refactor
    //if your brain can't handle this, contact @JohnKarl
    var layer = this.getLayer(layerId);
    var startTileX = Math.floor(x / layer.tileWidth);
    var startTileY = Math.floor(y / layer.tileHeight);
    var endTileX = Math.floor((x + width) / layer.tileWidth);
    var endTileY = Math.floor((y + height) / layer.tileHeight);

    var xOnFirstTile = x % layer.tileWidth;
    var yOnFirstTile = y % layer.tileHeight;
    var widthOnFirstTile = startTileX == endTileX ? width : layer.tileWidth - xOnFirstTile;
    var heightOnFirstTile = startTileY == endTileY ? height : layer.tileHeight - yOnFirstTile;

    var widthOnLastTile = startTileX == endTileX ? width : (x + width) % layer.tileWidth;
    var heightOnLastTile = startTileY == endTileY ? height : (y + height) % layer.tileHeight;

    var paint = new CanvasKit.SkPaint();
    paint.setBlendMode(CanvasKit.BlendMode.Clear);

    for (var tileX = startTileX; tileX <= endTileX; tileX++) {
        for (var tileY = startTileY; tileY <= endTileY; tileY++) {
            var tile = layer.getTile(tileX, tileY);
            this.checkForFlush(tile);

            var width = layer.tileWidth;
            var height = layer.tileHeight;
            var realX = 0;
            var realY = 0;

            if (tileX == startTileX) {
                width = widthOnFirstTile;
                realX = xOnFirstTile;
            }

            if (tileY == startTileY) {
                height = heightOnFirstTile;
                realY = yOnFirstTile;
            }

            if (startTileX != endTileX) {
                if (tileX == endTileX) {
                    width = widthOnLastTile;
                }
            }

            if (startTileY != endTileY) {
                if (tileY == endTileY) {
                    height = heightOnLastTile;
                }
            }

            tile.skiaCanvas.drawRect(CanvasKit.XYWHRect(realX, realY, width, height), paint);
        }
    }
}

export default invalidateRect;
