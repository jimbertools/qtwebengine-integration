import Extensions from '/js/Extensions.js';
import { socketHandler } from '/js/state/SocketHandler.js';
import changeCursor from '/js/virtualbrowser/CursorChange.js';
import { Command } from '/js/models/Command.js';
import { ServerToClientCommand, ClientToServerCommand } from '/js/Proto.js';
import { physicalBrowser } from '/js/state/PhysicalBrowser.js';
import ContextMenu from '/js/virtualbrowser/ContextMenu.js';
import ContextMenuEvents from '/js/virtualbrowser/ContextMenuEvents.js';
import { uploadHandler } from '/js/state/UploadHandler.js';
import { permissionHandler } from '/js/state/PermissionHandler.js';
import { authenticationHandler } from '/js/state/AuthenticationHandler.js';
import { domHandler } from '/js/state/DomHandler.js';
import { SearchBox } from '/js/virtualbrowser/SearchBox.js';

Extensions();

/* Virtual browser will provide all sorts of functions to make your physical browser behave like your virtual
one and sync states between them */

class VirtualBrowser {
    constructor() {
        socketHandler.addAsciiMessageHandler(this.commandParser.bind(this));
        socketHandler.addBrowserReadyHandler(this.onStart.bind(this));

        this.clipboardData = {
            updateClipboard: false,
            type: '',
            data: '',
        };
        this.selectionData = '';
        this.contextMenu = {};
        this.currentFavicon = null;
        this.currentUrl = '';
        this.inputVisible = false;
        this.historyList = [];
        this.isProxy = false;
        this.showSelectionMenu = false;
        this.isolationDomain = '';

        this.isAppIsolating = false;
        this.isolationDomains = [];

        this.shouldCleanupWindow = true;

        this.advertisementWarning = {
            url: null,
            // url: 'asdsdf',
        };

        this.externalUrlToOpen = '';

        this.domRenderingDisabled = false;

        this.toOpenPopup = '';
        this.toOpenPopupRect = {};
        this.adblockEnabled = false;

        // this.cookieJar = new CookieJar();
        this.browserId = null;
        this.userId = null;
        this.downloadsEnabled = null;
        this.searchBox = new SearchBox();

        this.isFullscreen = false;

        this.windowOpenRequest = {
            url: null,
            id: null,
        };

        this.handlers = {};
        this.handlers[ServerToClientCommand.TITLE] = this.onChangeTitle.bind(this);
        this.handlers[ServerToClientCommand.FULLSCREENREQUEST] = this.onFullscreenRequest.bind(this);
        this.handlers[ServerToClientCommand.CLIPBOARD] = this.onClipboardChange.bind(this);
        this.handlers[ServerToClientCommand.SELECTION] = this.onSelectionChange.bind(this);
        this.handlers[ServerToClientCommand.CURSOR] = this.onChangeCursor.bind(this);
        this.handlers[ServerToClientCommand.OPENTAB] = this.onOpenTab.bind(this);
        this.handlers[ServerToClientCommand.ICON] = this.onChangeIcon.bind(this);
        this.handlers[ServerToClientCommand.SHOWINPUT] = this.onShowInput.bind(this);
        this.handlers[ServerToClientCommand.HIDEINPUT] = this.onHideInput.bind(this);
        this.handlers[ServerToClientCommand.SHOWCONTEXTMENU] = this.onShowContextMenu.bind(this);
        this.handlers[ServerToClientCommand.PDF] = this.onPdf.bind(this);
        this.handlers[ServerToClientCommand.ALERT] = this.onAlert.bind(this);
        this.handlers[ServerToClientCommand.REQUESTPERMISSION] = this.onRequestPermission.bind(this);
        this.handlers[ServerToClientCommand.NOTIFICATION] = this.onNotification.bind(this);
        this.handlers[ServerToClientCommand.FILEUPLOAD] = this.onFileUpload.bind(this);
        this.handlers[ServerToClientCommand.FILEUPLOADFINISHED] = this.onFileUploadFinished.bind(this);
        this.handlers[ServerToClientCommand.SHOWSELECTIONMENU] = this.onShowSelectionMenu.bind(this);
        this.handlers[ServerToClientCommand.HIDESELECTIONMENU] = this.onHideSelectionMenu.bind(this);
        this.handlers[ServerToClientCommand.SETTOUCHHANDLEBOUNDS] = this.onSetTouchHandleBounds.bind(this);
        this.handlers[ServerToClientCommand.SETTOUCHHANDLEORIENTATION] = this.onSetTouchHandleOrientation.bind(this);
        this.handlers[ServerToClientCommand.SETTOUCHHANDLEVISIBILITY] = this.onSetTouchHandleVisibility.bind(this);
        this.handlers[ServerToClientCommand.SETTOUCHHANDLEOPACITY] = this.onSetTouchHandleOpacity.bind(this);
        this.handlers[ServerToClientCommand.POPUPOPENED] = this.onPopupOpened.bind(this);
        this.handlers[ServerToClientCommand.POPUPCLOSED] = this.onPopupClosed.bind(this);
        this.handlers[ServerToClientCommand.POPUPRESIZED] = this.onPopupResized.bind(this);
        this.handlers[ServerToClientCommand.OPENSERVICE] = this.onOpenService.bind(this);
        this.handlers[ServerToClientCommand.PAGELOADINGSTARTED] = this.onPageLoadStarted.bind(this);
        this.handlers[ServerToClientCommand.PAGELOADINGFINISHED] = this.onPageLoadFinished.bind(this);
        this.handlers[ServerToClientCommand.WINDOWOPENED] = this.onWindowOpened.bind(this);
        this.handlers[ServerToClientCommand.PONG] = this.onPong.bind(this);
        this.handlers[ServerToClientCommand.PDFFORPRINTING] = this.onPdfForPrinting.bind(this);
        this.handlers[ServerToClientCommand.REPLACEHISTORY] = this.onReplaceHistory.bind(this);
        this.handlers[ServerToClientCommand.PUSHHISTORY] = this.onPushHistory.bind(this);
        this.handlers[ServerToClientCommand.AUTHENTICATIONREQUEST] = this.onAuthenticationRequest.bind(this);
        this.handlers[ServerToClientCommand.SEARCHMATCHES] = this.onSearchMatches.bind(this);
        this.handlers[ServerToClientCommand.LEAVEISOLATION] = this.onLeaveIsolation.bind(this);
        this.handlers[ServerToClientCommand.ADDBLOCKSTATECHANGE] = this.onAdblockStateChange.bind(this);
        this.handlers[ServerToClientCommand.ADVERTISEMENTREQUEST] = this.onAdvertisementRequest.bind(this);
        this.handlers[ServerToClientCommand.CLOSEWINDOW] = () => {
            this.onCloseWindow();
        };
    }

