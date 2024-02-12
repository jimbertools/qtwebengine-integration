import { ClientToServerCommand } from '../Proto.js';
import Command from '/js/models/Command.js';

export class AuthenticationHandler {
    constructor() {
        this.url = null;
    }

    newRequest(url) {
        this.url = new URL(url);
    }

    cancelRequest() {
        this.url = null;
        var c = new Command();
        c.setContent(ClientToServerCommand.CANCELAUTHENTICATIONREQUEST, []);
        c.send();
    }

    login(user, password) {
        var c = new Command();
        c.setContent(ClientToServerCommand.AUTHENTICATIONRESPONSE, [this.url, user, password]);
        c.send();
        this.url = null;
    }
}

export default AuthenticationHandler;
