<template>
  <section>
    <div class="browser-bar" v-bind:class="{ hidden: virtualBrowser.isFullscreen }">
      <button class="btn-backward" @click="backward">
        <img class="btn-navigation" src="/img/jimber/back.svg" />
      </button>
      <button class="btn-forward" @click="forward">
        <img class="btn-navigation" src="/img/jimber/forward.svg" />
      </button>
      <button @click="reload">
        <img class="btn-navigation" src="/img/jimber/refresh.svg" />
      </button>
      <!-- <span>SECURE HTTPS</span> -->
      <div class="urlbar-wrapper">
        <button class="btn-info">
          <img src="/img/jimber/info.svg" />
          <span class="text-info">
            For demo purposes, we use an extra address bar to be able to browse securely.<br />
            When integrating this product within your company, this will no longer be needed and you can use your
            browser exactly as you normally would.
          </span>
        </button>
        <input
          @keyup.enter="browse"
          type="text"
          v-model="currentUrl"
          placeholder="Type a url"
          autocapitalize="off"
          autocomplete="false"
          spellcheck="false"
          @focus="$event.target.select()"
          ref="urlField"
        />
      </div>
      <span v-if="!$store.state.domRenderingDisabled" class="toggle-renderer-wrapper">
        {{ this.$store.state.currentRenderer }}
        <button @click="swaprenderer" :title="otherRendererTooltipText">
          <img src="/img/jimber/sync.svg" />
        </button>
      </span>
      <img class="logo" src="/img/jimber/jimber_logo.svg" />
      <button @click="more" class="btn-more">
        <img src="/img/jimber/more_vertical.svg" />
      </button>
    </div>

    <div class="info-overlay" v-if="showOnboardingBanner">
      <div class="content">
        <img class="arrow" src="/img/ui/info.svg" />
        <p class="main-subtitle" style="color: white !important; width: 70%">
          No worries: this browser bar only appears in the demo version. In the full version, it is integrated into the
          regular browser for an even smoother user experience.
        </p>
      </div>
      <button class="ok-button" @click="closeOnboardingBanner">Close</button>
      <a class="close-btn" @click="closeOnboardingBanner">
        <i class="fas fa-times"></i>
      </a>
    </div>
  </section>
</template>
<script>
module.exports = new Promise(async (resolve, reject) => {
  const virtualBrowser = (await import('/js/state/VirtualBrowser.js')).virtualBrowser;
  const physicalBrowser = (await import('/js/state/PhysicalBrowser.js')).physicalBrowser;

  resolve({
    name: 'BrowserBar',
    components: {},
    props: [],
    data() {
      return {
        virtualBrowser: virtualBrowser,
        currentUrl: virtualBrowser.currentUrl,
        showOnboardingBanner: false,
      };
    },
    computed: {
      virtualBrowserUrl() {
        return virtualBrowser.currentUrl;
      },
      isBrowserLoading() {
        // TODO virtualBrowser.isLoading;
      },
      otherRendererTooltipText() {
        let text = 'You are currently using ';
        if (this.$store.state.currentRenderer === 'video') {
          text += 'video-rendering';
        } else {
          text += 'dom-rendering';
        }
        text += '. Do you want to switch?';
        return text;
      },
    },
    mounted() {
      if (!localStorage.getItem('hasseenbrowserbar')) {
        this.showOnboardingBanner = true;
      }
      window.addEventListener('keydown', e => {
        if (e.key === 'R') {
          this.swaprenderer();
        }
      });
    },
    methods: {
      browse(e) {
        if (this.validURL(this.currentUrl)) {
          virtualBrowser.browse(this.currentUrl);
        } else {
          virtualBrowser.browse(`https://www.google.com/search?q=${this.currentUrl}`);
        }
      },
      forward() {
        virtualBrowser.forward();
      },
      backward() {
        virtualBrowser.backward();
      },
      reload() {
        virtualBrowser.reload();
      },
      more() {
        this.$store.state.menuActive = true;
      },
      validURL(str) {
        // This one can make the browser crash https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url?page=1&tab=votes#tab-top
        // var pattern = new RegExp(
        //   "^(https?:\\/\\/)?" + // protocol
        //     "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        //     "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        //     "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        //     "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        //     "(\\#[-a-z\\d_]*)?$",
        //   "i"
        // ); // fragment locator
        // return !!pattern.test(str);
        return str.match(
          /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
        );
      },
      closeOnboardingBanner() {
        localStorage.setItem('hasseenbrowserbar', 'true');
        this.showOnboardingBanner = false;
      },
      swaprenderer() {
        this.$store.state.userSetRenderer = true;
        if (this.$store.state.currentRenderer == 'video') {
          this.$store.state.currentRenderer = 'dom';
          physicalBrowser.notifyRendererSwitch('dom');
        } else {
          this.$store.state.currentRenderer = 'video';
          physicalBrowser.notifyRendererSwitch('video');
        }
        setTimeout(() => {
          // physicalBrowser.onResize();
        }, 1);
      },
      onKeyDown(event) {},
    },
    watch: {
      virtualBrowserUrl(val) {
        this.currentUrl = val;
      },
    },
  });
});
</script>
<style scoped>
section {
  z-index: 3;
}
.browser-bar {
  padding: 10px 5px 10px 5px;
  justify-content: center;
  align-items: center;
  display: flex;

  background: gainsboro;
  /* padding-right: 5px; */
}

