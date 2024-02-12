import { socketHandler } from '../state/SocketHandler.js';
import { ServerToClientCommand, ClientToServerCommand } from '../Proto.js';
import Download from '/js/models/Download.js';
import Command from '/js/models/Command.js';
import { virtualBrowser } from '/js/state/VirtualBrowser.js';
import Config from '/config.js';

export class DownloadHandler {
    constructor() {
        this.downloads = [];
        // this.downloads.push(new Download(5, "test5.png", "/tmp/"))
        socketHandler.addAsciiMessageHandler(this.parseCommand.bind(this));
        this.handlers = {};
        this.handlers[ServerToClientCommand.FILEDOWNLOADCREATE] = this.addDownload.bind(this);
        // this.handlers[ServerToClientCommand.FILEDOWNLOADDOWNLOADING] = this.onEvent.bind(this);
        this.handlers[ServerToClientCommand.FILEDOWNLOADPROGRESS] = this.onProgress.bind(this);
        this.handlers[ServerToClientCommand.FILEDOWNLOADRESUME] = this.onResume.bind(this);
        this.handlers[ServerToClientCommand.FILEDOWNLOADFINISH] = this.onFinish.bind(this);
        this.handlers[ServerToClientCommand.FILEDOWNLOADCANCEL] = this.onCancel.bind(this);
        this.handlers[ServerToClientCommand.FILEDOWNLOADPAUSE] = this.onPause.bind(this);
        this.handlers[ServerToClientCommand.FILEDOWNLOADTRIGGERDOWNLOAD] = this.onTriggerDownload.bind(this);
    }
    addDownload(id, fileName, path) {
        fileName = this.b64DecodeUnicode(fileName);
        // TODO this has changed so browserId is null
        // but fixing this will break other things that depend on this
        if (virtualBrowser.browserId != null) {
            path = `${virtualBrowser.browserId}/${path}/${fileName}`;
        }
        this.downloads.push(new Download(id, fileName, path));
    }
    getDownloadById(id) {
        return this.downloads.find(dw => dw.id === id);
    }
    // Events
    onProgress(id, bytesReceived, maxSize) {
        let download = this.getDownloadById(id);
        download.setState('downloading');
        download.bytesReceived = bytesReceived;
        download.maxSize = maxSize;
    }
    onPause(id) {
        let download = this.getDownloadById(id);
        download.setState('paused');
    }
    onResume(id) {
        let download = this.getDownloadById(id);
        download.setState('downloading');
    }
    onFinish(id) {
        let download = this.getDownloadById(id);
        download.state = 'finished';
    }
    onCancel(id) {
        let download = this.getDownloadById(id);
        download.setState('canceled');
    }
    onTriggerDownload(id) {
        let download = this.getDownloadById(id);
        var element = document.createElement('a');
        let downloadPath = encodeURI(
            `//${Config.BROKER_HOST}/downloads/${virtualBrowser.userId}/${download.path}/${download.fileName}`
        );
        element.setAttribute('href', downloadPath);
        element.setAttribute('download', download.fileName);
        element.click();
    }
    // Actions
    doPause(id) {
        var c = new Command();
        c.setContent(ClientToServerCommand.FILEDOWNLOADPAUSE, [id]);
        c.send();
    }
    doCancel(id) {
        var c = new Command();
        c.setContent(ClientToServerCommand.FILEDOWNLOADCANCEL, [id]);
        c.send();
    }
    doResume(id) {
        var c = new Command();
        c.setContent(ClientToServerCommand.FILEDOWNLOADRESUME, [id]);
        c.send();
    }
    b64DecodeUnicode(str) {
        // Going backwards: from bytestream, to percent-encoding, to original string.
        return decodeURIComponent(
            atob(str)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );
    }
    // Parser
    parseCommand(cmd) {
        let type = cmd[0];
        if (this.handlers[type] === undefined) {
            return;
        }
        this.handlers[type](...cmd.slice(1));
    }
}

export default DownloadHandler;
