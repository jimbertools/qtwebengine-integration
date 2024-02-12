import { socketHandler } from '../state/SocketHandler.js';

/**
 * Abstract Class Handler.
 *
 * @class Handler
 */
export class Handler {
    constructor() {
        if (this.constructor == Handler) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        socketHandler.addAsciiMessageHandler(this.parseAsciiCommand.bind(this));
        this.handlers = {};
    }

    parseAsciiCommand(cmd) {
        let type = cmd[0];
        if (this.handlers[type] === undefined) {
            return;
        }
        this.handlers[type](...cmd.slice(1));
    }
}