.btn-backward {
  fill: red;
}

.browser-bar > * {
  vertical-align: middle;
}

.button-navigation {
  display: inline-block;
  width: 20px;
  color: red;
}

img.logo {
  height: 22px;
  width: auto;
}

@media (max-width: 800px) {
  img.logo {
    display: none;
  }
}

.browser-bar button {
  display: inline-block;
  padding: 0;
  margin: 0px 10px 0 0;
  border: none;
  background: none;
  width: 25px;
  height: 25px;

  justify-content: center;
  align-items: center;
  display: flex;
}

.browser-bar button:hover {
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.1);
}

.btn-forward {
  color: rgba(0, 0, 0, 0.54);
}
input {
  border-radius: 30px;
  color: white;
  display: inline-block;
  width: 100%;
  border: none;
  color: #000;
  font-size: 1rem;

  box-shadow: 0 0 2px 0px #000;

  box-sizing: border-box;
  padding-left: 40px;
  padding-top: 8px;
  padding-right: 10px;
  padding-bottom: 8px;

  overflow: hidden;
  text-overflow: ellipsis;

  margin-right: 10px;
}

:focus,
:active {
  outline: none;
}

.btn-more {
  margin-left: 10px;
}

.browser-bar .btn-info {
  margin-top: 4px;
  margin-left: 5px;
  position: absolute;
  box-sizing: border-box;
}
/* .btn-info:hover {
  cursor: help;
} */

.btn-info img {
  opacity: 60%;
}

.urlbar-wrapper {
  /* margin: 0 auto; */
  margin-right: 20px;
  flex: 1;
  align-items: center;
}

.text-info {
  visibility: hidden;
  position: absolute;
  width: 250px;
  background-color: #fff;
  box-shadow: 0 0 2px 0px #000;
  color: #000;
  text-align: left;
  padding: 10px 0 10px 10px;
  border-radius: 3px;
  opacity: 0;
  transition: opacity 0.3s;
  top: 135%;
  left: 0;
  /* margin-left: -60px; */
  box-sizing: border-box;
}

.btn-info:hover .text-info {
  visibility: visible;
  opacity: 1;
}

.info-overlay {
  left: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  background: #000000aa;
  color: white;
  z-index: 24;
}
.content {
  display: flex;
  /* position: relative; */
  width: 100%;
}
p {
  font-size: 2em;
  margin-top: 50px;
}
.arrow {
  margin: 2em 1em 0 5em;
  height: 50px;
  transform: scale(-1, 1);
  fill: white;
}

.ok-button {
  border: 0;
  background: #b4b4b4;
  color: white;
  border-radius: 4px;
  box-sizing: border-box;
  cursor: pointer;
  font-size: 0.875em;
  margin: 0;
  padding: 8px 16px;
  transition: box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  margin-top: 50px;
  margin-left: 196px;
}

.close-btn {
  position: absolute;
  right: 10px;
  top: 10px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.toggle-renderer-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hidden {
  display: none;
}
</style>
