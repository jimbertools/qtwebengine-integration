import Config from '/config.js';
import Command from '/js/models/Command.js';
import { socketHandler } from '/js/state/SocketHandler.js';
import Touch from '/js/models/Touch.js';
import MouseEvent from '/js/MouseEvent.js';
import SystemTools from '/js/SystemTools.js';
import { virtualBrowser } from '/js/state/VirtualBrowser.js';
import { ClientToServerCommand } from '/js/Proto.js';
import { initUser } from '/js/user.js';
import { uploadHandler } from '/js/state/UploadHandler.js';
import ContextMenuEvents from '/js/virtualbrowser/ContextMenuEvents.js';
import { Device } from '/js/models/Device.js';

// etje ba
import store from './store/store.js';

class PhysicalBrowser {
    constructor() {
        window.ph = this;
        socketHandler.addBrowserReadyHandler(this.setDevicePixelRatio.bind(this));
        socketHandler.addBrowserReadyHandler(this.onStart.bind(this));
        socketHandler.addBrowserReadyHandler(this.startPing.bind(this));
        socketHandler.addBrowserReadyHandler(this.bindIsolationEventListeners.bind(this));
        window.addEventListener('hashchange', this.onHashChange.bind(this));
        window.addEventListener('save', this.onPrintPage, false);
        window.addEventListener('beforeunload', this.beforeunload.bind(this), false);
        window.addEventListener(
            'dragover',
            function (e) {
                e.preventDefault();
            },
            false
        );
        // document.body.ondrop = this.onDrop.bind(this)
        window.addEventListener('keydown', evt => {
            if (evt.keyCode == 27 && document.getElementById('searchbar').style.display == 'block') {
                // escape on open searchbar
                this.hideSearchBar();
            }
            if (
                evt.keyCode == 80 &&
                (evt.ctrlKey || (navigator.platform.toUpperCase().indexOf('MAC') >= 0 && evt.metaKey))
            ) {
                // p and control
                evt.preventDefault();
                var c = new Command();
                c.setContent(ClientToServerCommand.REQUESTPDFFORPRINTING, []);
                c.send();
                return false;
            }
            if (
                (evt.keyCode == 189 || evt.keyCode == 109) &&
                (evt.ctrlKey || (navigator.platform.toUpperCase().indexOf('MAC') >= 0 && evt.metaKey))
            ) {
                //- and control
                evt.preventDefault();
                var c = new Command();
                c.setContent(ClientToServerCommand.CHANGEZOOM, [-0.25]);
                c.send();
                return false;
            }
            if (
                (evt.keyCode == 187 || evt.keyCode == 107) &&
                (evt.ctrlKey || (navigator.platform.toUpperCase().indexOf('MAC') >= 0 && evt.metaKey))
            ) {
                //+ and control
                evt.preventDefault();
                var c = new Command();
                c.setContent(ClientToServerCommand.CHANGEZOOM, [0.25]);
                c.send();
                return false;
            }
        });

        window.print = this.onPrintPage;

        this.downloadsEnabled = this.getParameterByName('downloadsEnabled');
        this.showSearchBar = false;
        this.keysToCancel = ['Tab'];
        this.resizeTimeout;
        this.isMobileTyping = false;
        this.isTouching = false;
        this.isMiddleMouseClicking = false;
        this.lastMiddleMouseClick = { keep: true };
        this.moveInterval = undefined;
        this.resizedByBackend = false;
        this.currentRatio = window.devicePixelRatio;
        this.pageSearchUpwards = false;
        this.lastTouchPosition = { x: 0, y: 0 };

        this.changedRatioStr = `(resolution: ${window.devicePixelRatio}dppx)`;
        this.currentMediaQueryList = window.matchMedia(this.changedRatioStr);
        this.updateDeviceFunc = this.updateDevicePixelRatio.bind(this);
        this.currentMediaQueryList.addListener(this.updateDeviceFunc);
        this.windowCreatedByBackend = false;

        this.device = new Device();
        this.device.detect();
        // document.body.innerHTML = `<pre>${JSON.stringify(this.device, null, 4)}</pre>`;
        // document.body.innerHTML += `<pre>${navigator.vendor}</pre>`;
        // const inputField = document.getElementById("fakeInputForMobile"); // breaks every key not in input field
        // inputField.addEventListener('keydown', this.onKeyDown.bind(this));
        // inputField.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    beforeunload() {
        var c = new Command();
        c.setContent(ClientToServerCommand.WINDOWCLOSED, [this.windowId]);
        c.send();
    }

