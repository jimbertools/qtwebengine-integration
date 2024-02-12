function init() {
    PintarJS.silent();
}

export async function drawImageOnCanvasPixar(canvas, data, size) {
    console.log("drawImageOnCanvasPixar")
    let pintar = canvas.pintar;
    let blob = new Blob([data], { type: 'image/png' });
    let url = URL.createObjectURL(blob);

    var img = new Image();
    img.onload = async () => {
        const texture = new PintarJS.Texture(img);
        let sprite = new PintarJS.Sprite(texture);
        sprite.width = size.width;
        sprite.height = size.height;

        try {
            pintar.startFrame();
            pintar.drawSprite(sprite);
            pintar.endFrame();
        } catch (error) {
            pintar.endFrame();
            console.log(error)
            console.log(await base64_arraybuffer(data))
        }
        URL.revokeObjectURL(url)
    };
    img.src = url;
}

export function clearCanvas(canvas) {
    console.log("ClearCanvas")

    let pintar = canvas.pintar;
    pintar.startFrame();
    pintar.clear();
    pintar.endFrame();
}

export async function drawImageOnCanvas(canvas, data) {
    const gl = canvas.getContext('webgl');
    var program = webglUtils.createProgramFromScripts(gl, ['drawImage-vertex-shader', 'drawImage-fragment-shader']);

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, 'a_position');
    var texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');

    // lookup uniforms
    var matrixLocation = gl.getUniformLocation(program, 'u_matrix');
    var textureLocation = gl.getUniformLocation(program, 'u_texture');

    const textureInfo = await loadImageAndCreateTextureInfo(gl, data);
    console.log(textureInfo);
    drawImage(gl, textureInfo.texture, textureInfo.width, textureInfo.height, 0, 0);
}

// creates a texture info { width: w, height: h, texture: tex }
// The texture will start with 1x1 pixels and be updated
// when the image has loaded
function loadImageAndCreateTextureInfo(gl, data) {
    return new Promise(resolve => {
        let blob = new Blob([data], { type: 'image/png' });
        let url = URL.createObjectURL(blob);

        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);

        // let's assume all images are not a power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        var textureInfo = {
            width: 1, // we don't know the size until it loads
            height: 1,
            texture: tex,
        };
        var img = new Image();
        img.onload = () => {
            textureInfo.width = img.width;
            textureInfo.height = img.height;

            gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            resolve(textureInfo);
        };
        img.src = url;
    });
}

// Unlike images, textures do not have a width and height associated
// with them so we'll pass in the width and height of the texture
function drawImage(gl, tex, texWidth, texHeight, dstX, dstY, positionBuffer, positionLocation) {
    gl.bindTexture(gl.TEXTURE_2D, tex);

    // Tell WebGL to use our shader program pair
    // gl.useProgram(program);

    // Setup the attributes to pull data from our buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    // this matrix will convert from pixels to clip space
    var matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

    // this matrix will translate our quad to dstX, dstY
    matrix = m4.translate(matrix, dstX, dstY, 0);

    // this matrix will scale our 1 unit quad
    // from 1 unit to texWidth, texHeight units
    matrix = m4.scale(matrix, texWidth, texHeight, 1);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Tell the shader to get the texture from texture unit 0
    gl.uniform1i(textureLocation, 0);

    // draw the quad (2 triangles, 6 vertices)
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
const base64_arraybuffer = async (data) => {
    // Use a FileReader to generate a base64 data URI
    const base64url = await new Promise((r) => {
        const reader = new FileReader()
        reader.onload = () => r(reader.result)
        reader.readAsDataURL(new Blob([data]))
    })

    /*
    The result looks like 
    "data:application/octet-stream;base64,<your base64 data>", 
    so we split off the beginning:
    */
    return base64url.split(",", 2)[1]
}


init();