import { Command } from '/js/models/Command.js';
import { ClientToServerCommand } from '/js/Proto.js';
import { virtualBrowser } from '/js/state/VirtualBrowser.js';

function hideContextMenu() {
    var menu = document.getElementById('contextmenu');
    menu.setAttribute('style', 'display:none !important');
}

function hideTouchSelectionContextMenu() {
    var menu = document.getElementById('touchselectioncontextmenu');
    menu.setAttribute('style', 'display:none !important');
}

function copy() {
    if (!!window.safari) {
        console.log('virtualBrowser.selectionData: ', virtualBrowser.selectionData);
        navigator.clipboard.writeText(virtualBrowser.selectionData);
    } else {
        document.execCommand('copy');
    }

    var c = new Command();
    c.setContent(ClientToServerCommand.COPYEVENT, []);
    c.send();
}

function cut() {
    copy();
    var c = new Command();
    c.setContent(ClientToServerCommand.KEYBOARDEVENT, ['Backspace', 'Backspace', 2, 0]);
    c.send();
    c.setContent(ClientToServerCommand.KEYBOARDEVENT, ['Backspace', 'Backspace', 1, 0]);
    c.send();
}

function b64EncodeUnicode(str) {
    return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        })
    );
}

async function paste() {
    if (!!window.safari) {
        let items = await navigator.clipboard.read();

        for (let item of items) {
            if (!item.types.includes('text/plain')) {
                continue;
            }

            let clipboardData = await (await item.getType('text/plain')).text();
            console.log('We want to paste: ', clipboardData);

            var cm = new Command();
            cm.setContent(ClientToServerCommand.CLIPBOARDUPDATE, ['text', b64EncodeUnicode(clipboardData)]);
            cm.send();

            break;
        }
    } else {
        //Clipboard is set whenever a context menu is opened
        var c = new Command();
        c.setContent(ClientToServerCommand.KEYBOARDEVENT, ['KeyV', 'v', 2, 67108864]);
        c.send();
        c.setContent(ClientToServerCommand.KEYBOARDEVENT, ['KeyV', 'v', 1, 67108864]);
        c.send();
    }
}

function selectall() {
    var c = new Command();
    c.setContent(ClientToServerCommand.KEYBOARDEVENT, ['KeyA', 'a', 2, 67108864]);
    c.send();
    c.setContent(ClientToServerCommand.KEYBOARDEVENT, ['KeyA', 'a', 1, 67108864]);
    c.send();
}

function undo() {
    var c = new Command();
    c.setContent(ClientToServerCommand.KEYBOARDEVENT, ['KeyZ', 'z', 2, 67108864]);
    c.send();
    c.setContent(ClientToServerCommand.KEYBOARDEVENT, ['KeyZ', 'z', 1, 67108864]);
    c.send();
}

function redo() {
    var c = new Command();
    c.setContent(ClientToServerCommand.KEYBOARDEVENT, ['KeyY', 'y', 2, 67108864]);
    c.send();
    c.setContent(ClientToServerCommand.KEYBOARDEVENT, ['KeyY', 'y', 1, 67108864]);
    c.send();

    c.send();
}

function reload() {
    var c = new Command();
    c.setContent(ClientToServerCommand.RELOAD, []);
    c.send();
}

function back() {
    var c = new Command();
    c.setContent(ClientToServerCommand.BACK, []);
    c.send();
}

function forward() {
    var c = new Command();
    c.setContent(ClientToServerCommand.FORWARD, []);
    c.send();
}

function print() {
    var c = new Command();
    c.setContent(ClientToServerCommand.REQUESTPDFFORPRINTING, []);
    c.send();
}

function saveaspdf() {
    var c = new Command();
    c.setContent(ClientToServerCommand.PRINT, []);
    c.send();
}

//todo send to the backend and open a new tab there
function openlink() {
    openInNewTab(virtualBrowser.contextMenu.linkUrl);
}
async function copylink() {
    if (virtualBrowser.isProxy) {
        await navigator.clipboard.writeText(virtualBrowser.contextMenu.linkUrl);
    } else {
        await navigator.clipboard.writeText(
            `${window.location.protocol}//${window.location.host}/#${virtualBrowser.contextMenu.linkUrl}`
        );
    }
}
function openimage() {
    openInNewTab(virtualBrowser.contextMenu.mediaUrl);
}
async function copyimage() {
    var c = new Command();
    c.setContent(ClientToServerCommand.COPYIMAGE, []);
    c.send();
}

function saveimage() {
    var c = new Command();
    c.setContent(ClientToServerCommand.SAVEIMAGE, []);
    c.send();
}

function openInNewTab(link) {
    if (window !== parent && document.referrer) {
        window.open(`${document.referrer}/browse?url=${encodeURI(link)}`, '_blank');
    } else if (virtualBrowser.isAppIsolating) {
        const url = new URL(link);
        window.open(`//${window.location.host}/#${url.host + url.pathname + url.search}`, '_blank');
    } else if (virtualBrowser.isProxy) {
        window.open(`${link}`, '_blank');
    } else {
        window.open(`//${window.location.host}/#${link}`, '_blank');
    }
}
async function copyimageLink() {
    await navigator.clipboard.writeText(
        `${window.location.protocol}//${window.location.host}/#${virtualBrowser.contextMenu.mediaUrl}`
    );
}
function openvideo() {
    window.open(
        `${window.location.protocol}//${window.location.host}/#${virtualBrowser.contextMenu.mediaUrl}`,
        '_blank'
    );
}
async function copyvideo() {
    await navigator.clipboard.writeText(
        `${window.location.protocol}//${window.location.host}/#${virtualBrowser.contextMenu.mediaUrl}`
    );
}
function savevideo() {
    var c = new Command();
    c.setContent(ClientToServerCommand.SAVEMEDIA, []);
    c.send();
}

export default {
    hideContextMenu,
    hideTouchSelectionContextMenu,
    copy,
    cut,
    paste,
    selectall,
    undo,
    redo,
    reload,
    back,
    forward,
    print,
    saveaspdf,
    openlink,
    copylink,
    openimage,
    copyimage,
    copyimageLink,
    saveimage,
    openvideo,
    copyvideo,
    savevideo,
};
