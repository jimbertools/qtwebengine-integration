import JTools from '../../JTools.js';

var cachedTextures = {};
var cachedRasters = {};
var cachedScaled = {};

function drawImageRect(
    layerId,
    tileX,
    tileY,
    srcX,
    srcY,
    srcWidth,
    srcHeight,
    dstX,
    dstY,
    dstWidth,
    dstHeight,
    hash,
    transformb64,
    clipb64
) {
    var tile = this.getLayer(layerId).getTile(tileX, tileY);
    this.checkForFlush(tile);
    var imageb64 = JTools.cachedImageHashes[hash];
    srcX = parseFloat(srcX);
    srcY = parseFloat(srcY);
    srcWidth = parseFloat(srcWidth);
    srcHeight = parseFloat(srcHeight);
    dstX = parseFloat(dstX);
    dstY = parseFloat(dstY);
    dstWidth = parseFloat(dstWidth);
    dstHeight = parseFloat(dstHeight);

    var transformStr = atob(transformb64);
    var transform = transformStr.split(';');
    transform.forEach((tr, i) => {
        transform[i] = parseFloat(tr);
    });

    var image;
    try {
        if (!cachedRasters[hash]) {
            var buffer = JTools.base64ToArrayBuffer(imageb64);
            image = CanvasKit.MakeImageFromEncoded(buffer);
            cachedRasters[hash] = image;

            // When CanvasKit has WebGL2 support we can remove rasters (above) and use backendtextures (below), with GrMipMapped.kYes
            var textureImg = image.makeTextureImage(tile.skiaCanvas.getGrContext(), CanvasKit.GrMipMapped.kYes);
            cachedTextures[hash] = textureImg.getBackendTexture(true);
        } else {
            image = cachedRasters[hash];
        }
    } catch (error) {
        console.log('Error while creating image:', error);
    }

    tile.skiaCanvas.save();
    var paint = new CanvasKit.SkPaint();

    var clipPath = CanvasKit.MakePathFromSVGString(atob(clipb64));
    tile.skiaCanvas.clipPath(clipPath, true);

    var subset = image;
    var isSubset = srcX != 0 || srcY != 0 || srcWidth != 0 || srcHeight != 0;
    if (isSubset) subset = image.makeSubset(CanvasKit.XYWHRect(srcX, srcY, srcWidth, srcHeight));

    var scaleWidth = transform[0] != 0 ? Math.round(dstWidth * transform[0]) : dstWidth;
    var scaleHeight = transform[3] != 0 ? Math.round(dstHeight * transform[3]) : dstHeight;

    var dstImageInfo = {
        colorType: CanvasKit.ColorType.RGBA_8888,
        height: scaleHeight,
        width: scaleWidth,
        alphaType: CanvasKit.AlphaType.Premul,
    };

    var imageFromBitmap;
    var gpuImage;
    if (cachedScaled[hash + scaleWidth + scaleHeight + srcX + srcY + srcWidth + srcHeight]) {
        gpuImage = CanvasKit.SkImage.MakeFromTexture(
            tile.skiaCanvas.getGrContext(),
            cachedScaled[hash + scaleWidth + scaleHeight + srcX + srcY + srcWidth + srcHeight],
            CanvasKit.GrSurfaceOrigin.kTopLeft_GrSurfaceOrigin,
            CanvasKit.ColorType.RGBA_8888,
            CanvasKit.AlphaType.Premul
        );
    } else {
        var pBytes = dstImageInfo.width * dstImageInfo.height * 4;
        var pPtr = CanvasKit._malloc(pBytes);
        var dstPixmap = CanvasKit.SkPixmap.makePixmap(dstImageInfo, pPtr, dstImageInfo.width * 4);
        subset.scalePixels(dstPixmap, CanvasKit.FilterQuality.High, CanvasKit.CachingHint.kAllow_CachingHint);
        var bitmap = new CanvasKit.SkBitmap();
        bitmap.installPixels(dstPixmap);
        imageFromBitmap = CanvasKit.SkImage.MakeFromBitmap(bitmap);
        gpuImage = imageFromBitmap.makeTextureImage(tile.skiaCanvas.getGrContext(), CanvasKit.GrMipMapped.kNo);
        cachedScaled[hash + scaleWidth + scaleHeight + srcX + srcY + srcWidth + srcHeight] = gpuImage.getBackendTexture(
            true
        );
        bitmap.delete();
        dstPixmap.delete();
    }

    //paint.setAlphaf(parseFloat(opacity));
    paint.setAntiAlias(true);
    tile.skiaCanvas.setTransform(
        transform[0] != 0 ? 1 : 0,
        transform[1],
        transform[2],
        transform[3] != 0 ? 1 : 0,
        transform[4] + dstX,
        transform[5] + dstY
    );
    tile.skiaCanvas.drawImage(gpuImage, 0, 0, paint);

    tile.skiaCanvas.restore();
    if (isSubset) subset.delete();
    if (imageFromBitmap) imageFromBitmap.delete();
    if (clipPath) clipPath.delete();
    paint.delete();
    CanvasKit._free(pPtr);
}

export default drawImageRect;
