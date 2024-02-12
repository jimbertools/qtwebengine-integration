import SocketHandler from '../handlers/SocketHandler.js';
import PIXI from './libs/pixi.js';
import Layer from './Layer.js';
import CommandParser from './commands/CommandParser.js';

class SkiaRenderer {
    constructor(app) {
        this.app = app;

        this.layers = [new Layer(0)];
        this.tilesToFlush = [];
        this.prevTile = null;
        this.ocanvas = new OffscreenCanvas(512, 512);
        this.sksurface = CanvasKit.MakeWebGLCanvasSurface(this.ocanvas);
        this.skcanvas = this.sksurface.getCanvas();
        this.skToPixiTexture = new PIXI.Texture.from(this.ocanvas);
        this.paint = new CanvasKit.SkPaint();
        this.cachedImageHashes = {};

        this.commandParser = new CommandParser(this);
        SocketHandler.addAsciiMessageHandler(this.commandParser.executeCommand.bind(this.commandParser));
    }

    getLayer(layerId) {
        return this.layers[layerId];
    }

    updateScene() {
        for (var i = 0; i < this.tilesToFlush.length; i++) {
            this.skcanvas.clear(CanvasKit.TRANSPARENT);
            this.tilesToFlush[i].skiaSurface.drawCanvas(this.skcanvas, 0, 0, this.paint);
            this.skcanvas.flush();

            this.skToPixiTexture.update(); // from offscr canvas to pixi texture

            this.app.renderer.render(new PIXI.Sprite(this.skToPixiTexture), this.tilesToFlush[i].texture, true); // from pixitexture to correct tile
        }
        this.tilesToFlush = [];
    }

    checkForFlush(tile) {
        if (!tile.equals(this.prevTile)) {
            if (this.prevTile != null) {
                this.flushTile();
            }
        }
        this.prevTile = tile;
    }

    flushTile() {
        this.prevTile.skiaCanvas.flush();
        this.tilesToFlush.push(this.prevTile);
    }
}

export default SkiaRenderer;
