import { physicalBrowser } from '/js/state/PhysicalBrowser.js';
import { virtualBrowser } from '/js/state/VirtualBrowser.js';
import { Device } from '/js/models/Device.js';

const KeyboardHandler = {
    async onKeyDown(event) {
        if (physicalBrowser.device.type !== Device.TYPE.DESKTOP) {
            // console.log('onKeyDown returning!', event);
            let target = event.target;
            if (event.key === 'Enter') {
                physicalBrowser.onMobileInputV2({ code: 'Enter', text: '' });
            }
            // if (event.key === 'Space') {
            //     physicalBrowser.onMobileInputV2({ code: 'Space', text: '' });
            // }
            return;
        }

        if (event.key === 'r' && (event.ctrlKey || event.metaKey)) {
            // Refreshing is just a must
            window.location.reload();
        }

        if (event.key == 'f' && (event.ctrlKey || event.metaKey)) {
            physicalBrowser.showSearchBar = true;
        }
        if (event.key === 'Escape') {
            physicalBrowser.showSearchBar = false;
        }
        if (event.key === 'F3') {
            physicalBrowser.showSearchBar = true;
        }
        if (event.key === 'F5') {
            virtualBrowser.reload();
        }
        if (event.key === 'F6') {
            // select url bar
            // ideally, when the browserbar is visible we should select that.
            return;
        }
        if (event.key === 'F12') {
            // show devtools
            return;
        }

        if (
            (event.ctrlKey || (event.metaKey && navigator.platform.toUpperCase().indexOf('MAC') >= 0)) &&
            event.keyCode == 86
        ) {
            if (!!window.safari) {
                return;
            }
            await physicalBrowser.sendClipboard();
        }

        event.preventDefault();
        event.stopPropagation();
        physicalBrowser.stopMiddleMouseScroll();

        physicalBrowser.onKeyDown(event);
    },

    onKeyUp(event) {
        // console.log("KeyboardHandler::onKeyUp", event);
        if (!physicalBrowser.device.type !== Device.TYPE.DESKTOP) {
            console.log(' onKeyUp returning!');
            return;
            console.log('KeyboardService::onKeyUp', event);
        }
        physicalBrowser.onKeyUp(event);
    },

    onKeyPress() {},

    onMobileKeyDown(event) {
        event.target.value = '^';

        if (event.key == 'Enter') {
            physicalBrowser.onMobileInputV2({ code: event.key, text: '' });
        }
    },

    onMobileInputVideo(event) {
        if (!physicalBrowser.device.hasVirtualKeyboard()) return;

        let target = event.target;
        let code = 0;
        if (event.inputType == 'deleteContentBackward') {
            code = 'Backspace';
            physicalBrowser.onMobileInputV2({ code, text: '' });

            return;
        }

        let newText = event.data;

        target.value = '^';

        physicalBrowser.onMobileInputV2({ code, text: newText });
    },

    onMobileInputDom(event) {
        if (!physicalBrowser.device.hasVirtualKeyboard()) return;

        let target = event.target;
        let code = 0;
        let value = target.value;
        let text = event.data;

        if (event.inputType == 'deleteContentBackward') {
            code = 'Backspace';
            physicalBrowser.onMobileInputV2({ code, text: '' });

            return;
        }

        let newText = event.data;

        // let newValue = value.substring(0, target.selectionStart - text.length) + value.substring(target.selectionStart, value.length);
        // target.value = newValue;

        // target.value = "ㅤ";

        physicalBrowser.onMobileInputV2({ code, text: newText.charAt(newText.length - 1) });
    },
};

export default KeyboardHandler;
