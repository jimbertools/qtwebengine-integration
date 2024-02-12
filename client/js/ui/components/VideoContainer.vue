<template>
  <div class="wrapper">
    <div v-if="showKeyboardFlapper" ref="keyboardFlapper" @click="focusInput" class="keyboard-flapper in">
      <img class="arrow-up-icon" src="/img/ui/arrow-up.png" />
      <img class="keyboard-icon" src="/img/ui/keyboard.png" />
    </div>
    <div id="video-container" tabindex="1">
      <!-- <canvas tabindex="0" id="video-rendering-canvas" ref="videoRenderingCanvas"></canvas> -->
    </div>
    <input
      id="fake-input"
      autocorrect="off"
      autocapitalize="none"
      style="opacity: 0"
      autocomplete="off"
      ref="mobileInput"
    />
  </div>
</template>
<script>
module.exports = new Promise(async (resolve, reject) => {
  const CanvasStreamer = (await import('/js/video/CanvasStreamer.js')).default;
  const { socketHandler } = await import('/js/state/SocketHandler.js');
  const Command = (await import('/js/models/Command.js')).default;
  const { physicalBrowser } = await import('/js/state/PhysicalBrowser.js');
  const { virtualBrowser } = await import('/js/state/VirtualBrowser.js');
  const { ClientToServerCommand } = await import('/js/Proto.js');
  const KeyboardHandler = (await import('/js/handlers/KeyboardHandler.js')).default;

  resolve({
    data() {
      return {
        canvasStreamer: null,
        inputBox: null,
        videoContainer: null,
        canvas: null,
        showKeyboardFlapper: false,
      };
    },
    mounted() {
      this.inputBox = this.$refs.mobileInput;

      // this.canvas = this.$refs.videoRenderingCanvas;

      // this.canvas.setAttribute('disabled', true);
      this.canvasStreamer = new CanvasStreamer('video-container', false, true, this.canvas);

      this.canvasStreamer.start();
      this.videoContainer = document.getElementById('video-container');

      socketHandler.addBrowserReadyHandler(this.canvasStreamer.clear.bind(this.canvasStreamer));

      // physicalBrowser.onResize(this.videoContainer.offsetWidth, this.videoContainer.offsetHeight);
      physicalBrowser.onResize(this.videoContainer.offsetWidth, this.videoContainer.offsetHeight);
      this.addEventListeners();

      if (this.$store.state.currentRenderer !== 'video') {
        this.pauseVideo();
      }
    },
    computed: {
      currentRenderer() {
        return this.$store.state.currentRenderer;
      },
    },
    methods: {
      addEventListeners() {
        window.addEventListener('blur', e => this.onWindowBlur(e));

        this.videoContainer.addEventListener('mousedown', e => this.onMouseDown(e));
        this.videoContainer.addEventListener('mousemove', e => physicalBrowser.onMouseEvent(e));
        this.videoContainer.addEventListener('mouseup', e => physicalBrowser.onMouseEvent(e));
        this.videoContainer.addEventListener('mouseenter', e => physicalBrowser.onMouseEvent(e));
        this.videoContainer.addEventListener('mouseleave', e => physicalBrowser.onMouseEvent(e));
        this.videoContainer.addEventListener('wheel', e => physicalBrowser.onWheelEvent(e), { passive: false });
        this.videoContainer.addEventListener('touchstart', e => physicalBrowser.onTouch(e), { passive: false });
        this.videoContainer.addEventListener('touchend', e => physicalBrowser.onTouch(e));
        this.videoContainer.addEventListener('touchcancel', e => physicalBrowser.onTouch(e));
        this.videoContainer.addEventListener('touchmove', e => physicalBrowser.onTouch(e));
        this.videoContainer.addEventListener('dragover', e => physicalBrowser.onDragOver(e));
        this.videoContainer.addEventListener('drop', e => physicalBrowser.onDrop(e));
        this.videoContainer.addEventListener('copy', e => physicalBrowser.onCopy(e));
        this.videoContainer.addEventListener('paste', e => physicalBrowser.onPaste(e));

        this.videoContainer.addEventListener('contextmenu', e => e.preventDefault(), false);
        this.videoContainer.addEventListener('keydown', e => KeyboardHandler.onKeyDown(e));
        this.videoContainer.addEventListener('keyup', e => KeyboardHandler.onKeyUp(e));
        this.videoContainer.addEventListener('focus', e => {
          physicalBrowser.onFocusIn(e);
        });
        // this.videoContainer.addEventListener("blur", (e) => physicalBrowser.onBlur(e)); this never triggers?

        this.inputBox.addEventListener('keydown', e => KeyboardHandler.onMobileKeyDown(e));
        // this.inputBox.addEventListener('keyup', e => KeyboardHandler.onKeyUp(e));
        this.inputBox.addEventListener('blur', e => this.onInputBlur(e));
        this.inputBox.addEventListener('input', e => KeyboardHandler.onMobileInputVideo(e));
        window.addEventListener('browser-showinput', e => this.doShowInput(e));
        window.addEventListener('browser-hideinput', e => this.doHideInput(e));
        window.addEventListener('resize', e => this.onWindowResize(e));

        socketHandler.addBrowserReadyHandler(() => {
          physicalBrowser.onRendererResize(this.videoContainer.offsetWidth, this.videoContainer.offsetHeight);
          if (!this.isActiveRenderer()) {
            this.pauseVideo();
          }
        });
      },
      onMouseDown(e) {
        this.checkForInputFocus();
        physicalBrowser.onMouseEvent(e);
      },
      doShowInput(e) {
        if (!this.isActiveRenderer()) {
          return;
        }
        if (physicalBrowser.device.needsUserActionToShowKeyboard()) {
          this.showKeyboardFlapper = true;
        }

        if (physicalBrowser.device.hasVirtualKeyboard()) {
          this.inputBox.focus();
          return;
        }
        this.videoContainer.focus();
      },
      doHideInput(e) {
        if (!this.isActiveRenderer()) {
          return;
        }
        this.showKeyboardFlapper = false;
        // Active element can be anything outside of the videocontainer
        // in which case we don't want to focus the videocontainer
        if (document.activeElement === this.inputBox) {
          this.inputBox.blur();
          this.videoContainer.focus();
        }
      },
      onInputBlur(e) {
        // why?
        // Ooh I know why
        // Maybe you should explain it next time...
        // We want to refocus the input field if you where to leave the page. E.g. tab to other app, went to settings menu, etc...
        if (e.relatedTarget) {
          e.relatedTarget.onblur = () => {
            this.inputBox.focus(); // hehehe
          };
        }
      },
      onWindowResize(e) {
        if (this.$store.state.currentRenderer === 'video') {
          physicalBrowser.onRendererResize(this.videoContainer.offsetWidth, this.videoContainer.offsetHeight);
        }
      },
      onWindowBlur(e) {
        if (!this.isActiveRenderer()) {
          return;
        }
        physicalBrowser.onBlur(e);
      },
      isActiveRenderer() {
        return this.$store.state.currentRenderer === 'video';
      },
      checkForInputFocus() {
        if (virtualBrowser.inputVisible) {
          // document.activeElement.blur();
          setTimeout(() => {
            if (physicalBrowser.device.hasVirtualKeyboard()) {
              this.inputBox.focus();
            }
          }, 0);
        }
      },
      resumeVideo() {
        var c = new Command();
        c.setContent(ClientToServerCommand.RESUMEVIDEOSTREAMING, []);
        c.send();
      },
      pauseVideo() {
        var c = new Command();
        c.setContent(ClientToServerCommand.PAUSEVIDEOSTREAMING, []);
        c.send();
      },
      focusInput() {
        this.inputBox.style.top = `${physicalBrowser.lastTouchPosition.y}px`;
        this.inputBox.style.left = `${physicalBrowser.lastTouchPosition.x}px`;
        this.inputBox.focus();
      },
    },
    watch: {
      currentRenderer(newRenderer, oldRenderer) {
        if (newRenderer === 'video') {
          this.resumeVideo();
          this.checkForInputFocus();
        } else {
          this.pauseVideo();
        }
      },
    },
  });
});
</script>

<style scoped>
.wrapper {
  height: 100%;
  /* min-height: 100%; */
  display: flex;
  flex-direction: column;
  align-items: center;
}
#fake-input {
  opacity: 0;
  position: fixed;
}

#video-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
  /* border: 5px solid red; */
}
/*ie sta nie in de midden kweetet*/
.keyboard-flapper {
  height: 50px;
  background-color: rgb(245, 245, 245);
  width: 100px;
  position: fixed;
  left: 45%;
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

#fake-input {
  z-index: -1;
}
</style>
