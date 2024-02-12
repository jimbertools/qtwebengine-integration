import { physicalBrowser } from '../state/PhysicalBrowser.js';
import { socketHandler } from '../state/SocketHandler.js';
import { mseHandler } from '../state/MSEHandler.js';
import Player from '/js/video/Player.js';
import { drawImageOnCanvasPixar, clearCanvas } from '/js/renderers/dom/canvas/CanvasFunctions.js';
import KeyboardHandler from '/js/handlers/KeyboardHandler.js';

let pendingCssImages = {};
let cachedImages = {};
let cachedCSS = [];
let cachedCssRules = {};
let cachedFontFaces = {};
let fontFaces = {};
let iframes = [];
let mainDocNodeId = 0;
let nodes = [];
let separator = new Uint8Array([0, 0, 0, 1]);
let domReadyQueue = [];
let count = 0;
window.nodes = nodes;

let stuffsize = 0;
export class DomHandler {
    constructor() {
        window.nodes = nodes;
        socketHandler.addBinaryMessageHandler(ev => this.parseCommand(ev));

        this.handlers = {};

        this.NodeType;
        this.domCommandProto;

        this.isCurrentRenderer = false;

        this.lastFocusedElement = null;

        //
        this.renderFrame = null;

        protobuf.load('/js/protobuf/domcommands.proto', (err, root) => {
            if (err) throw err;

            this.AnchorType = root.lookup('jimber.AnchorType').values;
            this.NodeType = root.lookup('jimber.NodeType').values;
            this.CommandType = root.lookup('jimber.CommandType').values;
            this.mediaElementAction = root.lookup('jimber.MediaElementAction').values;
            this.mediaSourceAction = root.lookup('jimber.MediaSourceAction').values;

            this.domCommandProto = root.lookupType('jimber.CommandQueue');

            // prettier-ignore
            {
                this.handlers[this.CommandType.CREATENODE] = ev => this.createNodeCommandCallback(ev.createNodeCommand);
                this.handlers[this.CommandType.DELETENODE] = ev => this.deleteNodeCommandCallback(ev.deleteNodeCommand);
                this.handlers[this.CommandType.DOM] = ev => this.domCommandCallback(ev.domCommand);
                this.handlers[this.CommandType.CSS] = ev => this.cssCommandCallback(ev.cssCommand);
                this.handlers[this.CommandType.IMAGE] = ev => this.imageCommandCallback(ev.imageCommand);
                this.handlers[this.CommandType.APPENDCHILD] = ev => this.appendChildCommandCallback(ev.appendChildCommand);
                this.handlers[this.CommandType.REPLACECHILD] = ev => this.replaceChildCommandCallback(ev.replaceChildCommand);
                this.handlers[this.CommandType.INSERTCHILD] = ev => this.insertBeforeCommandCallback(ev.insertBeforeCommand);
                this.handlers[this.CommandType.REMOVECHILD] = ev => this.removeChildCommandCallback(ev.removeChildCommand);

                this.handlers[this.CommandType.CSSTEXTUPDATE] = ev => this.cssTextUpdateCommandCallback(ev.cssTextUpdateCommand);
                this.handlers[this.CommandType.CSSPROPERTYUPDATE] = ev => this.cssPropertyUpdateCommandCallback(ev.cssPropertyUpdateCommand);
                this.handlers[this.CommandType.ATTRIBUTECHANGED] = ev => this.attributeChangedCommandCallback(ev.attributeChangedCommand);
                this.handlers[this.CommandType.SETCHARACTERDATA] = ev => this.setCharacterDataCommandCallback(ev.setCharacterDataCommand);
                this.handlers[this.CommandType.INSERTCSSRULE] = ev => this.insertCssRuleCommandCallback(ev.insertCssRuleCommand);
                this.handlers[this.CommandType.DELETECSSRULE] = ev => this.deleteCssRuleCommandCallback(ev.deleteCssRuleCommand);

                this.handlers[this.CommandType.SETSCROLL] = ev => this.setScrollCommandCallback(ev.setScrollCommand);
                this.handlers[this.CommandType.SETFOCUS] = ev => this.setFocusCommandCallback(ev.setFocusCommand);
                this.handlers[this.CommandType.INSERTTEXTINTONODE] = ev => this.insertTextIntoNodeCommandCallback(ev.insertTextIntoNodeCommand);
                this.handlers[this.CommandType.DELETETEXTFROMNODE] = ev => this.deleteTextFromNodeCommandCallback(ev.deleteTextFromNodeCommand);
                this.handlers[this.CommandType.REPLACETEXTINNODE] = ev => this.replaceTextInNodeCommandCallback(ev.replaceTextInNodeCommand);
                this.handlers[this.CommandType.SETINPUTSELECTION] = ev => this.setInputSelectionCommandCallback(ev.setInputSelectionCommand);
                this.handlers[this.CommandType.SETVALUE] = ev => this.setValueCommandCallback(ev.setValueCommand);
                this.handlers[this.CommandType.SETSELECTION] = ev => this.setSelectionCommandCallback(ev.setSelectionCommand);
                this.handlers[this.CommandType.SETHOVERED] = ev => this.setHoveredCommandCallback(ev.setHoveredCommand);
                this.handlers[this.CommandType.ATTACHSHADOW] = ev => this.attachShadowCommandCallback(ev.attachShadowCommand);
                this.handlers[this.CommandType.CREATEFONTFACE] = ev => this.createFontFaceCommandCallback(ev.createFontFaceCommand);
                this.handlers[this.CommandType.CREATEFONTFACEFROMJS] = ev => this.createFontFaceFromJSCommandCallback(ev.createFontFaceFromJSCommand);
                this.handlers[this.CommandType.SETHTMLIMAGEFORELEMENT] = ev => this.setHtmlImageForElementCommandCallback(ev.setHtmlImageForElementCommand);
                this.handlers[this.CommandType.SETCSSIMAGE] = ev => this.setCssImageCommandCallback(ev.setCssImageCommand);
                this.handlers[this.CommandType.REPLACECUSTOMFONT] = ev => this.replaceCustomFontCommandCallback(ev.replaceCustomFontCommand);
                this.handlers[this.CommandType.REMOVEATTRIBUTE] = ev => this.removeAttributeCommandCallback(ev.removeAttributeCommand);
                this.handlers[this.CommandType.CREATECONSTRUCTEDSTYLESHEET] = ev => this.createConstructedStyleSheetCommandCallback(ev.createConstructedStyleSheetCommand);
                this.handlers[this.CommandType.SETADOPTEDSTYLESHEETS] = ev => this.setAdoptedStyleSheetsCommandCallback(ev.setAdoptedStyleSheetsCommand);
                this.handlers[this.CommandType.CSSSTYLESHEETREPLACE] = ev => this.CSSStyleSheetReplaceCommandCallback(ev.CSSStyleSheetReplaceCommand);
                this.handlers[this.CommandType.CLEARDOCUMENT] = ev => this.clearDocumentCommandCallback(ev.clearDocumentCommand);
                this.handlers[this.CommandType.SETCHECKED] = ev => this.setCheckedCommandCallback(ev.setCheckedCommand);
                this.handlers[this.CommandType.OPENSELECTIONMENU] = ev => this.openSelectionMenuCommandCallback(ev.openSelectionMenuCommand);
                this.handlers[this.CommandType.CLOSESELECTIONMENU] = ev => this.closeSelectionMenuCommandCallback(ev.closeSelectionMenuCommand);
                this.handlers[this.CommandType.SETSELECTEDOPTION] = ev => this.setSelectedOptionCommandCallback(ev.setSelectedOptionCommand);

                this.handlers[this.CommandType.MEDIASOURCEACTION] = ev => this.mediaSourceActionCallback(ev.mediaSourceActionCommand);
                this.handlers[this.CommandType.ADDSOURCEBUFFER] = ev => this.addSourceBufferCallback(ev.addSourceBufferCommand);
                this.handlers[this.CommandType.APPENDDATATOSOURCEBUFFER] = ev => this.appendDataToSourceBufferCallback(ev.appendDataToSourceBufferCommand);
                this.handlers[this.CommandType.ATTACHMEDIASOURCETOELEMENT] = ev => this.attachMediaSourceToElementCallback(ev.attachMediaSourceToElementCommand);
                this.handlers[this.CommandType.MEDIAELEMENTACTION] = ev => this.mediaElementActionCallback(ev.mediaElementActionCommand);
                this.handlers[this.CommandType.RESETSOURCEBUFFERPARSER] = ev => this.resetSourceBufferParserCallback(ev.resetSourceBufferParserCommand);

                this.handlers[this.CommandType.CANVASVIDEODATA] = ev => this.canvasVideoDataCommandCallback(ev.canvasVideoDataCommand);
                this.handlers[this.CommandType.CANVASIMAGEDATA] = ev => this.canvasImageDataCommandCallback(ev.canvasImageDataCommand);
                this.handlers[this.CommandType.CLEARCANVAS] = ev => this.clearCanvasCommandCallback(ev.clearCanvasCommand);

                this.handlers[this.CommandType.IMAGEWITHBLOBURL] = ev => this.imageWithBlobUrlcommand(ev.imageWithBlobUrlcommand);
                this.handlers[this.CommandType.FULLSCREENREQUEST] = ev => this.fullScreenRequestCommandCallback(ev.fullScreenRequestCommand);
                this.handlers[this.CommandType.ATTACHFONTFACETODOCUMENT] = ev => this.attachFontFaceToDocumentCallback(ev.attachFontFaceToDocument);


            }
        });
    }

