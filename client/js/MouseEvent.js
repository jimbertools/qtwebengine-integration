'use strict';
import SystemTools from '/js/SystemTools.js';

class MouseEvent {
    constructor(event) {
        this.which = event.which;
        this.type = event.type;
        // this.clientX = event.offsetX*window.devicePixelRatio;
        // this.clientX = event.offsetX;
        // this.clientY = event.offsetY*window.devicePixelRatio;
        // this.clientY = event.offsetY;
        // this.clientX = event.clientX;
        // this.clientY = event.clientY;
        if (event.currentTarget === window) {
            console.log("window!")
            this.clientX = event.clientX
            this.clientY = event.clientY
        } else {

            this.clientX = event.clientX - event.currentTarget.getBoundingClientRect().left;
            this.clientY = event.clientY - event.currentTarget.getBoundingClientRect().top;
        }
        this.modifiers = SystemTools.translateModifiers(event);
    }
}

export default MouseEvent;
