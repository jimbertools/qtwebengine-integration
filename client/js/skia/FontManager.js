class FontManager {
    constructor() {
        this.skFontMgr = CanvasKit.SkFontMgr.RefDefault();
    }

    loadFont(data) {
        this.skFontMgr.MakeTypefaceFromData(data);
    }
}

export default FontManager;
