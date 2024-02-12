class Touch {
    constructor(event, offsetTop, offsetLeft) {
        this.identifier = event.identifier;
        this.clientX = event.clientX+offsetLeft;
        this.clientY = event.clientX+offsetTop;
        // this.clientX = event.clientX;
        // this.clientY = event.clientY;
        this.force = event.force;
        this.pageX = event.pageX;
        this.pageY = event.pageY;
        this.radiusX = event.radiusX;
        this.radiusY = event.radiusY;
        this.rotatingAngle = event.rotatingAngle;
        // this.screenX = event.screenX;
        // this.screenY = event.screenY;
        this.screenX = event.clientX+offsetLeft;
        this.screenY = event.clientY+offsetTop;
    }
}

export default Touch;