    onWindowOpened(windowId) {
        console.log('onwindowopen');
        if (window !== parent && document.referrer) {
            window.open(`${document.referrer}/browse?windowId=${windowId}`, '_blank');
        } else {
            // window.open with target=blank on safari is only allowed in the scope of a userinput
            if (physicalBrowser.device.needsUserActionToOpenNewWindow()) {
                this.windowOpenRequest.url = `//${window.location.host}/?windowId=${windowId}`;
                this.windowOpenRequest.id = windowId;
                return;
            }
            window.open(`//${window.location.host}/?windowId=${windowId}`, '_blank');
        }
    }

    onPageLoadStarted() {
        document.getElementById('page-load-spinner').style.visibility = 'visible';
    }
    onPageLoadFinished() {
        document.getElementById('page-load-spinner').style.visibility = 'hidden';
    }
    onPopupClosed() {
        window.close();
    }

    onPopupResized(width, height) {
        physicalBrowser.resizedByBackend = true;
        window.resizeTo(width, height);
    }

    onPopupOpened(winId, x, y, width, height) {
        this.toOpenPopup = winId;
        this.toOpenPopupRect = { x, y, width, height };

        let popup = window.open(
            `//${window.location.host}/?windowId=${winId}`,
            '',
            `width=${width},height=${height},left=${x},top${y}`
        );
        // popup.onbeforeunload = () => { this.unload(winId); };
        // window.open("https://google.com", "", "width=500,height=500,top=300,left=3000");
    }

    onCloseWindow() {
        if (this.isAppIsolating && this.externalUrlToOpen.length > 0) {
            this.shouldCleanupWindow = true;
            return;
        }
        window.close();
    }

    onSetTouchHandleVisibility(id, visible) {
        var element = document.getElementById(`touchhandle${id}`);
        if (element) element.style.display = visible == 1 ? 'block' : 'none';
    }

    onSetTouchHandleOpacity(id, opacity) {
        // console.log("onSetTouchHandleOpacity", orientation, opacity)
        //maybe later?
    }

