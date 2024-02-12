export class Device {
    constructor() {
        this.vendor = null; // Google, Apple, ..
        // We differentiate iPad/iPhone in platform due to JS api limitations
        this.platform = null; // Linux, windows, Mac, iPad, iPhone, ..
        this.type = null; // Device.TYPE;
        this.engine = null; // WebKit, Chromium, ..
        this.requestMobileVersion = null;
    }
    detect() {
        this.detectVendor();
        this.detectPlatform();
        this.detectType();
        this.detectEngine();
        this.detectRequestsMobileVersion();
    }
    detectVendor() {
        const vendor = navigator.vendor;
        switch (vendor) {
            case 'Google Inc.':
                this.vendor = 'Google';
                break;
            case 'Apple Computer, Inc.':
                this.vendor = 'Apple';
                break;
            default:
                console.log('vendor2', vendor);
                if (navigator.userAgent.indexOf('Firefox') != -1) {
                    this.vendor = 'Firefox';
                    break;
                }
                if (navigator.vendor === '') {
                    console.warn(`Vendor is empty string, assuming Firefox`);

                    this.vendor = 'Firefox';
                    break;
                }
                console.warn(`unknown vendor: ${vendor}, assuming Google`);
                this.vendor = 'Google';
                break;
        }
    }
    detectPlatform() {
        const platform = navigator.platform;
        switch (platform) {
            case 'MacIntel':
                this.platform = 'Mac';
                if (navigator.maxTouchPoints > 1) {
                    if (window.MediaSource) {
                        this.platform = 'iPad';
                    } else {
                        this.platform = 'iPhone';
                    }
                }
                break;
            case 'iPad':
                // happens only when iPad requests a mobile website
                this.platform = 'iPad';
                break;
            case 'iPhone':
                this.platform = 'iPhone';
                break;
            case 'Linux x86_64':
                this.platform = 'Linux';
                break;
            case 'Win32':
                this.platform = 'Windows';
                break;
            case 'Linux armv8l':
            case 'Linux aarch64':
                this.platform = 'Android';
                break;
            default:
                console.warn(`unknown platform: ${platform}, assuming Windows`);
                this.platform = 'Windows';
                break;
        }
    }
    detectType() {
        this.type = Device.TYPE.DESKTOP;
        if (this.platform === 'iPhone') {
            this.type = Device.TYPE.PHONE;
        }
        if (this.platform === 'iPad') {
            this.type = Device.TYPE.TABLET;
        }
        if (this.platform === 'Android') {
            this.type = Device.TYPE.PHONE;
        }
    }
    detectEngine() {
        // if (this.vendor === 'Apple' && (this.type === Device.TYPE.TABLET || this.type === Device.PHONE)) {
        if (this.vendor === 'Apple') {
            this.engine = 'WebKit';
        }
        if (this.vendor === 'Google') {
            this.engine = 'Chromium';
        }
        if (this.vendor === 'Firefox') {
            this.engine = 'Gecko';
        }
    }
    detectRequestsMobileVersion() {
        if (navigator.userAgent.indexOf('Mobile') != -1) {
            this.requestMobileVersion = true;
            return;
        }
        this.requestMobileVersion = false;
    }

    isiPadOriPhone() {
        if (this.platform === 'iPad' || this.platform === 'iPhone') {
            return true;
        }
        return false;
    }
    needsUserActionToShowKeyboard() {
        return this.isiPadOriPhone();
    }

    needsUserActionToOpenNewWindow() {
        return this.engine === 'WebKit';
    }

    hasVirtualKeyboard() {
        if (this.type === Device.TYPE.TABLET || this.type === Device.TYPE.PHONE) {
            return true;
        }

        return false;
    }
}

Device.TYPE = {
    DESKTOP: 'desktop',
    TABLET: 'tablet',
    PHONE: 'phone',
};

Device.ENGINE = {
    CHROMIUM: 'Chromium',
    WEBKIT: 'WebKit',
    GECKO: 'Gecko',
};