    // attachRenderer(renderTarget) {
    //     this.renderTargets.push(renderTarget);
    //     this.addEventListeners(renderTarget);
    // }
    clearCanvas() {
        // canvasStreamer.start();
    }
    // unload(windowId) {
    //     if (!windowId) {
    //         windowId = this.windowId
    //     }
    //     var c = new Command();
    //     c.setContent(ClientToServerCommand.POPUPCLOSED, [windowId]);
    //     c.send();
    // }

    getParameterByName(name) {
        let params = new URLSearchParams(location.search);
        return params.get(name);
    }

    updateDevicePixelRatio() {
        this.currentRatio = window.devicePixelRatio;

        this.currentMediaQueryList.removeListener(this.updateDeviceFunc);
        this.changedRatioStr = `(resolution: ${window.devicePixelRatio}dppx)`;
        this.currentMediaQueryList = window.matchMedia(this.changedRatioStr);
        this.currentMediaQueryList.addListener(this.updateDeviceFunc);

        this.setDevicePixelRatio();
    }

    bindIsolationEventListeners() {
        if (virtualBrowser.isAppIsolating) {
            window.addEventListener('popstate', () => {
                var c = new Command();
                c.setContent(ClientToServerCommand.CHANGEURL, [
                    virtualBrowser.isolationDomains[0] + window.location.pathname + window.location.search,
                ]);
                c.send();
            });
        }
    }

    onContextMenu(e) {
        if (e.target.localName == 'input') {
            return;
        }
        e.preventDefault();
    }

    setAdblockEnabled(enabled) {
        var c = new Command();
        c.setContent(ClientToServerCommand.SETADBLOCKENABLED, [enabled]);
        c.send();
    }

    sendBrowse(url) {
        var c = new Command();
        c.setContent(ClientToServerCommand.CHANGEURL, [url]);
        c.send();
    }
    /* Events */
    onHashChange() {
        // if(window.location)

        var sendBrowse = function (url) {
            var c = new Command();
            c.setContent(ClientToServerCommand.CHANGEURL, [url]);
            c.send();
        };

        if (virtualBrowser.isProxy) {
            var url = window.location.href;
            sendBrowse(url);
            return;
        }

        var url = window.location.hash.substr(1);
        if (url === '') {
            url = 'http://www.google.be';
        }
        virtualBrowser.currentUrl = url;

        if (url.charAt(0) == '$') {
            browseToAlias(url.substring(1), sendBrowse);
        } else {
            _aliasBrowsing = false;
            sendBrowse(url);
        }
    }

    onResize(e) {
        if (!this.resizedByBackend) {
            let container = document.getElementById('video-container');
            if (container == null) return; // Race condition with Vue init
            // let width = window.isSafari() ? container.offsetWidth * window.devicePixelRatio : container.offsetWidth;
            let width = container.offsetWidth;
            // let height = window.isSafari() ? container.offsetHeight * window.devicePixelRatio : container.offsetHeight; too much cpu powa
            let height = container.offsetHeight;
            clearTimeout(this.resizeTimeout);
            var c = new Command();
            // console.log(width, height, window.devicePixelRatio);
            c.setContent(ClientToServerCommand.RESIZE, [width, height]);
            c.send();
        }
        this.resizedByBackend = false;
    }