    onSetTouchHandleBounds(id, x, y, width, height) {
        var element = document.getElementById(`touchhandle${id}`);
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
    }

    onSetTouchHandleOrientation(id, orientation) {
        var element = document.getElementById(`touchhandle${id}`);
        var imgTag = element.firstElementChild;
        imgTag.src = `/img/jimber/text_selection_handle_${orientation}.png`;
    }

    onShowSelectionMenu(cut, copy, paste, selectionX, selectionY, selectionWidth, selectionHeight) {
        this.showSelectionMenu = true;
        cut = parseInt(cut);
        copy = parseInt(copy);
        paste = parseInt(paste);

        var buttonCount = cut + copy + paste;
        if (buttonCount == 0) return;

        selectionX = parseInt(selectionX);
        selectionY = parseInt(selectionY);
        selectionWidth = parseInt(selectionWidth);
        selectionHeight = parseInt(selectionHeight);

        var cutEl = document.getElementById('MOBILECANCUT');
        var copyEl = document.getElementById('MOBILECANCOPY');
        var pasteEl = document.getElementById('MOBILECANPASTE');
        cutEl.style.display = cut == 1 ? 'flex' : 'none';
        copyEl.style.display = copy == 1 ? 'flex' : 'none';
        pasteEl.style.display = paste == 1 ? 'flex' : 'none';

        var spacingBetweenButtons = 2;

        var minButtonWidth = 63;
        var minButtonHeight = 38;

        var width = spacingBetweenButtons * (buttonCount + 1) + minButtonWidth * buttonCount;
        var height = minButtonHeight + spacingBetweenButtons;
        var x = (selectionX * 2 + selectionWidth - width) / 2;
        var y = selectionY - height - 2;

        var menu = document.getElementById('touchselectioncontextmenu');
        menu.setAttribute('style', 'display:block !important');
        menu.style.width = `${width}px`;
        menu.style.height = `${height}px`;

        if (y < 0) {
            y = y + height * 2.5;
        }
        if (x < 0) {
            x = 0;
        }

        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
    }

    onHideSelectionMenu() {
        this.showSelectionMenu = false;
        ContextMenuEvents.hideTouchSelectionContextMenu();
    }

    onNotification(title, origin, body, iconBase64) {
        var icon = new Image();
        let src = 'data:image/png;base64,' + iconBase64;
        if (origin.startsWith('http')) {
            origin = origin.split('://')[1];
        }

        body = origin + '\n\n' + body;
        var options = {
            body: body,
            icon: src,
        };
        new Notification(title, options);
    }

    onRequestPermission(url, permission) {
        permissionHandler.onPermissionRequested(url, permission);
    }

    // onAddCookie(cookiestr) {
    //     let cookie = Cookie.fromCookieString(atob(cookiestr));
    //     this.cookieJar.addCookie(cookie);
    // }
    /* events */
    onChangeCursor(cursor) {
        changeCursor(cursor);
    }

    onReplaceHistory(url) {
        if (this.currentUrl === url) return;
        this.currentUrl = url;

        if (this.isProxy) {
            let urlObject = new URL(this.currentUrl);
            if (window.location.hostname == urlObject.hostname) {
                history.replaceState({}, '', urlObject.pathname + urlObject.search); // this.reload();
            } else if (urlObject.hostname.startsWith('www.')) {
                urlObject.hostname = urlObject.hostname.split('www.')[1];
                this.currentUrl = urlObject.toString();
                if (urlObject.hostname == window.location.hostname) {
                    history.replaceState({}, '', urlObject.pathname + urlObject.search);
                } else {
                    window.location.href = urlObject;
                    history.replaceState({}, urlObject.hostnames, urlObject.hostname);
                }
            } else {
                window.location.href = url;
            }

            return;
        } else if (this.isAppIsolating) {
            url = new URL(url);
            history.replaceState({}, url.pathname, url.search);
        } else if (!_aliasBrowsing) {
            history.replaceState({}, undefined, '#' + url);
        }
    }
    onPushHistory(url) {
        if (this.currentUrl === url) return;
        this.currentUrl = url;

        if (this.isProxy) {
            let urlObject = new URL(this.currentUrl);

            if (window.location.hostname == urlObject.hostname) {
                history.pushState({}, '', urlObject.pathname + urlObject.search); // this.reload();
            } else if (urlObject.hostname.startsWith('www.')) {
                urlObject.hostname = urlObject.hostname.split('www.')[1];
                this.currentUrl = urlObject.toString();
                if (urlObject.hostname == window.location.hostname) {
                    history.pushState({}, '', urlObject.pathname + urlObject.search);
                } else {
                    window.location.href = url;
                }
            } else {
                window.location.href = url;
            }

            return;
        } else if (this.isAppIsolating) {
            url = new URL(url);
            history.pushState({}, '', url.pathname + url.search);
        } else if (!_aliasBrowsing) {
            history.pushState({}, undefined, '#' + url);
        }
    }
    onChangeTitle(title) {
        window.document.title = title;
    }
    onChangeIcon(icon) {
        // this.currentFavicon = icon;
        var head = document.head || document.getElementsByTagName('head')[0];
        var link = document.createElement('link'),
            oldLink = document.getElementById('dynamic-favicon');
        link.id = 'dynamic-favicon';
        link.rel = 'shortcut icon';
        link.href = 'data:image/png;base64,' + icon;
        if (oldLink) {
            head.removeChild(oldLink);
        }
        head.appendChild(link);
    }