    clearAll() {
        let domHtml = document.getElementById('dom').querySelector('html');
        if (domHtml) {
            domHtml.remove();
        }
    }

    clearDocumentCommandCallback(command) {
        let doc = nodes[command.nodeId];
        if (!doc) return;

        if (doc.bodyFragment) {
            for (let i = 0; i < doc.bodyFragment.children.length; i++) {
                const element = doc.bodyFragment.children[i];
                if (!element.hasAttribute('j-injected-fontface')) element.remove();
            }
        }

        if (!doc.node) return;

        if (doc.node.nodeType == Node.DOCUMENT_NODE || doc.node.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            for (let i = 0; i < doc.node.children.length; i++) {
                const element = doc.node.children[i];
                element.remove();
            }
        }
    }

    setCheckedCommandCallback(command) {
        let element = nodes[command.nodeId].node;
        element.checked = command.checked;
    }

    openSelectionMenuCommandCallback(command) {
        if (!this.isCurrentRenderer) return;

        let node = nodes[command.nodeId].node;

        var menu = document.getElementById('selectionmenu');
        menu.setAttribute('style', 'display:block !important');
        menu.style.width = `${command.width}px`;
        menu.style.height = `${command.height}px`;
        menu.style.left = `${command.x}px`;
        menu.style.top = `${command.y}px`;
        let optionlist = document.getElementById('optionlist');

        for (let i = 0; i < command.options.length; i++) {
            const text = command.options[i];
            let htmlOption = document.createElement('li');
            htmlOption.className = 'selectoption';
            htmlOption.value = i;
            htmlOption.innerText = text;
            optionlist.appendChild(htmlOption);
        }

        optionlist.children[node.selectedIndex].scrollIntoView(false);
    }

    closeSelectionMenuCommandCallback(command) {
        document.getElementById('optionlist').scrollTo(0, 0);

        var menu = document.getElementById('selectionmenu');
        optionlist.innerHTML = '';
        menu.setAttribute('style', 'display:hidden !important');
    }

    setSelectedOptionCommandCallback(command) {
        let node = nodes[command.nodeId].node;
        node.selectedIndex = command.selectOptionIndex;
    }

    addSeparator(buffer) {
        var tmp = new Uint8Array(4 + buffer.byteLength);
        // var tmp = new Uint8Array(4 + 1474560)
        tmp.set(separator, 0);
        tmp.set(buffer, 4);
        return tmp.buffer;
    }

    canvasVideoDataCommandCallback(command) {
        console.log('canvasVideoDataCommandCallback', canvas);
        let player = nodes[command.nodeId].player;
        const canvas = nodes[command.nodeId].node;
        if (!player) {
            player = new Player({
                useWorker: false,
                webgl: true,
                size: { width: command.width, height: command.height },
                targetCanvas: canvas,
            });

            nodes[command.nodeId].player = player;
        }

        player.realWidth = command.width; //realWidth and realHeight are used to clip the videocanvas size to the real sizes. Otherwise small canvases would have black padding on the sides.
        player.realHeight = command.height;

        player.decode(command.data);
    }

    canvasImageDataCommandCallback(command) {
        // console.log("[Domhandler::canvasImageDataCommandCallback]")
        let canvas = nodes[command.nodeId].node;
        // console.log(canvas.context)
        // if (!canvas.pintar) {

        //     if (nodes[command.nodeId].player) {
        //         console.log("already had a player!")
        //     }
        //     console.log('creating pintar for', canvas);
        //     canvas.pintar = new PintarJS(canvas);
        //     console.log(canvas.pintar)
        // }
        // drawImageOnCanvasPixar(canvas, command.data, { width: command.width, height: command.height });

        let context = canvas.getContext('2d');
        let blob = new Blob([command.data], { type: 'image/png' } /* (1) */);
        let url = URL.createObjectURL(blob);

        var img = new Image();
        img.onload = function () {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
        };

        img.src = url;
    }

    clearCanvasCommandCallback(command) {
        let canvas = nodes[command.nodeId].node;
        if (!canvas.pintar) {
            canvas.pintar = new PintarJS(canvas);
        }
        clearCanvas(canvas);
    }