    onRendererResize(width, height) {
        if (!this.resizedByBackend) {
            // width = window.isSafari() ? width / window.devicePixelRatio : width;
            // height = window.isSafari() ? height / window.devicePixelRatio : height;
            clearTimeout(this.resizeTimeout);

            var c = new Command();
            c.setContent(ClientToServerCommand.RESIZE, [width, height]);
            c.send();
        }
        this.resizedByBackend = false;
    }

    onStart() {
        let url = '';
        if (!this.windowCreatedByBackend) {
            if (virtualBrowser.isAppIsolating && location.pathname) {
                url = virtualBrowser.isolationDomains[0] + location.pathname + location.search;
            } else if (virtualBrowser.isProxy) {
                url = window.location.hash.substr(1);
                // url = virtualBrowser.contextMenu.mediaUrl
                // if(url === undefined) url = document.location;
                if (url === '') url = document.location;
                console.log(document.location);
            } else {
                url = window.location.hash.substr(1);
                if (url === '') url = 'google.com';
            }
            var c = new Command();
            c.setContent(ClientToServerCommand.INIT, [this.device.requestMobileVersion, url, !!window.safari]);
            c.send();
        }
    }

    async onKeyDown(evt) {
        evt.preventDefault();
        // this.copyNewDataToClipboard();
        // console.log('PB::keydown!');

        if (
            evt.keyCode == 80 &&
            (evt.ctrlKey || (navigator.platform.toUpperCase().indexOf('MAC') >= 0 && evt.metaKey))
        ) {
            // p and control
            evt.preventDefault();
            var c = new Command();
            c.setContent(ClientToServerCommand.REQUESTPDFFORPRINTING, []);
            c.send();
            return false;
        }
        if (
            evt.keyCode == 70 &&
            (evt.ctrlKey || (navigator.platform.toUpperCase().indexOf('MAC') >= 0 && evt.metaKey))
        ) {
            // f and ctrl or cmd
            return false;
        }

        if (this.keysToCancel.includes(evt.key)) {
            evt.preventDefault();
        }

        // dirty fix for macos clipboard
        if (evt.metaKey && navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
            var c = new Command();
            let code = evt.code;
            let text = evt.key;
            c.setContent(ClientToServerCommand.KEYBOARDEVENT, [code, text, '2', 0x04000000]);
            c.send();
            return false;
        }
        // if (_searching)
        //     return;
        evt = evt || window.event;
        let text = evt.key;
        let code = evt.code;

        if (this.device.type.mobile) {
            return;
            if (text === 'Enter') {
                code = 'Enter';
            }
        }
        if (text === ';') {
            text = 'semicolonneke';
        }

        var c = new Command();
        c.setContent(ClientToServerCommand.KEYBOARDEVENT, [code, text, '2', SystemTools.translateModifiers(evt)]);
        c.send();

        // evt.preventDefault();
    }

    pageSearch(searchCriteria, bool) {
        var c = new Command();
        c.setContent(ClientToServerCommand.PAGESEARCH, [searchCriteria, bool]);
        c.send();
    }