    onPdf(pdfb64) {
        var linkSource = `data:application/pdf;base64,${pdfb64}`;
        var downloadLink = document.createElement('a');
        var fileName = `${window.document.title}.pdf`;

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }

    onPdfForPrinting(pdfb64) {
        if (isSafari()) {
            alert('Printing dialog is not supported on Safari');
            return;
        }
        printJS({ printable: pdfb64, type: 'pdf', base64: true });
    }

    onOpenTab(url) {
        // window.open(`http://${window.location.host}/#${url}`, '_blank')
    }
    onConfirmDialog(text) {}
    // onDeleteCookie(cookiestr) {
    //     let cookie = Cookie.fromCookieString(atob(cookiestr));
    //     this.cookieJar.delCookie(cookie);
    // }
    onClipboardChange(type, data) {
        this.clipboardData.data = this.b64DecodeUnicode(data, type);
        this.clipboardData.type = type;
        this.clipboardData.hasNewData = type === 'text' || type === 'image';

        if (!!window.safari && this.clipboardData.hasNewData) {
            return;
        }

        this.copyToClipboard(type, data);
    }

    copyToClipboard(type, data) {
        switch (type) {
            case 'text':
                navigator.clipboard.writeText(this.clipboardData.data);
                break;
            case 'image':
                const blob = this.b64toBlob(data, 'image/png');
                navigator.clipboard.write([
                    new ClipboardItem({
                        [blob.type]: blob,
                    }),
                ]);
                break;
        }

        this.clipboardData = {
            updateClipboard: false,
            type: '',
            data: '',
        };
    }

    onSelectionChange(data) {
        this.selectionData = this.b64DecodeUnicode(data, 'text');
    }
    onStart() {
        // let cookies = this.cookieJar.all();
        // var c = new Command();
        // c.setContent(ClientToServerCommand.ADDCOOKIES, [btoa(JSON.stringify(cookies))]);
        // c.send();
    }
    onShowInput() {
        console.log('onShowInput');
        this.inputVisible = true;
        window.dispatchEvent(new CustomEvent('browser-showinput', { test: 'hoi' }));
    }
    onHideInput() {
        console.log('onHideInput');
        this.inputVisible = false;
        window.dispatchEvent(new CustomEvent('browser-hideinput'));
    }
    onShowContextMenu(x, y, editFlags, editable, back, forward, linkUrl, mediaUrl, mediaType) {
        //Set text in clipboard in backend:
        if (!this.isProxy) {
            physicalBrowser.sendClipboard();
        }
        //End

        x = parseInt(x);
        y = parseInt(y);

        this.contextMenu = new ContextMenu(x, y, editFlags, back, forward, linkUrl, mediaUrl, mediaType);

        if (linkUrl) {
            this.contextMenu.createLinkMenu();
            var cm = new Command();
            cm.setContent(ClientToServerCommand.CLIPBOARDUPDATE, ['text', btoa(linkUrl)]);
            cm.send();
        }
        if (mediaUrl) {
            if (mediaType == 1) {
                this.contextMenu.createImageMenu();
            } else if (mediaType == 2) {
                this.contextMenu.createMediaMenu();
            }
        }

        // if (!physicalBrowser.isMobile) {
        if (editable != 0) {
            this.contextMenu.createEditableMenu();
        }

        if (this.contextMenu.empty) {
            this.contextMenu.createPageMenu();
        }
        // }

        if (!this.contextMenu.empty) {
            var menu = document.getElementById('contextmenu');
            menu.setAttribute('style', 'display:block !important');

            let container = document.getElementById('renderer-wrapper');
            let containerWidth = window.isSafari()
                ? container.offsetWidth / window.devicePixelRatio
                : container.offsetWidth;
            let containerHeight = window.isSafari()
                ? container.offsetHeight / window.devicePixelRatio
                : container.offsetHeight;
            let menuWidth = window.isSafari() ? menu.offsetWidth / window.devicePixelRatio : menu.offsetWidth;
            let menuHeight = window.isSafari() ? menu.offsetHeight / window.devicePixelRatio : menu.offsetHeight;
            y += container.offsetTop;

            let overflowX = x + menuWidth - containerWidth;
            let overflowY = y + menuHeight - containerHeight;
            if (overflowX > 0) x = x - overflowX;
            if (overflowY > 0) y = y - overflowY;
            menu.style.left = `${x + 1}px`;
            menu.style.top = `${y}px`;
        } else {
            console.log('empty');
        }
    }