    createNodeCommandCallback(command) {
        // nodes[command.nodeId] = null;
        // console.log('node', command.nodeId);
        if (!nodes[command.nodeId]) {
            nodes[command.nodeId] = {};
        }
        if (command.nodeType == this.NodeType.DOCUMENT) {
            nodes[command.nodeId].mediaSourceCommandQueue = [];
            nodes[command.nodeId].node = document.createDocumentFragment();
            nodes[command.nodeId].bodyFragment = document.createDocumentFragment();
            if (command.localOwnerId) {
                // Document in iframe
                nodes[command.localOwnerId].documentChild = command.nodeId;
                nodes[command.nodeId].localOwnerId = command.localOwnerId;

                let iframeElement = nodes[command.localOwnerId];
                if (iframeElement.loaded) {
                    nodes[command.nodeId].node = iframeElement.node.contentDocument;
                    delete nodes[command.nodeId].bodyFragment;
                }
                // console.log("localOwner", nodes[command.localOwnerId])
                // nodes[command.nodeId].document = nodes[command.localOwnerId].contentDocument;
                // console.log("Created new document", nodes[command.nodeId].document)
            } else if (command.ownerDocumentNodeId && command.ownerDocumentNodeId != command.nodeId) {
                // CreateHtmlDocument, CreateDocument JS functions
                nodes[command.nodeId].ownerDocumentNodeId = command.ownerDocumentNodeId;
                nodes[command.nodeId].node = document.implementation.createHTMLDocument();
            } else {
                // Main document
                // console.log(document.getElementById("dom"))
                if (document.getElementById('dom')) {
                    nodes[command.nodeId].node = document.getElementById('dom').contentDocument;
                } else {
                    mainDocNodeId = command.nodeId;
                }
            }
            // if (nodes[command.nodeId] && nodes[command.nodeId].node) {
            //     console.log("Seeting listener", nodes[command.nodeId].node)
            //     nodes[command.nodeId].node.onkeydown = ev => {
            //         console.log("onkeydown")
            //         if (ev.code == "KeyR" && ev.ctrlKey) {
            //             return;
            //         }
            //         ev.preventDefault();
            //         // TODO: should we move this?
            //         physicalBrowser.onKeyDown(ev);
            //     };
            //     nodes[command.nodeId].node.onkeyup = ev => {
            //         ev.preventDefault();
            //         physicalBrowser.onKeyUp(ev);
            //     };
            // }
        }
        if (command.nodeType == this.NodeType.TEXT) {
            nodes[command.nodeId].node = document.createTextNode(command.nodeValue);
        }
        if (command.nodeType == this.NodeType.COMMENT) {
            nodes[command.nodeId].node = document.createComment(command.nodeValue);
        }
        if (command.nodeType == this.NodeType.ELEMENT) {
            if (command.nameSpace.length != 0) {
                nodes[command.nodeId].node = document.createElementNS(command.nameSpace, command.nodeName);
                return;
            }

            if (command.nodeName == 'canvas') {
                // nodes[command.nodeId].player = new Player({ useWorker: false, webgl: false, size: { width: 1, height: 1 } });
                // nodes[command.nodeId].node = nodes[command.nodeId].player.canvas;
                nodes[command.nodeId].node = document.createElement('canvas');
                return;
            }

            nodes[command.nodeId].documentId = command.documentNodeId;
            nodes[command.nodeId].node = document.createElement(command.nodeName);

            if(command.nodeName == "html") {
                let link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = "/css/default_browser_style.css";
                nodes[command.nodeId].node.appendChild(link);
            }

            if (command.nodeName == 'iframe' || command.nodeName == 'object') {
                let node = nodes[command.nodeId].node;
                node.addEventListener('load', () => {
                    this.iframeLoaded(command.nodeId);
                });
                // Why did we do this? hmmm....
                // node.src =
                //     '/iframeMsgReceiver.html?d=' +
                //     Math.random()
                //         .toString(36)
                //         .replace(/[^a-z]+/g, '')
                //         .substr(0, 5);
                node.src = '/iframeMsgReceiver.html';
                // node.setAttribute('tabindex', -1);
            }
        }

        if (command.nodeType == this.NodeType.DOCTYPE) {
            nodes[command.nodeId].node = document.implementation.createDocumentType('html', '', '');
        }

        if (command.nodeType == this.NodeType.FRAGMENT) {
            nodes[command.nodeId].node = document.createDocumentFragment();
        }
    }

    mainIframeLoaded() {
        this.addEventListeners(this.renderFrame.contentDocument);

        if (mainDocNodeId == 0) {
            return;
        }

        this.addFragmentsToDocument(mainDocNodeId, this.renderFrame.contentDocument);
    }

    iframeLoaded(nodeId) {
        nodes[nodeId].loaded = true;
        let docChild = nodes[nodeId].documentChild;

        this.addFragmentsToDocument(docChild, nodes[nodeId].node.contentDocument);
        this.addEventListeners(nodes[nodeId].node.contentDocument);
    }

    deleteNodeCommandCallback(command) {
        // return; //if you see this enable it again
        // does this actually work?
        // delete nodes[command.nodeId].node.pintar;
        // delete nodes[command.nodeId].node;
        // console.log('deletenode', command.nodeId);
        delete nodes[command.nodeId];
        return;
        if (!nodes[command.nodeId]) {
            return;
        }
        let node = nodes[command.nodeId].node;
        let parent = node.parentNode;
        if (parent) {
            parent.removeChild(node);
        }
        delete nodes[command.nodeId];
    }

    domCommandCallback(command) {
        let fireDomReadyQueue = false;

        if (nodes[command.nodeId].node.nodeType == Node.DOCUMENT_NODE) {
            // Node is a document instead of a document-fragment, which means the iframe has already loaded
            if (!nodes[command.nodeId].bodyFragment) {
                return;
            }
            let body = nodes[command.nodeId].node.querySelector('body');
            if (body) body.remove();
            if (nodes[command.nodeId].node.firstElementChild) {
                nodes[command.nodeId].node.firstElementChild.appendChild(nodes[command.nodeId].bodyFragment);
                body = nodes[command.nodeId].node.querySelector('body');

                fireDomReadyQueue = true;
            }
            const queue = nodes[command.nodeId].mediaSourceCommandQueue;
            this.handleMediaSourceCommandQueue(queue);
            delete nodes[command.nodeId].bodyFragment;
        } else if (nodes[command.nodeId].localOwnerId && nodes[nodes[command.nodeId].localOwnerId].loaded) {
            // In iframe and it's loaded, but this is a new "browse" on the iframe so a NEW document
            let document = nodes[nodes[command.nodeId].localOwnerId].node.contentDocument;
            nodes[command.nodeId].node = document;
            document.querySelector('body').remove();
            document.firstElementChild.appendChild(nodes[command.nodeId].bodyFragment);
            fireDomReadyQueue = true;
            delete nodes[command.nodeId].bodyFragment;
        } else {
            // We're in an iframe but the iframe has not yet loaded
            nodes[command.nodeId].parsingFinished = true;
        }

        if (fireDomReadyQueue) {
            this.fireDomReadyQueue(command.nodeId);
        }
    }

    fireDomReadyQueue(docId) {
        let functionInfo = domReadyQueue[docId];
        if (!functionInfo) return;
        for (const info of functionInfo) {
            info.func(info.command);
        }

        delete domReadyQueue[docId];
    }

    cssCommandCallback(command) {
        // @johnk this is completly different from before, I made fine wine?
        let linkTag = nodes[command.nodeId].node;
        let css = command.cssText;
        let styleTag = document.createElement('style');
        styleTag.setAttribute('class', 'injected-css');
        styleTag.innerHTML = css;
        linkTag.parentElement.insertBefore(styleTag, linkTag);
    }

