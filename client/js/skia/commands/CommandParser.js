import drawRect from './painting/DrawRect.js';
import drawRRect from './painting/DrawRRect.js';
import drawText from './painting/DrawText.js';
import drawPath from './painting/DrawPath.js';
import drawPaint from './painting/DrawPaint.js';
import drawImageRect from './painting/DrawImageRect.js';
import invalidateRect from './painting/InvalidateRect.js';
import createImage from './painting/CreateImage.js';
import createFont from './painting/CreateFont.js';

import createLayer from './compositing/CreateLayer.js';
import setLayerPosition from './compositing/SetLayerPosition.js';
import setLayerSize from './compositing/SetLayerSize.js';
import setLayerColor from './compositing/SetLayerColor.js';
import setLayerScrollOffset from './compositing/SetLayerScrollOffset.js';
import removeLayer from './compositing/RemoveLayer.js';
import addLayerChildToParent from './compositing/AddLayerChildToParent.js';
import setLayerTransform from './compositing/SetLayerTransform.js';
import setCustomTileSize from './compositing/SetCustomTileSize.js';
import flushToStage from './compositing/FlushToStage.js';

class CommandParser {
    constructor(skiaRenderer) {
        this.commands = {
            1: drawRect.bind(skiaRenderer),
            2: drawText.bind(skiaRenderer),
            3: drawRRect.bind(skiaRenderer),
            4: drawPath.bind(skiaRenderer),
            5: drawPaint.bind(skiaRenderer),
            6: invalidateRect.bind(skiaRenderer),
            7: drawImageRect.bind(skiaRenderer),
            8: setLayerPosition.bind(skiaRenderer),
            9: setLayerSize.bind(skiaRenderer),
            10: setLayerColor.bind(skiaRenderer),
            11: setLayerScrollOffset.bind(skiaRenderer),
            12: removeLayer.bind(skiaRenderer),
            13: addLayerChildToParent.bind(skiaRenderer),
            14: createLayer.bind(skiaRenderer),
            15: flushToStage.bind(skiaRenderer),
            16: setLayerTransform.bind(skiaRenderer),
            17: setCustomTileSize.bind(skiaRenderer),
            18: createImage.bind(skiaRenderer),
            45: createFont.bind(skiaRenderer),
        };
    }

    executeCommand(args) {
        try {
            if (args[0] === 'gfx') {
                var type = parseInt(args[1]);
                var command = this.commands[type];
                if (command == undefined) {
                    console.warn(`Command with type ${type} does not exist!`, ...args);
                    return;
                }
                command(...args.slice(2));
            }
        } catch (e) {
            console.error('ERROR: ', e);
        }
    }
}

export default CommandParser;
