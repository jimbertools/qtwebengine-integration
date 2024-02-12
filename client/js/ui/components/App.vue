<template>
  <!-- this is necessary, don't ask me why -->
  <section
    :class="`app ${isMobile() ? 'mobile' : ''}`"
    @touchstart="onTouch"
    @touchmove="onTouchMove"
    @touchend="onTouch"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @click="onMouseClick"
    @keydown="onKeyDown"
  >
    <!-- :key="$store.state.pageRefreshTrigger" -->

    <!-- <div>{{$store.state.pageRefreshTrigger}}</div> -->
    <ExtensionCheckDialog></ExtensionCheckDialog>
    <FeaturePermission></FeaturePermission>
    <div :class="`alert border ${alertMsg ? 'show' : 'hide'}`">
      <p>{{ alertMsg }}</p>
    </div>
    <TheStatistics class="stats" v-if="$store.state.showStats"></TheStatistics>
    <TouchSelectionContextMenu></TouchSelectionContextMenu>
    <TheBrowserBar v-if="$store.state.showBrowserBar"></TheBrowserBar>
    <!-- <div class="file-upload-wrapper" v-if="$store.state.showFileUpload"> -->
    <TheFileUpload v-if="$store.state.showFileUpload" class="file-upload"></TheFileUpload>
    <!-- </div> -->
    <TheSearchBar v-if="physicalBrowser.showSearchBar"></TheSearchBar>

    <div id="renderer-wrapper" class="renderer-download-row-wrapper">
      <download-list
        v-if="$store.state.showDownloadList && !isAppIsolated"
        :dense="false"
        class="border download-list"
      ></download-list>
      <AdvertisementWarningScreen
        v-if="showAdvertisementWarning"
        class="advertisement-warning"
      ></AdvertisementWarningScreen>
      <!-- <div id="video-container"></div> -->
      <!-- <video-container></video-container> -->
      <TouchHandles></TouchHandles>
      <SelectionMenu></SelectionMenu>
      <VideoContainer class="renderer" :class="{ ontop: showVideo, background: showDom }"></VideoContainer>
      <DomContainer
        v-if="!virtualBrowser.domRenderingDisabled"
        class="renderer"
        :class="{ ontop: showDom, background: showVideo }"
      ></DomContainer>
    </div>
    <TheMenu v-if="!virtualBrowser.isAppIsolating"></TheMenu>

    <download-list
      class="download-list download-list--dense"
      v-if="$store.state.showBottomDownloadList && !isAppIsolated"
      :dense="true"
    ></download-list>
    <AuthenticationDialog class="ontop" v-if="authRequest"></AuthenticationDialog>
    <DownloadOnboardingDialog
      class="ontop"
      v-if="$store.state.showDownloadOnboardingDialog && !isAppIsolated"
    ></DownloadOnboardingDialog>
    <OnboardingDialog class="ontop" v-if="$store.state.showOnboardingDialog"></OnboardingDialog>
    <!-- <BrowserSupportDialog v-if="$store.state.showBrowserSupport"></BrowserSupportDialog> -->
    <LeaveIsolationDialog class="ontop"></LeaveIsolationDialog>
    <WindowOpenRequestDialog class="ontop"></WindowOpenRequestDialog>
    <ContextMenu></ContextMenu>
  </section>
</template>

<script>
// const { default: VirtualBrowser }=require("../../../../spawner/dist/www/js/virtualbrowser/VirtualBrowser");