    b64toBlob(dataURI) {
        let dataPart = dataURI.split(',')[1];
        var byteString = atob(dataPart);
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);

        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: 'image/jpeg' });
    }

    getElementForQuerySelector(parentArray, querySelector, isTextNode, textNodeIndex, isInShadowTree) {
        let dom = document.querySelector('#dom');
        let element = dom;

        for (let i = 0; i < parentArray.length; i++) {
            if (parentArray[i]) {
                if (element) {
                    if (element.shadowRoot) {
                        element = element.shadowRoot.querySelector(parentArray[i]);
                    } else {
                        element = element.contentWindow.document.querySelector(parentArray[i]);
                    }
                }
            }
        }

        if (querySelector.length > 0) {
            if (element) {
                if (element.shadowRoot) {
                    element = element.shadowRoot.querySelector(querySelector);
                } else {
                    element = element.contentWindow.document.querySelector(querySelector);
                }
            }
        }

        if (isTextNode == '1') {
            if (element.shadowRoot) {
                element = element.shadowRoot.childNodes[textNodeIndex];
            } else {
                element = element.childNodes[textNodeIndex];
            }
        }

        if (element.shadowRoot && querySelector.length == 0 && !isTextNode) {
            element = element.shadowRoot;
        }

        return element;
    }

    hasUnrenderedIframes(iframes) {
        return iframes.filter(iframe => iframe.rendered === false).length > 0;
    }

    initDefaultStyling(parentDocument) {
        let defaultBrowserStyleSheet = new CSSStyleSheet();
        defaultBrowserStyleSheet.replaceSync("@import 'client/css/default_browser_style.css'");
        parentDocument.adoptedStyleSheets = [defaultBrowserStyleSheet];
    }

    createElement(parentArray, protoNode, parent) {
        console.error('create alement used');
        let needsUpdate = false;
        if (
            parentArray &&
            (protoNode.nodeValue == 'IMG' || protoNode.nodeValue == 'STYLE' || (parent && parent.nodeName == 'STYLE'))
        ) {
            needsUpdate = true;
        }

        let htmlElement;

        if (protoNode.nodeType === this.NodeType.ELEMENT) {
            if (protoNode.nameSpace) {
                htmlElement = document.createElementNS(protoNode.nameSpace, protoNode.nodeValue);
            } else {
                htmlElement = document.createElement(protoNode.nodeValue);
            }

            if (protoNode.imageUUID) this.setImageOnElement(htmlElement, protoNode.imageUUID);
            if (protoNode.mediaSourceId) {
                console.trace();
                console.log('Got a node with a mediasourceid', htmlElement, protoNode.mediaSourceId);
                mseHandler.attachMediaSourceToElement(htmlElement, protoNode.mediaSourceId);
            }
            this.setAttributes(htmlElement, protoNode.attributes);
        } else if (protoNode.nodeType === this.NodeType.FRAGMENT) {
            htmlElement = document.createDocumentFragment();
        } else if (protoNode.nodeType === this.NodeType.TEXT) {
            htmlElement = document.createTextNode(protoNode.nodeValue);
        } else if (protoNode.nodeType === this.NodeType.COMMENT) {
            htmlElement = document.createComment(protoNode.nodeValue);
        } else if (protoNode.nodeType === this.NodeType.SHADOW) {
            htmlElement = document.createElement(protoNode.nodeValue);
            // console.log("Creating element ", protoNode.nodeValue)
            htmlElement.attachShadow({ mode: 'open' });
        } else if (protoNode.nodeType === this.NodeType.IFRAME) {
            htmlElement = document.createElement(protoNode.nodeValue);
            this.setAttributes(htmlElement, protoNode.attributes);
            // htmlElement.srcdoc="<!DOCTYPE html><script> let defaultBrowserStyleSheet = new CSSStyleSheet(); fetch('css/default_browser_style.css').then(response => response.text()).then(text => { defaultBrowserStyleSheet.replaceSync(text); document.adoptedStyleSheets = [defaultBrowserStyleSheet]; }); </script>"
        } else if (protoNode.nodeType === this.NodeType.DOCTYPE) {
            return {};
            /* 
            TODO:
             *Mathias coughs*
             We made the decision, to hardcode it for now. We need to support this in the future.
            */
            htmlElement = document.implementation.createDocumentType(element.name, element.publicId, element.systemId);
        }

        if (parent) {
            parent.appendChild(htmlElement);
        }

        if (htmlElement.nodeName === 'IFRAME') {
            // console.log("We detected an iframe, adding injection point, not the children.")

            console.log('Parent to inject iframe content INTO: ', htmlElement);
            console.log('CONTENT: ', protoNode.children);

            // Check if we have children.
            if (protoNode.children.length !== 0) {
                // console.log("We detected an iframe, adding injection point, not the children.")

                // console.log("Parent to inject iframe content INTO: ", htmlElement)
                // console.log("CONTENT: ", protoNode.children)
                iframes.push({
                    iframeElement: htmlElement,
                    iframeChildren: protoNode.children,
                    rendered: false,
                });
            }

            return { htmlElement, needsUpdate };
        }

        if (protoNode.children) {
            protoNode.children.forEach(child => {
                if (child.nodeType === this.NodeType.ELEMENT) {
                    let htmlChild = this.createElement(parentArray, child, htmlElement).htmlElement;

                    if (htmlElement.shadowRoot !== null) {
                        htmlElement.shadowRoot.appendChild(htmlChild);
                    } else {
                        htmlElement.appendChild(htmlChild);
                    }
                }
                if (child.nodeType === this.NodeType.SHADOW) {
                    let htmlChild = this.createElement(parentArray, child, htmlElement).htmlElement;
                    htmlElement.appendChild(htmlChild);
                }
                if (child.nodeType === this.NodeType.IFRAME) {
                    let htmlChild = this.createElement(parentArray, child, htmlElement).htmlElement;
                    htmlElement.appendChild(htmlChild);
                }
                if (child.nodeType === this.NodeType.TEXT) {
                    let text = child.nodeValue;
                    text = text;
                    let textChild = document.createTextNode(text, htmlElement);

                    if (htmlElement.shadowRoot !== null) {
                        htmlElement.shadowRoot.appendChild(textChild);
                    } else {
                        htmlElement.appendChild(textChild);
                    }
                }
                if (child.nodeType === this.NodeType.COMMENT) {
                    let text = child.nodeValue;
                    text = text;
                    let commentChild = document.createComment(text);

                    if (htmlElement.shadowRoot !== null) {
                        htmlElement.shadowRoot.appendChild(commentChild);
                    } else {
                        htmlElement.appendChild(commentChild);
                    }
                }
            });
        }

        if (protoNode.focused) {
            htmlElement.focus();
            console.log('htmlelement forced focus!');
            this.setJSelectionRange(htmlElement, protoNode.selectionStart, protoNode.selectionEnd);
        }

        return { htmlElement, needsUpdate };
    }

    setJSelectionRange(htmlElement, start, end) {
        let oldType = htmlElement.type;
        if (htmlElement.tagName !== 'INPUT' && htmlElement.tagName !== 'TEXTAREA') {
            // contenteditable
            return;
        }
        if (htmlElement.nodeName == 'INPUT') htmlElement.type = 'text';
        htmlElement.setSelectionRange(start, end);
        if (htmlElement.nodeName == 'INPUT') htmlElement.type = oldType;
    }

    setJRangeText(htmlElement, replacement, start, end, mode) {
        let oldType = htmlElement.type;
        if (htmlElement.tagName !== 'INPUT' && htmlElement.tagName !== 'TEXTAREA') {
            // contenteditable
            return;
        }

        if (htmlElement.nodeName == 'INPUT') htmlElement.type = 'text';
        htmlElement.setRangeText(replacement, start, end, mode);
        if (htmlElement.nodeName == 'INPUT') htmlElement.type = oldType;
    }

    setAttributes(htmlElement, attributes) {
        for (let i = 0; i < attributes.length; i++) {
            const attribute = attributes[i];
            htmlElement.setAttribute(attribute.name, attribute.value);
        }
    }

    // Injects the received CSS in our DOM structure.
    injectAllCachedCSS() {
        console.error('injectAllCachedCSS', cachedCSS);
        // let dom = document.getElementById("dom").contentWindow.document;
        for (let i = 0; i < cachedCSS.length; i++) {
            const cssObject = cachedCSS[i];

            let parent = document.querySelector('#dom');
            for (let i = 0; i < cssObject.parentArray.length; i++) {
                if (cssObject.parentArray[i]) {
                    parent = parent.contentWindow.document.querySelector(cssObject.parentArray[i]);
                }
            }

            // let parent = this.getElementForQuerySelector(cssObject.parentArray, "");
            let decodedCSS = cssObject.cssText;
            let style = document.createElement('style');
            let hash = this.hashCode(cssObject.cssText);
            if (parent.contentDocument.querySelector("[data-jcsshash='" + hash + "']") != null) {
                continue;
            }
            style.setAttribute('class', 'injected-css');
            style.setAttribute('data-jcsshash', hash);
            style.innerHTML = decodedCSS;
            parent.contentWindow.document.body.appendChild(style);
        }
    }

    injectAllCachedCssRules(parentArray) {
        console.error('injectAllCachedCssRules', parentArray, cachedCssRules);
        let rules = cachedCssRules[parentArray.toString()];
        for (let ruleIndex in rules) {
            let rule = rules[ruleIndex];
            this.injectCssRule(parentArray, rule.stylesheetIndex, rule.rule, rule.ruleIndex);
        }
    }

    hexToBase64(hexstring) {
        return btoa(
            hexstring
                .match(/\w{2}/g)
                .map(function (a) {
                    return String.fromCharCode(parseInt(a, 16));
                })
                .join('')
        );
    }

    appendChildCommandCallback(command) {
        try {
            let child = nodes[command.childId].node;
            let parent = nodes[command.parentId].node;

            if (child.nodeType == Node.DOCUMENT_TYPE_NODE) {
                return;
            }

            let html = parent.firstElementChild;

            if (
                (child.nodeName == 'HTML' || child.nodeName == 'svg') &&
                html &&
                parent.nodeType == Node.DOCUMENT_NODE
            ) {
                html.remove();
            }

            if (child.nodeName == 'BODY' && nodes[nodes[command.childId].documentId].bodyFragment) {
                parent = nodes[nodes[command.childId].documentId].bodyFragment;
            }

            parent.appendChild(child);
        } catch (e) {
            console.warn(
                e,
                {
                    parent: { id: command.parentId, element: nodes[command.parentId] },
                    child: { id: command.childId, element: nodes[command.childId] },
                },
                'appendChildCommandCallback'
            );
            setTimeout(() => {
                console.log({
                    parent: { id: command.parentId, element: nodes[command.parentId] },
                    child: { id: command.childId, element: nodes[command.childId] },
                });
            }, 2000);
        }
    }

    replaceChildCommandCallback(command) {
        try {
            nodes[command.toReplaceId].node.replaceWith(nodes[command.replaceWithId].node);
        } catch (e) {
            console.warn('replaceChildCommandCallback', nodes[command.replaceWithId].node);
        }
    }

    insertBeforeCommandCallback(command) {
        let parent = nodes[command.parentId];
        let child = nodes[command.newChildId].node;
        let refChild = nodes[command.refChildId].node;

        if (child.nodeType == Node.DOCUMENT_TYPE_NODE && refChild.ownerDocument.doctype) {
            return;
        }
        let html = refChild.ownerDocument.querySelector('html');
        if (child.nodeName == 'HTML' && html) {
            html.remove();
        }

        if (child.nodeName == 'BODY' && nodes[parent.documentId].bodyFragment) {
            parent = nodes[parent.documentId].bodyFragment;
        } else {
            parent = parent.node;
        }

        try {
            if (!parent) {
                parent = nodes[command.refChildId].node.getRootNode().host.shadowRoot;
            }

            parent.insertBefore(child, refChild);
        } catch (e) {
            console.warn({
                error: e,
                command,
                parent: nodes[command.parentId],
                document: nodes[nodes[command.parentId].documentId],
                parent,
                child,
                refChild,
                realParent: refChild.parentNode,
            });
        }
        // if (needsUpdate) {
        //     this.injectAllCachedImages(parentArray);
        // }
    }

    removeChildCommandCallback(command) {
        let toRemove = nodes[command.nodeId]?.node;
        if (!toRemove) {
            console.warn('removeChildCommandCallback: ', command);
            return;
        }

        toRemove.remove();
    }

    cssTextUpdateCommandCallback(command) {
        // console.log("cssTextUpdateCommandCallback")
        let element = nodes[command.nodeId].node;

        if (!element) {
            console.warn('cssTextUpdateCommandCallback: ', command);
            return;
        }

        element.style = command.cssText;
    }

    cssPropertyUpdateCommandCallback(command) {
        let element = nodes[command.nodeId].node;
        // try {

        // if (command.propertyName === "transform") {
        // console.log("cssPropertyUpdateCommandCallback", command.propertyName, command.propertyValue, command.nodeId);
        //         if(command.propertyValue.includes("translate(")) {
        //             console.log("elabatjes")
        //             return;
        //         }
        // }
        // } catch (error) {

        // }

        if (!element) {
            console.warn('cssPropertyUpdateCommandCallback: ', command);
            return;
        }

        element.style.setProperty(command.propertyName, command.propertyValue);
    }

    attributeChangedCommandCallback(command) {
        // console.time('attributeChangedCommandCallback');
        let element = nodes[command.nodeId].node;
        if (!element) {
            console.warn('attributeChangedCommandCallback: ', command);
            return;
        }
        if (command.null) {
            element.removeAttribute(command.attributeName);
            return;
        }
        // console.log(element)
        element.setAttribute(command.attributeName, command.attributeValue);
        // console.timeEnd('attributeChangedCommandCallback');
    }

    setCharacterDataCommandCallback(command) {
        let element = nodes[command.nodeId].node;
        if (!element) {
            console.warn('setCharacterDataCommandCallback: ', command);
            return;
        }

        // let selection = element.ownerDocument.getSelection();
        // let previousRange;
        // let startOffset;
        // let endOffset;
        // let startContainer;
        // let endContainer;
        // if(selection.rangeCount > 0) {
        //     previousRange = element.ownerDocument.getSelection().getRangeAt(0);
        //     startOffset = previousRange.startOffset;
        //     endOffset = previousRange.endOffset;
        //     startContainer = previousRange.startContainer;
        //     endContainer = previousRange.endContainer;
        //     console.log("Got range ", previousRange)
        // }

        // console.log(element, element.parentElement, element.ownerDocument.getSelection())
        element.data = command.data;
        // element.nodeValue = command.data;
        // console.log(element, element.parentElement, element.ownerDocument.getSelection())

        // this.setJRangeText(element.parentElement, command.data, 0, command.length, 'preserve');

        // if(previousRange) {
        //     let range = element.ownerDocument.createRange();
        //     console.log("Setting range ", startContainer, startOffset, endContainer, endOffset)

        //     range.setStart(startContainer, startOffset);
        //     range.setEnd(endContainer, endOffset);

        //     // selection = element.ownerDocument.getSelection();
        //     selection.removeAllRanges();
        //     selection.addRange(range);
        // }

        // console.log(element, element.parentElement, element.ownerDocument.getSelection())
    }

    createConstructedStyleSheetCommandCallback(command) {
        this.sendMessageToIframe(command, 'createConstructedStyleSheetCommand');
    }

    setAdoptedStyleSheetsCommandCallback(command) {
        try {
            if (nodes[command.nodeId].node && nodes[command.nodeId].node.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
                if (nodes[command.nodeId].shadowHostId) {
                    nodes[nodes[command.nodeId].shadowHostId].node.setAttribute(
                        'j-adopted-style-sheet',
                        command.nodeId
                    );
                }
            }
            this.sendMessageToIframe(command, 'setAdoptedStyleSheetsCommand');
        } catch (e) {
            console.warn(e, command, nodes[command.nodeId]);
        }
    }

    CSSStyleSheetReplaceCommandCallback(command) {
        this.sendMessageToIframe(command, 'CSSStyleSheetReplaceCommand');
    }

    sendMessageToIframe(command, type) {
        let nodeObject = nodes[command.nodeId];
        let iframe = document.getElementById('dom');
        if (nodeObject.localOwnerId) {
            iframe = nodes[nodeObject.localOwnerId];
        }
        iframe.contentWindow.postMessage({
            command,
            type,
        });
    }

    insertCssRuleCommandCallback(command) {
        try {
            let element = nodes[command.nodeId].node;
            let sheet;
            if (command.constructedUUID) {
                this.sendMessageToIframe(command, 'insertCssRuleCommand');
                return;
            } else {
                sheet = element.sheet;
            }

            sheet.insertRule(command.rule, command.ruleIndex);
        } catch (e) {
            console.warn(e);
        }
    }

    injectCssRule(parentArray, stylesheetIndex, rule, ruleIndex) {
        this.getElementForQuerySelector(parentArray, '').contentDocument.styleSheets[stylesheetIndex].insertRule(
            rule,
            ruleIndex
        );
    }

    deleteCssRuleCommandCallback(command) {
        let element = nodes[command.nodeId].node;
        let sheet;
        if (command.constructedUUID) {
            this.sendMessageToIframe(command, 'deleteCssRuleCommand');
            return;
        } else {
            sheet = element.sheet;
        }

        sheet.deleteRule(command.ruleIndex);
    }

    setScrollCommandCallback(command) {
        let element = nodes[command.nodeId].node;
        if (!element) {
            console.warn('setScrollCommandCallback: ', command);
            return;
        }

        if (element.nodeName == 'IFRAME') {
            element = element.contentWindow;
        }

        var scrollOptions = {
            left: command.scrollX,
            top: command.scrollY,
        };

        if (element.nodeType != Node.ELEMENT_NODE && element.firstElementChild) {
            element.firstElementChild.scrollTo(scrollOptions);
            return;
        }

        if (!element.isConnected) {
            let docId = nodes[command.nodeId].documentId;
            if (!domReadyQueue[docId]) {
                domReadyQueue[docId] = [];
            }
            domReadyQueue[docId].push({
                func: this.setScrollCommandCallback,
                command,
            });
        }

        element.scrollTo(scrollOptions);
    }

    setFocusCommandCallback(command) {
        let element = nodes[command.nodeId].node;
        if (!element) {
            console.warn('setFocusCommandCallback: ', command);
            return;
        }

        if (command.flag) {
            if (this.isCurrentRenderer) {
                let activeEl = document.activeElement;
                if (activeEl == element) {
                    return;
                }
                if (activeEl) {
                    activeEl.blur();
                }
                if (activeEl != element) {
                    element.focus();
                }
            }
            this.lastFocusedElement = element;
        } else {
            element.blur();
        }
    }

    insertTextIntoNodeCommandCallback(command) {
        let element = nodes[command.nodeId].node;
        if (!element) {
            console.warn('insertTextIntoNodeCommandCallback: ', command);
            return;
        }
        this.setJRangeText(element, command.text, command.offset, command.offset, 'preserve');
    }

    deleteTextFromNodeCommandCallback(command) {
        let element = nodes[command.nodeId].node;
        if (!element) {
            console.warn('deleteTextFromNodeCommandCallback: ', command);
            return;
        }
        this.setJRangeText(element, '', command.offset, command.offset + command.count, 'preserve');
        this.setJSelectionRange(element, command.selectionStart, command.selectionEnd);
    }

    replaceTextInNodeCommandCallback(command) {
        let element = nodes[command.nodeId].node;

        if (!element) {
            console.warn('replaceTextInNodeCommandCallback: ', command);
            return;
        }

        this.setJRangeText(element, command.text, command.offset, command.offset + command.count, 'preserve');
    }

    // only for input fields
    setInputSelectionCommandCallback(command) {
        let element = nodes[command.nodeId].node;

        if (!element) {
            console.warn('setInputSelectionCommandCallback: ', command);
            return;
        }

        this.setJSelectionRange(element, command.start, command.end);
    }

    setValueCommandCallback(command) {
        let element = nodes[command.nodeId].node;
        if (!element) {
            console.warn('setValueCommandCallback: ', command);
            return;
        }

        element.value = command.value;
    }

    setSelectionCommandCallback(command) {
        let startNode = nodes[command.startNodeId] ? nodes[command.startNodeId].node : undefined;
        let endNode = nodes[command.endNodeId] ? nodes[command.endNodeId].node : undefined;

        let ownerDocument = nodes[command.ownerDocumentId].document
            ? nodes[command.ownerDocumentId].document
            : nodes[command.ownerDocumentId].node;
        if (ownerDocument.nodeType != Node.DOCUMENT_NODE) return;
        let range = ownerDocument.createRange();

        if (startNode) {
            switch (command.startType) {
                case this.AnchorType.BeforeAnchor:
                    range.setStartBefore(startNode);
                    break;
                case this.AnchorType.AfterAnchor:
                    range.setStartAfter(startNode);
                    break;
                case this.AnchorType.BeforeChildren:
                case this.AnchorType.AfterChildren:
                case this.AnchorType.OffsetInAnchor:
                    range.setStart(startNode, command.startOffset);
                    break;
                default:
                    break;
            }
        }
        if (endNode) {
            switch (command.endType) {
                case this.AnchorType.BeforeAnchor:
                    range.setEndBefore(endNode);
                    break;
                case this.AnchorType.AfterAnchor:
                    range.setEndAfter(endNode);
                    break;
                case this.AnchorType.BeforeChildren:
                case this.AnchorType.AfterChildren:
                case this.AnchorType.OffsetInAnchor:
                    range.setEnd(endNode, command.endOffset);
                    break;
                default:
                    break;
            }
        }
        // To fix input fields
        // if (startNode === endNode && range.startOffset === range.endOffset) {
        //     return;
        // }

        var selection = ownerDocument.getSelection();

        if (!selection) return;

        selection.removeAllRanges();
        selection.addRange(range);
    }

    setHoveredCommandCallback(command) {
        // console.log("setHoveredCommandCallback", command)
        let element = nodes[command.nodeId].node;

        if (!element) {
            console.warn('setHoveredCommandCallback: ', command);
            return;
        }

        if (command.hovered) {
            element.classList.add('j-fake-hover');
        } else {
            element.classList.remove('j-fake-hover');
        }
    }

    attachShadowCommandCallback(command) {
        let element = nodes[command.nodeId].node;

        if (!element) {
            console.warn('attachShadowCommandCallback: ', command);
            return;
        }

        try {
            nodes[command.shadowId].shadowHostId = command.nodeId;
            nodes[command.shadowId].node = element.attachShadow({ mode: 'open' });
        } catch (e) {
            console.warn('COULDNT ATTACH SHADOWROOT TO', element);
        }
    }

    createFontFaceCommandCallback(command) {
        let weight = command.fontWeight;
        let style = 'normal';
        if (command.fontStyle != 0) {
            style = command.fontStyle == 1 ? 'italic' : 'oblique';
        }

        let stretch;
        switch (command.fontStretch) {
            case 1:
                stretch = 'ultra-condensed';
                break;
            case 2:
                stretch = 'extra-condensed';
                break;
            case 3:
                stretch = 'condensed';
                break;
            case 4:
                stretch = 'semi-condensed';
                break;
            case 5:
                stretch = 'normal';
                break;
            case 6:
                stretch = 'semi-expanded';
                break;
            case 7:
                stretch = 'expanded';
                break;
            case 8:
                stretch = 'extra-expanded';
                break;
            case 9:
                stretch = 'ultra-expanded';
                break;
        }

        let fontFace = {
            nodeId: command.nodeId,
            name: command.fontName,
            // src: `url('https://jimberfonts.jimbertesting.be/fonts/${command.fontFile}')`,
            src: `url('/fonts/${command.fontFile}')`,
            weight,
            stretch,
            style,
        };

        let key = '' + command.nodeId + command.fontName + command.fontWeight + command.fontStretch + command.fontStyle;
        if (!cachedFontFaces[key]) {
            cachedFontFaces[key] = {};
        }
        cachedFontFaces[key].fontFace = fontFace;
        this.injectFont(command.nodeId, key);
    }

    createFontFaceFromJSCommandCallback(command) {
        var fontFace = new FontFace(command.fontFamily, command.source, {
            style: command.fontStyle,
            weight: command.fontWeight,
            stretch: command.fontStretch,
            display: command.fontDisplay,
        });
        fontFaces[command.fontFaceUUID] = fontFace;
    }

    attachFontFaceToDocumentCallback(command) {
        //todo detach/delete

        let parentDocument = nodes[command.nodeId].document
            ? nodes[command.nodeId].document
            : nodes[command.nodeId].node;
        const fontFace = fontFaces[command.fontFaceUUID];

        fontFace.load().then(fontFace => {
            if (parentDocument.fonts) {
                parentDocument.fonts.add(fontFace);
            }
        });
    }

    fontFaceToString(fontFace) {
        return `@font-face {
            font-family: ${fontFace.name};
            src: ${fontFace.src};
            font-weight: ${fontFace.weight};
            font-stretch: ${fontFace.stretch};
            font-style: ${fontFace.style};
        }
        `;
    }

    injectFont(nodeId, key) {
        let parentDocument = nodes[nodeId].document ? nodes[nodeId].document : nodes[nodeId].node;
        if (!parentDocument) return;
        let body = nodes[nodeId].bodyFragment || parentDocument.body;
        if (!body) return;
        let styleTag = cachedFontFaces[key].styleTag;
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.setAttribute('j-injected-fontface', true);
            cachedFontFaces[key].styleTag = styleTag;
        }

        body.appendChild(styleTag);

        let fontFaceString = this.fontFaceToString(cachedFontFaces[key].fontFace);

        styleTag.innerHTML = fontFaceString;
    }

    setHtmlImageForElementCommandCallback(command) {
        let element = nodes[command.nodeId].node;
        if (!element) {
            console.warn('setImageForElementCommandCallback: ', command);
            return;
        }

        this.setImageOnElement(element, command.imageUUID);
    }

    addSourceBufferCallback(command) {
        mseHandler.addSourceBuffer(command.mediaSourceId, command.UUID, command.mediatype, command.codecs);
    }

    appendDataToSourceBufferCallback(command) {
        mseHandler.appendData(command.mediaSourceId, command.UUID, command.data);
    }

    attachMediaSourceToElementCallback(command) {
        let element = nodes[command.nodeId].node;
        let documentId = nodes[command.nodeId].documentId;
        let document = nodes[documentId];
        if (document.bodyFragment) {
            console.warn('element not on dom yet, queueing ...');
            document.mediaSourceCommandQueue.push({ element: element, mediaSourceId: command.mediaSourceId });
            return;
        }
        mseHandler.attachMediaSourceToElement(element, command.mediaSourceId);
    }

    handleMediaSourceCommandQueue(queue) {
        for (let i = 0; i < queue.length; i++) {
            const command = queue[i];
            mseHandler.attachMediaSourceToElement(command.element, command.mediaSourceId);
        }
    }

    mediaSourceActionCallback(command) {
        switch (command.action) {
            case this.mediaSourceAction.CREATE:
                mseHandler.createMediaSource(command.UUID);
                break;
            case this.mediaSourceAction.CLOSE:
                console.log('mediaSourceActionCallback CLOSE');
                mseHandler.closeMediaSource(command.UUID);
                break;
            case this.mediaSourceAction.MARKENDOFSTREAM:
                mseHandler.markEndOfStream(command.UUID);
                break;
            default:
                console.log('unknown action', command.action);
                break;
        }
    }

    mediaElementActionCallback(command) {
        let element = nodes[command.nodeId].node;
        if (!element) {
            console.warn(command.nodeId, 'does not exist yet!');
            return;
        }
        // console.log("mediaElementActionCallback readystate", element.readyState)
        // console.log(element.error, element, element.src)
        if (element.readyState == 0) {
            // console.log("mediaElementActionCallback", "Element not ready")
            // return;
        }
        try {
            switch (command.action) {
                case this.mediaElementAction.PLAY:
                    element.shouldPlay = true;
                    element
                        .play()
                        .then(() => {})
                        .catch(e => {
                            console.warn(e, "couldn't play");
                        });
                    break;
                case this.mediaElementAction.PAUSE:
                    element.shouldPlay = false;
                    element.pause();
                    break;
                case this.mediaElementAction.SETMUTED:
                    element.muted = command.value;
                    break;
                case this.mediaElementAction.SEEK:
                    element.currentTime = command.value;
                    break;
                case this.mediaElementAction.VOLUME:
                    element.volume = command.value;
                    break;
                case this.mediaElementAction.SETPLAYBACKRATE:
                    element.playbackRate = command.value;
                    break;
                case this.mediaElementAction.STOP:
                    // can i do this?
                    console.log('STOP', element);
                    element.pause();
                    break;
                default:
                    console.log('unknown action', command.action);
                    break;
            }
        } catch (e) {
            console.warn('mediaElementActionCallback');
        }
    }
    resetSourceBufferParserCallback(command) {
        mseHandler.resetSourceBufferParser(command.mediaSourceId, command.UUID);
    }

    setCssImageCommandCallback(command) {
        // console.log("setCssImageCommandCallback", command.imageUUID)
        let image = cachedImages[command.imageUUID];
        this.replaceUUIDWithBlobUrl(command.nodeId, command.imageUUID, image.blobUrl);
        // return;
    }

    replaceCustomFontCommandCallback(command) {
        for (const [key, value] of Object.entries(cachedFontFaces)) {
            if (value.fontFace.name == command.fontName && value.fontFace.nodeId == command.nodeId) {
                cachedFontFaces[key].styleTag.remove();
                delete cachedFontFaces[key];
            }
        }
    }

    removeAttributeCommandCallback(command) {
        let element = nodes[command.nodeId].node;
        element.removeAttribute(command.attrName);
    }

    imageWithBlobUrlcommand(command) {
        let element = nodes[command.nodeId].node;
        let imageBlob = new Blob([command.data], { type: command.mimeType });
        element.src = URL.createObjectURL(imageBlob);
    }

    fullScreenRequestCommandCallback(command) {
        // document.body.requestFullscreen();
    }

    replaceUUIDWithBlobUrl(nodeId, uuid, blobUrl) {
        try {
            let parentDocument = nodes[nodeId].document ? nodes[nodeId].document : nodes[nodeId].node;

            // return
            // let parentElement = this.getElementForQuerySelector(parentSelector, "", 0, 0, 0)
            // let parentElement = nodes[command.nodeId]
            // let parentDocument;
            // if (parentElement && parentElement.contentDocument) {
            //     parentDocument = parentElement.contentDocument;
            // } else {
            //     parentDocument = parentElement.shadowRoot;
            // }

            if (!parentDocument) return;
            // We want to attempt to inject in all possible styles. Not only inside .injectedcss
            const styleElements = parentDocument.querySelectorAll('style');
            const styleAttributes = parentDocument.querySelectorAll('*[style]');
            if (!styleElements || !styleAttributes) return;
            let replaced = false;
            if (uuid) {
                for (let i = 0, styleElementsLength = styleElements.length; i < styleElementsLength; i++) {
                    const style = styleElements[i];
                    if (!style || !style.textContent || !style.textContent.includes(uuid)) {
                        continue;
                    }
                    replaced = true;
                    style.textContent = style.textContent.replaceAll(uuid, blobUrl);
                }

                for (let i = 0, styleAttributesLength = styleAttributes.length; i < styleAttributesLength; i++) {
                    const style = styleAttributes[i];
                    let originalStyle = style.getAttribute('style');

                    if (!style || !originalStyle || !originalStyle.includes(uuid)) {
                        continue;
                    }
                    replaced = true;

                    let newStyle = originalStyle.replaceAll(uuid, blobUrl);

                    style.setAttribute('style', newStyle);
                }
                if (!replaced) {
                    pendingCssImages[uuid] = nodeId;
                }
            }
        } catch (error) {}
    }

    setImageOnElement(element, uuid) {
        let image = cachedImages[uuid];
        if (image) {
            let attrName = element.nodeName == 'VIDEO' ? 'poster' : 'src';
            element.setAttribute(attrName, image.blobUrl);
        }
    }

    createHtmlElementFromString(htmlStr) {
        var div = document.createElement('div');
        div.innerHTML = htmlStr;

        return div.firstChild;
    }

    hashCode(str) {
        var hash = 0;
        if (str.length == 0) return hash;
        for (let i = 0; i < str.length; i++) {
            let char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
    focusLastElement() {
        console.log('focusLastElement');
        if (this.lastFocusedElement == document.activeElement) {
            console.log('focusLastElement return');

            return;
        }
        console.log('focusLastElement');

        if (this.lastFocusedElement) {
            // setTimeout(() => {
                this.lastFocusedElement.focus();
            // }, 0);
        }
    }
    // clearCss() {
    //     cssToLoad = [];
    // }

    parseCommand(command) {
        command.data.arrayBuffer().then(arrayBuffer => {
            let binaryDataArray = new Uint8Array(arrayBuffer);
            // dont parse video and audio messages
            if (binaryDataArray[0] === 118 && binaryDataArray[1] === 105) {
                return;
            }
            if (binaryDataArray[0] === 97 && binaryDataArray[1] === 117) {
                return;
            }
            let queue = this.domCommandProto.decode(binaryDataArray);
            for (let i = 0; i < queue.commands.length; i++) {
                const command = queue.commands[i];
                let commandType = command.commandType;
                if (this.handlers[commandType] === undefined) {
                    console.warn("Couldn't find a corresponding handler.", commandType);
                    return;
                }
                if (window.logma) {
                    const cmd = command[Object.keys(command)[1]];
                    console.log(cmd, nodes[cmd.nodeId].node);
                }
                // window.commandCounter[commandType] += 1;
                this.handlers[commandType](command);
            }
        });
    }

    addFragmentsToDocument(nodeId, doc) {
        let fragment = nodes[nodeId].node;
        //Replace fragment with document in the node property, so we start adding everything (except body stuff) directly to the DOM.
        nodes[nodeId].node = doc;
        let document = nodes[nodeId].node;

        //Append fragment nodes to the document (These are nodes that were already appended but the frontend iframe was not loaded)
        document.firstElementChild.remove();
        document.appendChild(fragment);

        // We're in an iframe and the backend has already completed parsing. This means we may add the bodyFragment to the DOM here.
        if (nodes[nodeId].parsingFinished) {
            let body = document.querySelector('body');
            if (body) body.remove();
            document.firstElementChild.appendChild(nodes[nodeId].bodyFragment);
            this.fireDomReadyQueue(nodeId);
            delete nodes[nodeId].bodyFragment;
        }
    }

    addEventListeners(doc) {
        if (doc) {
            // Sometimes this fires twice https://bugs.chromium.org/p/chromium/issues/detail?id=1233995&q=keydown&can=2
            doc.onkeydown = ev => {
                if (ev.code == 'KeyR' && ev.ctrlKey) {
                    return;
                }
                KeyboardHandler.onKeyDown(ev);
            };
            doc.onkeyup = ev => {
                ev.preventDefault();
                KeyboardHandler.onKeyUp(ev);
            };

            doc.oninput = ev => {
                KeyboardHandler.onMobileInputDom(ev);
            };
        }
    }
}

export default DomHandler;
