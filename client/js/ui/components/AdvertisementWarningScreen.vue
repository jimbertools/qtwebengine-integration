<template>
  <section class="warning-screen">
    <h1>Warning</h1>
    <p>We have prevented the following page from loading due to our adblock filtering</p>
    <code>
      {{ advertisementWarning.url }}
    </code>
    <span class="buttons">
      <button @click="goBack">Go back</button>
      <button @click="disableAdblock">Disable adblock</button>
      <button @click="continueAnyway">Continue anyway</button>
    </span>
    <!-- <a class="disable-adblock-btn" @click="disableAdblock">disable adblock</a> -->
  </section>
</template>

<script>
module.exports = new Promise(async (resolve, reject) => {
  const physicalBrowser = (await import('/js/state/PhysicalBrowser.js')).physicalBrowser;
  const virtualBrowser = (await import('/js/state/VirtualBrowser.js')).virtualBrowser;

  resolve({
    name: 'AdvertisementWarningScreen',
    components: {},
    props: [],
    data() {
      return {
        advertisementWarning: virtualBrowser.advertisementWarning,
        // url: 'https://ads.google.com/click?=Lorem%20ipsum%20dolor%20sit%20amet%20consectetur%20adipisicing%20elit.%20Cumque%20id%20vel%20quidem%20earum%20enim%20delectus%20natus%2C%20quas%20iste%20ab%21%20Doloribus%20quidem%2C%20aliquam%20sapiente%20eligendi%20culpa%20similique%20odio%20ipsam%20fuga%20sint%21',
        // filter: 'ads.google.com',
      };
    },
    created() {},
    mounted() {},
    methods: {
      goBack() {
        virtualBrowser.sendAdvertisementResponse({ accept: false });
      },
      continueAnyway() {
        virtualBrowser.sendAdvertisementResponse({ accept: true });
      },
      disableAdblock() {
        this.$store.dispatch('setAdblockEnabled', false);
        virtualBrowser.sendAdvertisementResponse({ accept: true });
      },
    },
    beforeDestroy() {},
  });
});
</script>
<style scoped>
.warning-screen {
  background: white;
}

.warning-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

h1 {
  margin-bottom: 20px;
}
p {
  margin-bottom: 20px;
}
.buttons {
  margin-top: 20px;
}

.disable-adblock-btn {
  position: absolute;
  bottom: 50px;
}
</style>