    b64EncodeUnicode(str) {
        // first we use encodeURIComponent to get percent-encoded UTF-8,
        // then we convert the percent encodings into raw bytes which
        // can be fed into btoa.
        return btoa(
            encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
            })
        );
    }

    sendClipboard() {
        return new Promise((resolve, reject) => {
            // We need to do this otherwise the 'paste' command arrives too soon and the clipboard content in the docker is not updated
            if (navigator.userAgent.indexOf('Chrome') !== -1) {
                navigator.permissions.query({ name: 'clipboard-read' }).then(result => {
                    if (result.state !== 'granted' && result.state !== 'prompt') {
                        resolve();
                        return;
                    }
                    this._sendClipboard();
                    resolve();
                });
            } else if (!!window.safari) {
                this._sendClipboard();
                resolve();
            }
        });
    }

    _sendClipboard() {
        navigator.clipboard.read().then(clipboardItem => {
            for (let i = 0; i < clipboardItem.length; i++) {
                if (clipboardItem[i].types[0] === 'text/plain') {
                    clipboardItem[i].getType('text/plain').then(blob => {
                        if (blob == null) return;
                        blob.text().then(text => {
                            var cm = new Command();
                            cm.setContent(ClientToServerCommand.CLIPBOARDUPDATE, ['text', this.b64EncodeUnicode(text)]);
                            cm.send();
                        });
                    });
                } else if (clipboardItem[i].types[0] === 'image/png' || clipboardItem[i].types[1]) {
                    clipboardItem[i].getType('image/png').then(blob => {
                        var fr = new FileReader();
                        fr.onload = function (a) {
                            var cm = new Command();
                            cm.setContent(ClientToServerCommand.CLIPBOARDUPDATE, [
                                'image',
                                a.target.result.split(',')[1],
                            ]);
                            cm.send();
                        }.bind(this);
                        fr.readAsDataURL(blob);
                    });
                }
            }
        });
    }

    onKeyUp(evt) {
        // console.log('PB::onKeyUp!');
        if (!!window.safari) {
            let clipboardData = virtualBrowser.clipboardData;

            if (clipboardData.hasNewData) {
                virtualBrowser.copyToClipboard(clipboardData.type, clipboardData.data);
            }
        }
        let text = evt.key;
        let code = evt.code;
        var c = new Command();
        c.setContent(ClientToServerCommand.KEYBOARDEVENT, [code, text, '1', SystemTools.translateModifiers(evt)]);
        c.send();
    }

    copyNewDataToClipboard() {
        if (!!window.safari) {
            let clipboardData = virtualBrowser.clipboardData;

            if (clipboardData.hasNewData) {
                virtualBrowser.copyToClipboard(clipboardData.type, clipboardData.data);
            }
        }
    }

    onSavePage() {}
    onCopy(e) {
        e.clipboardData.setData('text/plain', virtualBrowser.selectionData);
        e.preventDefault();
    }

    onPaste(ev) {
        for (var items = ev.clipboardData.items || [], i = 0; i < items.length; i++) {
            let item = items[i];
            // We have `sendClipBoard` function, But if a user denies access to their clipboard, at least we can provide some functionality
            if (item.type === 'text/plain') {
                item.getAsString(result => {
                    var cm = new Command();
                    cm.setContent(ClientToServerCommand.CLIPBOARDUPDATE, ['text', this.b64EncodeUnicode(result)]);
                    cm.send();
                });
            } else if (item.type === 'image/png') {
                const f = item.getAsFile();
                if (f) {
                    var g = new FileReader();
                    g.onload = function (a) {
                        var cm = new Command();
                        cm.setContent(ClientToServerCommand.CLIPBOARDUPDATE, ['image', a.target.result.split(',')[1]]);
                        cm.send();
                    }.bind(this);
                    g.readAsDataURL(f);
                }
            }
        }

        if (!!window.safari) {
            ev.preventDefault();
        }
    }

    onDragOver(e) {
        var c = new Command();
        const clientX = e.clientX - e.currentTarget.getBoundingClientRect().left;
        const clientY = e.clientY - e.currentTarget.getBoundingClientRect().top;
        c.setContent(ClientToServerCommand.DRAGOVER, [clientX, clientY]);
        c.send();
    }
    printAsPDF() {
        var c = new Command();
        c.setContent(ClientToServerCommand.PRINT, []);
        c.send();
    }

    onPrintPage(e) {
        e.cancelEvent();
        this.printAsPDF();
    }

    openPopup() {
        return;
        setTimeout(() => {
            if (virtualBrowser.toOpenPopup.length > 0) {
                let winId = virtualBrowser.toOpenPopup;
                // let popup = window.open(`?windowId=${winId}&s=${virtualBrowser.browserSecret}&browserId=${virtualBrowser.browserId}&downloadsEnabled=${virtualBrowser.downloadsEnabled}`, "mywindow", `menubar=0,resizable=0,width=${virtualBrowser.toOpenPopupRect.width},height=${virtualBrowser.toOpenPopupRect.height},top=${virtualBrowser.toOpenPopupRect.y},left=${virtualBrowser.toOpenPopupRect.x}`);
                let popup = window.open(
                    `?windowId=${winId}`,
                    'mywindow',
                    `menubar=0,resizable=0,width=${virtualBrowser.toOpenPopupRect.width},height=${virtualBrowser.toOpenPopupRect.height},top=${virtualBrowser.toOpenPopupRect.y},left=${virtualBrowser.toOpenPopupRect.x}`
                );
                // popup.onbeforeunload = () => { this.unload(winId); };
                virtualBrowser.popupWindow = popup;
                virtualBrowser.toOpenPopup = '';
            }
        }, 250);
    }

    onMouseEvent(event) {
        // event.preventDefault(); // this breaks forward and backwards
        if (this.device.hasVirtualKeyboard()) {
            // We do not support mouse events when the device is a touch device.
            // we assume it is a touch device when the device has a virtual keyboard.
            return;
        }

        if (!this.isHoveringClickable()) {
            this.handleMiddleMouseClick(event);
        }

        if (event.type == 'mousedown') {
            this.openPopup();
        }

        if (this.isMiddleMouseClicking && event.button == 1) return;

        // if (!event.target.ownerDocument) return;

        // workaround for mac control + click
        if (event.metaKey && navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
            var c = new Command();
            const mouseEvent = new MouseEvent(event);
            mouseEvent.modifiers = 0x04000000;
            c.setContent(ClientToServerCommand.MOUSEEVENT, [btoa(JSON.stringify(mouseEvent))]);
            c.send();
            return;
        }
        // console.log('Sending mouse event ', event);
        var c = new Command();
        let mouseEvent = new MouseEvent(event);
        c.setContent(ClientToServerCommand.MOUSEEVENT, [btoa(JSON.stringify(mouseEvent))]);
        c.send();
    }

    stopMiddleMouseScroll() {
        if (this.isMiddleMouseClicking) {
            clearInterval(this.moveInterval);
            document.body.style.cursor = 'default';
            this.isMiddleMouseClicking = false;
        }
    }

    handleMiddleMouseClick(event) {
        if (event.type == 'mousedown') {
            clearInterval(this.moveInterval);
            if (event.button === 1) {
                //middle mouse click
                event.preventDefault();
                if (this.isMiddleMouseClicking) {
                    document.body.style.cursor = 'default';
                    this.isMiddleMouseClicking = false;
                } else {
                    document.body.style.cursor = 'all-scroll';
                    this.isMiddleMouseClicking = true;
                    this.lastMiddleMouseClick = {
                        x: event.clientX,
                        y: event.clientY,
                        keep: true,
                    };
                }
            } else if (this.isMiddleMouseClicking) {
                document.body.style.cursor = 'default';
                this.isMiddleMouseClicking = false;
            }
        }

        if (event.type == 'mouseup') {
            if (event.button === 1) {
                //middle mouse click
                event.preventDefault();
                clearInterval(this.moveInterval);
                if (!this.lastMiddleMouseClick.keep) {
                    document.body.style.cursor = 'default';
                    this.isMiddleMouseClicking = false;
                    this.lastMiddleMouseClick.keep = true;
                }
            }
        }

        if (event.type == 'mousemove') {
            clearInterval(this.moveInterval);
            if (this.isMiddleMouseClicking) {
                if (event.movementX != 0 || event.movementY != 0) {
                    var moveFromOriginX = this.lastMiddleMouseClick.x - event.clientX;
                    var moveFromOriginY = this.lastMiddleMouseClick.y - event.clientY;
                    if (moveFromOriginY > 0) {
                        document.body.style.cursor = 'ne-resize';
                    } else if (moveFromOriginY < 0) {
                        document.body.style.cursor = 'sw-resize';
                    }
                    if (-25 < moveFromOriginY && moveFromOriginY < 25) {
                        document.body.style.cursor = 'all-scroll';
                        return;
                    }

                    this.moveInterval = setInterval(() => {
                        var c = new Command();
                        c.setContent(ClientToServerCommand.MOUSEWHEELEVENT, [
                            0,
                            0,
                            0,
                            0,
                            -moveFromOriginX / 7,
                            -moveFromOriginY / 7,
                            0,
                        ]);
                        c.send();
                    }, 1);
                    this.lastMiddleMouseClick.keep = false;
                }
            }
        }
    }

    onWheelEvent(event) {
        // event.preventDefault();
        this.stopMiddleMouseScroll();

        ContextMenuEvents.hideContextMenu();

        var c = new Command();
        var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        var deltaX = event.deltaX;
        var deltaY = event.deltaY;

        if (isFirefox) {
            deltaX = deltaX * 15;
            deltaY = deltaY * 15;
        }

        c.setContent(ClientToServerCommand.MOUSEWHEELEVENT, [
            event.layerX,
            event.layerY,
            event.clientX,
            event.clientY,
            deltaX,
            deltaY,
            SystemTools.translateModifiers(event),
        ]);
        c.send();
    }

    onTouch(event) {
        if (event.type === 'touchstart') {
            this.onFocusIn();
            ContextMenuEvents.hideContextMenu();
        }
        var object = {};
        object['type'] = 'touch';
        object['name'] = name;
        object['time'] = new Date().getTime();
        object['event'] = event.type;
        object['changedTouches'] = [];
        object['stationaryTouches'] = [];

        this.openPopup();

        for (var i = 0; i < event.changedTouches.length; ++i) {
            const targetTouch = event.changedTouches[i];
            const offsetTop = targetTouch.target.getBoundingClientRect().top;
            const offsetLeft = targetTouch.target.getBoundingClientRect().left;
            const touch = new Touch(targetTouch, offsetTop, offsetLeft);
            touch.clientY = targetTouch.clientY - offsetTop;
            touch.pageY = targetTouch.pageY - offsetTop;
            object.changedTouches.push(touch);
            this.lastTouchPosition.x = targetTouch.screenX;
            this.lastTouchPosition.y = targetTouch.screenY;
        }

        for (var i = 0; i < event.targetTouches.length; ++i) {
            var targetTouch = event.targetTouches[i];
            if (
                object.changedTouches.findIndex(function (touch) {
                    // cancelEvent(event);
                    return touch.identifier === targetTouch.identifier;
                }) === -1
            ) {
                object.stationaryTouches.push(touch);
            }
        }
        var c = new Command();
        c.setContent(ClientToServerCommand.TOUCHEVENT, [btoa(JSON.stringify(object))]);
        c.send();
        event.preventDefault();
        // cancelEvent(event);
    }

    onInputBlur(event) {
        if (event.relatedTarget) {
            event.relatedTarget.onblur = () => {
                this.fakeMobileInput.focus(); // hehehe
            };
            return;
        }
        if (virtualBrowser.inputVisible) {
            event.stopImmediatePropagation();
            event.preventDefault();
            this.fakeMobileInput.focus();
        }
    }

    onMobileInputV2(data) {
        var c = new Command();
        c.setContent(ClientToServerCommand.KEYBOARDEVENT, [data.code, data.text, '0', 0]);
        c.send();
    }

    onCompositionUpdate(data) {
        var c = new Command();
        c.setContent(ClientToServerCommand.COMPOSITIONUPDATE, [data]);
        c.send();
    }

    onCompositionEnd(data) {
        var c = new Command();
        c.setContent(ClientToServerCommand.COMPOSITIONEND, [data]);
        c.send();
    }

    async onDrop(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        uploadHandler.requestUpload(this.uuidv4(), files.length, '', true);
        const c = new Command();
        c.setContent(ClientToServerCommand.DRAGANDDROPFILEUPLOADSTART, [
            uploadHandler.upload.id,
            event.offsetX,
            event.offsetY,
        ]);
        c.send();

        uploadHandler.uploadFiles2(event, { x: event.offsetX, y: event.offsetY });
    }

    onFocusIn(e) {
        console.log('focus in!');
        var c = new Command();
        c.setContent(ClientToServerCommand.FOCUSEVENT, ['in']);
        c.send();
    }

    onBlur(e) {
        if (this.isMiddleMouseClicking) {
            this.stopMiddleMouseScroll();
        }
        var c = new Command();
        c.setContent(ClientToServerCommand.FOCUSEVENT, ['out']);
        c.send();
    }

    /* Actions */
    // removeWindowIdParam() {
    //     if (this.getParameterByName("windowId")) {
    //         window.history.pushState({}, "", "/")
    //     } else {
    //         this.onHashChange()//trick to make remote browse to initial
    //     }
    // }

    startPing() {
        if (this.pingInterval !== undefined) {
            return;
        }
        this.pingInterval = setInterval(function () {
            var c = new Command();
            c.setContent(ClientToServerCommand.PING, []);
            c.send();
        }, 10000);
    }

    setDevicePixelRatio() {
        return;
        // if(this.isMobile) return;
        // var container = document.getElementById("video-container");
        // container.style.zoom = 1/this.currentRatio;
        // let c = new Command();
        // c.setContent(ClientToServerCommand.DEVICEPIXELRATIO, [window.devicePixelRatio]);
        // c.send();
    }

    notifyRendererSwitch(renderer) {
        // var c = new Command();
        // c.setContent(ClientToServerCommand.NOTIFYRENDERERSWITCH, [renderer]);
        // c.send();
    }

    initConnection() {
        if (Config.ENVIRONMENT === 'dev') {
            let config = { downloadsEnabled: true, userId: 'developer' };
            // let wsUrl = `${Config.BROKER_HOST_WS}?winId=${this.windowId}`;
            // let wsUrl = `ws://${window.location.hostname}:9001`;
            let wsUrl = '';
            if (window.location.host === 'mathias_code-8080.jimbertesting.be') {
                wsUrl = `wss://mathias_code-9001.jimbertesting.be`;
            } else if (window.location.host === 'jellesshserver-9002.jimbertesting.be') {
                wsUrl = `wss://jellesshserver-9001.jimbertesting.be`;
            } else if (window.location.host === 'alexsshserver-8000.jimbertesting.be') {
                wsUrl = `wss://alexsshserver-9001.jimbertesting.be`;
                // wsUrl = `wss://alexsshserver-ptrace-9001.jimbertesting.be`;
            } else if (window.location.host === 'alexsshserverroot-8000.jimbertesting.be') {
                wsUrl = `wss://alexsshserverroot-9001.jimbertesting.be`;
                // wsUrl = `wss://alexsshserver-ptrace-9001.jimbertesting.be`;
            } else if (window.location.host === 'dev.jimbertesting.be') {
                wsUrl = `wss://dev.jimbertesting.be/ws`;
            } else if (
                window.location.host === 'dev-isolation.jimbertesting.be' ||
                window.location.host === 'alex.jimbertesting.be'
            ) {
                wsUrl = `wss://${window.location.host}/ws`;
                config.isolation = 'vault.jimbertesting.be;auth.jimbertesting.be';
                // config.isolation = 'google.com';
            } else if (window.location.host === 'dev-spawner.jimbertesting.be:8443') {
                //todo
                //     this.getContainer().then(container => {
                //         console.log(container);
                //         let wsUrl = `${Config.BROKER_HOST_WS}/${container.userId}/browser`;
                //         this.setBrowserPropertiesAndConnect(container, wsUrl);
                //     });
                //     return;
            } else if (window.location.host === 'dev-spawner-isolation.jimbertesting.be:8443') {
                //todo
            } else {
                console.log('no valid host found');
                return;
            }

            //else if (window.location.host === 'dev-isolation.jimbertesting.be:8443') {
            // }

            this.setBrowserPropertiesAndConnect(config, wsUrl);
        } else {
            this.getContainer().then(container => {
                let wsUrl = `${Config.BROKER_HOST_WS}/${container.userId}/browser`;
                // let windowId = this.getParameterByName('windowId');
                // if (windowId) {
                //     wsUrl += `?winId=${windowId}`;
                //     window.history.pushState({}, '', '/');
                //     this.windowCreatedByBackend = true;
                // } else {
                //     // socketHandler.addBrowserReadyHandler(this.onHashChange) // trick to make backend browse
                // }
                // if (container.isolation) {
                //     virtualBrowser.isAppIsolating = true;
                //     virtualBrowser.isolationDomains = container.isolation.split(';');
                // }
                // if (container.isProxy) {
                //     virtualBrowser.isProxy = true;
                // }
                // virtualBrowser.domRenderingDisabled = container.domRenderingDisabled == 'true';
                // let wsUrl = `${Config.BROKER_HOST_WS}/${container.userId}/browser`;
                this.setBrowserPropertiesAndConnect(container, wsUrl);

                // virtualBrowser.downloadsEnabled = container.downloadsEnabled;
                // virtualBrowser.userId = container.userId;
                console.log(container);
            });
        }
    }

    isHoveringClickable() {
        return document.body.style.cursor == 'pointer';
    }

    setBrowserPropertiesAndConnect(container, wsUrl) {
        if (container.isolation) {
            virtualBrowser.isAppIsolating = true;
            virtualBrowser.isolationDomains = container.isolation.split(';');
        }
        if (container.isProxy) {
            virtualBrowser.isProxy = true;
        }
        virtualBrowser.domRenderingDisabled = container.domRenderingDisabled == 'true';
        store.state.domRenderingDisabled = virtualBrowser.domRenderingDisabled;

        virtualBrowser.downloadsEnabled = container.downloadsEnabled;
        virtualBrowser.userId = container.userId;
        virtualBrowser.adblockEnabled = container.adblockEnabled;

        let windowId = this.getParameterByName('windowId');
        if (windowId) {
            wsUrl += `?winId=${windowId}`;
            window.history.pushState({}, '', '/');
            this.windowCreatedByBackend = true;
        }
        socketHandler.init(wsUrl);
        store.state.pageRefreshTrigger++;
    }

    appendWindowIdToUrl(wsUrl) {}

    uuidv4() {
        const a = crypto.getRandomValues(new Uint16Array(8));
        let i = 0;
        return '00-0-4-1-000'.replace(/[^-]/g, s => ((a[i++] + s * 0x10000) >> s).toString(16).padStart(4, '0'));
    }

    getContainer() {
        return new Promise((resolve, reject) => {
            const userId = initUser();
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            let adBlockEnabled = localStorage.getItem('adblockEnabled');

            if (adBlockEnabled === null) {
                localStorage.setItem('adblockEnabled', true);
                adBlockEnabled = true;
            } else {
                adBlockEnabled === 'true' ? true : false;
            }
            virtualBrowser.adblockEnabled = adBlockEnabled;

            const data = {
                userId,
                timezone,
                adblockEnabled: adBlockEnabled,
            };
            var xhr = new XMLHttpRequest();
            xhr.open('POST', `//${Config.BROKER_HOST}/container`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = () => {
                try {
                    if (xhr.readyState == 4) {
                        resolve(JSON.parse(xhr.response));
                        //breaks on cache
                    }
                } catch {
                    console.log('try deleting service worker');
                    navigator.serviceWorker.getRegistrations().then(function (registrations) {
                        for (let registration of registrations) {
                            registration.unregister();
                        }
                    });
                    location.reload();
                }
            };

            xhr.send(JSON.stringify(data));
        });
    }
}

export default PhysicalBrowser;
