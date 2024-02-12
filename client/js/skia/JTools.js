var cachedImageHashes = {};

var RGBToHex = function (r, g, b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);

    if (r.length == 1) r = '0' + r;
    if (g.length == 1) g = '0' + g;
    if (b.length == 1) b = '0' + b;

    return '0x' + r + g + b;
};

var base64ToArrayBuffer = function (base64) {
    var binary_string = atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
};

var makeShaderFromString = function (shaderString, posX, posY) {
    var decoded = atob(shaderString);
    var args = decoded.split(';');
    var shader = undefined;
    var type = args[0];
    args.splice(0, 1);
    switch (parseInt(type)) {
        case 0: //image
            //todo cache images
            var buffer = base64ToArrayBuffer(cachedImageHashes[args[0]]);
            var image = CanvasKit.MakeImageFromEncoded(buffer);

            // When CanvasKit has WebGL2 support we can remove rasters (above) and use backendtextures (below), with GrMipMapped.kYes
            // var textureImg = image.makeTextureImage(tile.skiaCanvas.getGrContext(), CanvasKit.GrMipMapped.kYes);

            var shaderTransformStr = atob(args[1]);
            var shaderTransform = shaderTransformStr.split(';');
            shaderTransform.forEach((tr, i) => {
                shaderTransform[i] = parseFloat(tr);
            });
            shader = image.makeShader(CanvasKit.TileMode.Repeat, CanvasKit.TileMode.Repeat, [
                shaderTransform[0],
                shaderTransform[2],
                shaderTransform[4] - posX,
                shaderTransform[1],
                shaderTransform[3],
                shaderTransform[5] - posY,
            ]);
            image.delete();
            break;
        case 2: //linear
            var colorAmount = parseInt(args[0]);
            var colors = args.slice(1, colorAmount + 1);
            var pos = args.slice(colorAmount + 1, colorAmount + 3);
            var startX = parseFloat(args[colorAmount + 3]);
            var startY = parseFloat(args[colorAmount + 4]);
            var endX = parseFloat(args[colorAmount + 5]);
            var endY = parseFloat(args[colorAmount + 6]);

            var shaderTransformStr = atob(args[colorAmount + 7]);
            var shaderTransform = shaderTransformStr.split(';');
            shaderTransform.forEach((tr, i) => {
                shaderTransform[i] = parseFloat(tr);
            });
            shader = CanvasKit.MakeLinearGradientShader(
                [startX, startY],
                [endX, endY],
                colors,
                pos,
                CanvasKit.TileMode.Repeat,
                [
                    shaderTransform[0],
                    shaderTransform[2],
                    shaderTransform[4] - posX,
                    shaderTransform[1],
                    shaderTransform[3],
                    shaderTransform[5] - posY,
                ]
            );
            break;
        default:
            break;
    }
    return shader;
};

export default {
    RGBToHex,
    base64ToArrayBuffer,
    makeShaderFromString,
    cachedImageHashes,
};
