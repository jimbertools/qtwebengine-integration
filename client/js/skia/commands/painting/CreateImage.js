import JTools from '../../JTools.js';

function createImage(imageb64, hash) {
    JTools.cachedImageHashes[hash] = imageb64;
}

export default createImage;