    onAlert(msg) {
        alert(this.b64DecodeUnicode(msg, 'text'));
    }

    onFileUpload(uploadId, multiple, mimeTypes, donotuse, directory) {
        console.log(uploadId, multiple, mimeTypes, donotuse, directory);
        uploadHandler.requestUpload(uploadId, multiple, mimeTypes, false, directory == 1);
    }
    onFileUploadFinished() {
        uploadHandler.uploadIsDone();
    }
    onOpenService(url) {
        // window.open(url, '_target');
        // maybe this breaks stuff but it should be alot cleaner to not open a new tab
        window.open(url, '_self');
    }

    onPong() {
        return;
    }
    onAuthenticationRequest(url) {
        authenticationHandler.newRequest(url);
    }

    onLeaveIsolation(url) {
        this.externalUrlToOpen = url;
    }

    onFullscreenRequest(toggleOn) {
        if (parseInt(toggleOn)) {
            window.document.body.requestFullscreen();
            this.isFullscreen = true;
        } else {
            window.document.exitFullscreen();
            this.isFullscreen = false;
        }
    }

    onAdblockStateChange(state) {
        this.adblockEnabled = state === 'true' ? true : false;
    }

    onAdvertisementRequest(url, filter) {
        this.advertisementWarning.url = url;
        this.advertisementWarning.filter = filter;
    }

    /* Actions */
    changeQuality(quality) {
        var c = new Command();
        c.setContent(ClientToServerCommand.QUALITY, [quality]);
        c.send();
    }
    browse(url) {
        var c = new Command();
        c.setContent(ClientToServerCommand.CHANGEURL, [url]);
        c.send();
    }
    reload() {
        var c = new Command();
        c.setContent(ClientToServerCommand.RELOAD, []);
        c.send();
    }
    backward() {
        console.log('back');
        var c = new Command();
        c.setContent(ClientToServerCommand.BACK, []);
        c.send();
    }
    forward() {
        var c = new Command();
        c.setContent(ClientToServerCommand.FORWARD, []);
        c.send();
    }
    sendAdvertisementResponse(respsonse) {
        var c = new Command();
        c.setContent(ClientToServerCommand.ADVERTISEMENTRESPONSE, [respsonse.accept]);
        c.send();
        this.advertisementWarning.url = null;
    }

    closeWindowById(windowId) {
        var c = new Command();
        c.setContent(ClientToServerCommand.CLOSEWINDOWBYID, [windowId]);
        c.send();
    }
    // end

    getClipboardData() {
        return this.clipboardData;
    }

    b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
    b64DecodeUnicode(str, type) {
        // Going backwards: from bytestream, to percent-encoding, to original string.
        let size = 8;
        if (type === 'text') {
            size = 16;
        }
        if (type === 'image') {
            size = 8;
        }
        return decodeURIComponent(
            atob(str)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(size)).slice(-2);
                })
                .join('')
        );
    }

    /* Command parser */
    commandParser(cmd) {
        let type = cmd[0];
        if (type == 'dom') return;

        if (this.handlers[type] === undefined) {
            return;
        }
        this.handlers[type](...cmd.slice(1));
    }

    onSearchMatches(active, amount) {
        this.searchBox.updateMatch(active, amount);
    }
}

export default VirtualBrowser;
