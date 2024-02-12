<template>
  <div ref="domContainer" class="dom-container wrapper">
    <div id="input-catcher-dom" ref="inputCatcherDom" tabindex="0"></div>
    <iframe
      tabindex="-1"
      scrolling="yes"
      id="dom"
      ref="domIframe"
      src="/iframeMsgReceiver.html"
      class="root-frame"
    ></iframe>

    <div v-if="showKeyboardFlapper" ref="keyboardFlapper" @click="focusInput" class="keyboard-flapper in">
      <img class="arrow-up-icon" src="/img/ui/arrow-up.png" />
      <img class="keyboard-icon" src="/img/ui/keyboard.png" />
    </div>
  </div>
</template>
<script>
module.exports = new Promise(async (resolve, reject) => {
  const { physicalBrowser } = await import('/js/state/PhysicalBrowser.js');
  const { domHandler } = await import('/js/state/DomHandler.js');
  const { virtualBrowser } = await import('/js/state/VirtualBrowser.js');
  const KeyboardHandler = (await import('/js/handlers/KeyboardHandler.js')).default;

  resolve({
    data() {
      return {
        domContainer: null,
        inputCatcher: null,
        domIframe: null,
        showKeyboardFlapper: false,
      };
    },
    mounted() {
      domHandler.onKeyDownCallback = e => this.onKeyDown(e);
      this.inputCatcher = this.$refs.inputCatcherDom;
      this.domContainer = this.$refs.domContainer;
      this.domIframe = this.$refs.domIframe;
      domHandler.renderFrame = this.domIframe;

      this.addEventListeners();
      if (this.getCurrentRenderer() === 'dom') {
        domHandler.isCurrentRenderer = true;
      }
    },
    computed: {
      currentRenderer() {
        return this.$store.state.currentRenderer;
      },
    },
    methods: {
      onMouseDown(e) {
        console.log('onmousedown');
        this.checkForInputFocus();
        physicalBrowser.onMouseEvent(e);
      },
      onMouseEvent(e) {
        physicalBrowser.onMouseEvent(e);
      },
      addEventListeners() {
        this.inputCatcher.addEventListener('mousedown', e => this.onMouseDown(e));
        this.inputCatcher.addEventListener('mousemove', e => this.onMouseEvent(e));
        this.inputCatcher.addEventListener('mouseup', e => {
          this.onMouseEvent(e);
        });
        this.inputCatcher.addEventListener('mouseenter', e => this.onMouseEvent(e));
        this.inputCatcher.addEventListener('mouseleave', e => this.onMouseEvent(e));
        this.inputCatcher.addEventListener('wheel', e => physicalBrowser.onWheelEvent(e), { passive: false });
        this.inputCatcher.addEventListener('touchstart', e => physicalBrowser.onTouch(e), { passive: false });
        this.inputCatcher.addEventListener('touchend', e => physicalBrowser.onTouch(e));
        this.inputCatcher.addEventListener('touchcancel', e => physicalBrowser.onTouch(e));
        this.inputCatcher.addEventListener('touchmove', e => physicalBrowser.onTouch(e));
        this.inputCatcher.addEventListener('dragover', e => physicalBrowser.onDragOver(e));
        this.inputCatcher.addEventListener('drop', e => physicalBrowser.onDrop(e));
        this.inputCatcher.addEventListener('copy', e => physicalBrowser.onCopy(e));
        this.inputCatcher.addEventListener('paste', e => physicalBrowser.onPaste(e));
        this.inputCatcher.addEventListener('keydown', e => KeyboardHandler.onKeyDown(e));
        this.inputCatcher.addEventListener('keyup', e => KeyboardHandler.onKeyUp(e));

        this.inputCatcher.addEventListener('contextmenu', e => e.preventDefault(), false);
        window.addEventListener('resize', e => {
          if (this.$store.state.currentRenderer === 'dom') {
            physicalBrowser.onRendererResize(this.domContainer.offsetWidth, this.domContainer.offsetHeight);
          }
        });
        this.inputCatcher.addEventListener('focus', e => {
          physicalBrowser.onFocusIn(e);
        });

        this.domIframe.contentWindow.addEventListener('load', domHandler.mainIframeLoaded.bind(domHandler));

        window.addEventListener('browser-showinput', e => this.doShowInput(e));
        window.addEventListener('browser-hideinput', e => this.doHideInput(e));
      },
      getCurrentRenderer() {
        return this.$store.state.currentRenderer;
      },
      checkForInputFocus() {
        if (virtualBrowser.inputVisible) {
          domHandler.focusLastElement();
        }
      },

      onKeyDown(event) {
        if (event.key == 'f' && (event.ctrlKey || event.metaKey)) {
          this.$store.state.showSearchBar = true;
        }
        physicalBrowser.onKeyDown(event);
      },
      doShowInput(e) {
        if (!this.isActiveRenderer()) {
          return;
        }

        if (physicalBrowser.device.engine === 'WebKit' && physicalBrowser.device.type.mobile) {
          this.showKeyboardFlapper = true;
          return;
        }
      },
      doHideInput(e) {
        if (!this.isActiveRenderer()) {
          return;
        }
        // if (physicalBrowser.device.engine === 'WebKit' && physicalBrowser.device.type.mobile) {
          this.showKeyboardFlapper = false;
        // }
      },
      isActiveRenderer() {
        return this.$store.state.currentRenderer === 'dom';
      },
      focusInput(e) {
        e.preventDefault();
        console.log('trigger input focus for safair');
        this.checkForInputFocus();
      },
    },
    watch: {
      currentRenderer(newRenderer, oldRenderer) {
        if (newRenderer == 'dom') {
          domHandler.isCurrentRenderer = true;
        } else {
          domHandler.isCurrentRenderer = false;
        }
        this.checkForInputFocus();
      },
    },
  });
});
</script>

<style scoped>
.dom-container {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
#input-catcher-dom {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
  /* pointer-events: none; */
}

.root-frame {
  width: 100%;
  height: 100%;
  border: none;

  /* overflow: hidden; */
}

.wrapper {
  height: 100%;
  width: 100%;
}

.keyboard-flapper {
  height: 50px;
  background-color: rgb(245, 245, 245);
  width: 100px;
  position: absolute;
  bottom: -60px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 5px 5px 0 0;
  margin: auto;
  box-shadow: 0px 0px 16px 6px #cacaca80;
}

.keyboard-icon {
  width: 70px;
  margin-top: -8px;
}

.arrow-up-icon {
  width: 10px;
}

.in {
  animation-name: in;
  animation-duration: 0.5s;
  animation-fill-mode: both;
}
@keyframes in {
  from {
    opacity: 0;
    bottom: -60px;
  }
  to {
    opacity: 1;
    bottom: 0;
  }
}
</style>
