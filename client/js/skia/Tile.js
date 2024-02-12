import PIXI from './libs/pixi.js';

class Tile {
    constructor(skiaRenderer, layerId, x, y, width, height) {
        this.skiaRenderer = skiaRenderer;
        this.layerId = layerId;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.texture = new PIXI.RenderTexture.create(512, 512);
        this.sprite = new PIXI.Sprite(this.texture);
        this.sprite.isTile = true; // so we know in pixi tree that this is a tile
        this.sprite.x = x * width;
        this.sprite.y = y * height;
        this.skiaSurface = CanvasKit.MakeRenderTarget(
            this.skiaRenderer.skcanvas.getGrContext(),
            this.width,
            this.height
        );
        this.skiaCanvas = this.skiaSurface.getCanvas();
    }

    equals(otherTile) {
        if (otherTile == null) {
            return false;
        }
        return this.layerId == otherTile.layerId && this.x == otherTile.x && this.y == otherTile.y;
    }

    resize(width, height) {
        //todo if not performant, rework this
        this.skiaSurface.delete();
        this.skiaSurface = CanvasKit.MakeRenderTarget(this.skiaRenderer.skcanvas.getGrContext(), width, height);
        this.sprite.x = this.x * width;
        this.sprite.y = this.y * height;
        this.skiaCanvas = this.skiaSurface.getCanvas();
    }
}

export default Tile;