module.exports = new Promise(async (resolve, reject) => {
  const { domHandler } = await import('/js/state/DomHandler.js');
  const { downloadHandler } = await import('/js/state/DownloadHandler.js');
  const { uploadHandler } = await import('/js/state/UploadHandler.js');
  const { physicalBrowser } = await import('/js/state/PhysicalBrowser.js');
  // const { canvasStreamer } = await import("/js/state/CanvasStreamer.js");
  const { passwordHandler } = await import('/js/state/PasswordHandler.js');
  const { authenticationHandler } = await import('/js/state/AuthenticationHandler.js');
  const { virtualBrowser } = await import('/js/state/VirtualBrowser.js');
  const ContextMenuEvents = (await import('/js/virtualbrowser/ContextMenuEvents.js')).default;

  const KeyboardService = (await import('/js/handlers/KeyboardHandler.js')).default;

  resolve({
    name: 'App',
    components: {
      browsersupportdialog: httpVueLoader('/js/ui/components/BrowserSupportDialog.vue'),
      domcontainer: httpVueLoader('/js/ui/components/DomContainer.vue'),
      contextmenu: httpVueLoader('/js/ui/components/ContextMenu.vue'),
      videocontainer: httpVueLoader('/js/ui/components/VideoContainer.vue'),
      thestatistics: httpVueLoader('/js/ui/components/TheStatistics.vue'),
      selectionmenu: httpVueLoader('/js/ui/components/SelectionMenu.vue'),
      touchselectioncontextmenu: httpVueLoader('/js/ui/components/TouchSelectionContextMenu.vue'),
      touchhandles: httpVueLoader('/js/ui/components/TouchHandles.vue'),
      featurepermission: httpVueLoader('/js/ui/components/FeaturePermission.vue'),
      thebrowserbar: httpVueLoader('/js/ui/components/TheBrowserBar.vue'),
      thesearchbar: httpVueLoader('/js/ui/components/TheSearchBar.vue'),
      onboardingdialog: httpVueLoader('/js/ui/components/OnboardingDialog.vue'),
      extensioncheckdialog: httpVueLoader('/js/ui/components/ExtensionCheckDialog.vue'),

      themenu: httpVueLoader('/js/ui/components/menu/TheMenu.vue'),

      advertisementwarningscreen: httpVueLoader('/js/ui/components/AdvertisementWarningScreen.vue'),

      authenticationdialog: httpVueLoader('/js/ui/components/passwordmanager/AuthenticationDialog.vue'),
      savecredentialsdialog: httpVueLoader('/js/ui/components/passwordmanager/SaveCredentialsDialog.vue'),
      masterpasswordcreationdialog: httpVueLoader('/js/ui/components/passwordmanager/MasterPasswordCreationDialog.vue'),
      masterpassworddialog: httpVueLoader('/js/ui/components/passwordmanager/MasterPasswordDialog.vue'),
      resetpasswordmanagerdialog: httpVueLoader('/js/ui/components/passwordmanager/ResetPasswordManagerDialog.vue'),

      DownloadList: httpVueLoader('/js/ui/components/downloads/DownloadList.vue'),
      downloadonboardingdialog: httpVueLoader('/js/ui/components/downloads/DownloadOnboardingDialog.vue'),

      thefileupload: httpVueLoader('/js/ui/components/TheFileUploadSimple.vue'),

      windowopenrequestdialog: httpVueLoader('/js/ui/components/WindowOpenRequestDialog.vue'),
    },
    async mounted() {
      if (virtualBrowser.domRenderingDisabled) {
        this.$store.state.currentRenderer = 'video';
        this.$store.state.domRenderingDisabled = true;
      }
      try {
        let isTimby = location.href.includes('timby');
        let hasSeenOnboarding = localStorage.getItem('onboarding') === 'seen';
        // todo onboarding is not needed for proxybrowsing
        if (!isTimby && !hasSeenOnboarding && !isSafari()) {
          navigator.permissions.query({ name: 'clipboard-read' }).then(result => {
            if (result.state !== 'granted') {
              this.$store.state.showOnboardingDialog = true;
            }
          });
        }
        if (localStorage.getItem('passwordmanager') === 'disabled') {
          this.$store.state.passwordManagerDisabled = true;
        }
        this.browserControls();
        this.$root.$on('showAlert', msg => {
          this.alertMsg = msg;
          setTimeout(() => {
            this.alertMsg = null;
          }, 3000);
        });
      } catch (error) {
        console.warn(error);
      }
      this.videoRenderingRegexList;

      visualViewport.addEventListener(
        'resize',
        () => {
          // document.body.style.maxHeight = `${window.visualViewport.height}px`;
          // console.log(window.visualViewport.height);
          if (window.visualViewport.height !== this.maxHeight) {
            var all = document.getElementsByClassName('renderer');
            this.maxHeight = window.visualViewport.height;
            for (var i = 0; i < all.length; i++) {
              all[i].style.maxHeight = `${window.visualViewport.height}px`;
              physicalBrowser.onResize();
            }
          }
        },
        1
      );
    },
    data() {
      return {
        alertMsg: null,
        downloads: downloadHandler.downloads,
        uploadHandler: uploadHandler,
        passwordHandler: passwordHandler,
        authenticationHandler: authenticationHandler,
        virtualBrowser: virtualBrowser,
        advertisementWarning: virtualBrowser.advertisementWarning,
        physicalBrowser: physicalBrowser,
        isAppIsolated: virtualBrowser.isAppIsolating,
        domRenderingDisabled: virtualBrowser.domRenderingDisabled,
        currentUrl: '',
        //todo host this somewhere?
        forceVideoRegexFilterList: [
          /google\.[A-z]{2,24}(.[A-z]{2,24})?\/(spreadsheets|maps)/, // various google pages
          /\/vault\/file\//, // vault file viewer
          /\/invitation\/[a-z0-9]*-[a-z0-9]*-[a-z0-9]*-[a-z0-9]*-[a-z0-9]*$/, // vault invitation page
        ],
        maxHeight: 0,
      };
    },
    computed: {
      authRequest() {
        return this.authenticationHandler.url;
      },
      showVideo() {
        return this.$store.state.currentRenderer === 'video';
      },
      showDom() {
        return this.$store.state.currentRenderer === 'dom';
      },
      showAdvertisementWarning() {
        return this.advertisementWarning.url != null;
      },
    },
    methods: {
      // initDefaultStyling() {
      //   domHandler.initDefaultStyling(document.getElementById("dom"));
      // },
      openDownloadList() {
        this.$store.state.showDownloadList = false;
        this.$store.state.showBottomDownloadList = true;
      },
      showUploadDialog() {
        this.$store.state.showFileUpload = true;
      },
      onTouch(event) {
        this.$root.$emit('touch', event);
      },
      onTouchMove(event) {
        this.$root.$emit('touchMove', event);
      },
      onMouseDown() {},
      onMouseUp(event) {
        this.$root.$emit('mouseup', event);
      },
      browserControls() {
        let params = new URLSearchParams(window.location.search);
        if (params.get('browsercontrols') === 'false') {
          this.$store.state.showBrowserBar = false;
          localStorage.removeItem('showbrowserbar');
          return;
        }
        if (localStorage.getItem('showbrowserbar')) {
          this.$store.state.showBrowserBar = true;
          return;
        }
        if (params.get('browsercontrols') === 'true') {
          this.$store.state.showBrowserBar = true;
          localStorage.setItem('showbrowserbar', true);
        }
      },
      onMouseClick(event) {
        ContextMenuEvents.hideContextMenu();
        this.$root.$emit('click', event);
      },
      onMouseMove(event) {
        this.$root.$emit('mousemove', event);
      },
      isMobile() {
        var check = false;
        (function (a) {
          if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
              a
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
              a.substr(0, 4)
            )
          )
            check = true;
        })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
      },
      showInput() {
        // TODO Clean up.
        let keyboardPopover = document.getElementById('ios-keyboard-popup');
        let elem = document.getElementById('fakeInputForMobile');

        elem.style.left = `${physicalBrowser.lastTouchPosition.x}px`;
        elem.style.top = `${physicalBrowser.lastTouchPosition.y}px`;
        // elem.style.opacity = 0;
        elem.style.position = 'fixed';
        elem.style.display = 'block';
        elem.focus();

        keyboardPopover.setAttribute('style', 'display: none;');

        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          keyboardPopover.setAttribute('style', 'display: inline;');

          keyboardPopover.addEventListener('click', () => {
            this.hideKeyboard();
          });
        }
      },
      hideKeyboard() {
        // TODO Clean up / add functionality
      },
      onKeyDown(event) {
        if (event.key == 'f' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          physicalBrowser.showSearchBar = true;
        }
      },
      checkUrlForCompatibleRenderer() {
        if (this.$store.state.domRenderingDisabled || this.$store.state.userSetRenderer) {
          return;
        }
        for (let i = 0; i < this.forceVideoRegexFilterList.length; i++) {
          const matches = this.currentUrl.match(this.forceVideoRegexFilterList[i]);
          if (matches) {
            this.$store.state.currentRenderer = 'video';
            return;
          }
        }
        this.$store.state.currentRenderer = 'dom';
      },
    },
    watch: {
      downloads(val) {
        if (val.length && !this.$store.state.showDownloadList) {
          if(isAppIsolated) {
            console.log("Don't trigger downloads bar")
            return;
          }
          this.openDownloadList();
        }
      },
      uploadHandler: {
        deep: true,
        handler(val) {
          if (val.upload == null) {
            this.$store.state.showFileUpload = false;
            return;
          }
          this.$store.state.showFileUpload = true;
        },
      },
      domRenderingDisabled(disabled) {
        if (disabled) {
          this.$store.state.domRenderingDisabled = true;
          this.$store.state.currentRenderer = 'video';
        }
      },
      virtualBrowser: {
        deep: true,
        immediate: true,
        handler(vb) {
          if (vb.currentUrl !== this.currentUrl) {
            this.currentUrl = vb.currentUrl;
            this.checkUrlForCompatibleRenderer();
          }
        },
      },
    },
  });
});
</script>
<style>
:root {
  --main-bg-color: #f2f2f2;
  --accent-bg-color: #4b4b4b;
  --main-txt-color: #2c3e50;
  --accent-txt-color: #5285c6;
}
:focus,
:active {
  outline: none;
}

