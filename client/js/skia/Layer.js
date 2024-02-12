import PIXI from './libs/pixi.js';
import Tile from './Tile.js';

class Layer {
    constructor(id, skiaRenderer) {
        console.log('usp nig');
        this.skiaRenderer = skiaRenderer;
        this.baseLayer = new PIXI.Container();
        this.tileWidth = 254;
        this.tileHeight = 254;
        this.tiles = [];
        this.id = id;

        var bg = new PIXI.Sprite(PIXI.Texture.WHITE);
        bg.width = 1;
        bg.height = 1;
        bg.alpha = 0;
        this.baseLayer.addChild(bg);

        this.baseLayer.addChild(new PIXI.Container());
        this.position = {
            x: 0,
            y: 0,
        };
        this.offset = {
            x: 0,
            y: 0,
        };
        this.transform = undefined;
        this.anchorX = 0;
        this.anchorY = 0;
    }

    getTile(tileX, tileY) {
        if (this.tiles[tileX] === undefined) {
            this.tiles[tileX] = [];
        }
        if (this.tiles[tileX][tileY] === undefined && this.baseLayer) {
            var tile = new Tile(this.skiaRenderer, this.id, tileX, tileY, this.tileWidth, this.tileHeight);
            this.tiles[tileX][tileY] = tile;
            this.baseLayer.children[1].addChild(tile.sprite);
        }
        if (
            this.tiles[tileX][tileY].skiaSurface.width() != this.tileWidth ||
            this.tiles[tileX][tileY].skiaSurface.height() != this.tileHeight
        ) {
            this.tiles[tileX][tileY].resize(this.tileWidth, this.tileHeight);
        }

        return this.tiles[tileX][tileY];
    }

    refreshTransform() {
        if (this.transform && this.position) {
            var pivotX = this.jwidth * this.transform.scale.x * this.anchorX;
            var pivotY = this.jheight * this.transform.scale.y * this.anchorY;
            if (!isNaN(pivotX) && !isNaN(pivotY)) {
                this.baseLayer.setTransform(
                    this.transform.position.x + this.position.x + pivotX,
                    this.transform.position.y + this.position.y + pivotY,
                    this.transform.scale.x,
                    this.transform.scale.y,
                    this.transform.rotation,
                    this.transform.skew.x,
                    this.transform.skew.y,
                    pivotX,
                    pivotY
                );
            }
        }
    }
}

export default Layer;