.app {
  display: flex;
  flex-direction: column;
  font-family: 'Roboto', sans-serif;
  width: 100%;
  height: 100%;
}

.alert {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  background: var(--accent-bg-color);
  color: var(--main-bg-color);
  padding: 1em;
  height: auto;
  transition: all 300ms ease-in-out;
}

.alert.hide {
  padding: 0;
  height: 0;
}

/*
img {
  width: 200px;
  margin: 3em;
  position: fixed;
  bottom: 0;
  right: 0;
} */

.mr-2 {
  margin-right: 2em;
}

::selection {
  background-color: rgba(59, 143, 251, 255);
}

/* #video-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
} */

/* canvas {
  position: absolute;
} */

.border {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

a:hover {
  color: var(--accent-txt-color);
  cursor: pointer;
}

.renderer-download-row-wrapper {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.file-upload {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 3;
}
button,
a.btn {
  padding: 0.75em 1em;
  border: none;
  font-size: 16px;
  transition: all 200ms ease-in-out;
  cursor: pointer;
  margin-left: 1em;
  border-radius: 5px;
  background: white;
  border: 1px solid #000000aa;
  color: #000000aa;
}
button:hover,
a.btn:hover {
  background: #000000aa;
  color: white;
}

.dialog-wrapper {
  position: fixed;
  background: #00000050;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}
.dialog {
  background: white;
  padding: 2em;
  border-radius: 5px;
  max-width: 60%;
}
.dialog h1 {
  margin-bottom: 1em;
}

input {
  border: 1px solid #000000aa;
  padding: 0.5em 1em;
  border-radius: 5px;
}
</style>
<style scoped>
.ontop {
  z-index: 2;
  position: absolute;
}
.renderer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.background {
  opacity: 0.1;
}
/* Quick and dirty css fixes. For the safari keyboard. */

#ios-keyboard-popup {
  overflow: hidden;
  z-index: 1;
  background-color: #222222;
  width: 100%;
  height: 25%;
  bottom: 0;
  left: 0;
}

#ios-keyboard-popup-text {
  font-size: 16px;
  color: white;
  text-align: center;
  padding-top: 5px;
}

.center {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 40%;
}

.advertisement-warning {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 3;
}
</style>
