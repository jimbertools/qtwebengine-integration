<template>
  <div class="dialog-wrapper" v-if="windowOpenRequest.url">
    <div class="dialog">
      <h1>The website has requested a new window, do you want to open it?</h1>
      <div>
        <!-- <p class="url">{{ windowOpenRequest.url }}</p> -->
        <div class="actions">
          <button class="yes" v-on:click="yes">Yes</button>
          <button class="no" v-on:click="cancel">No</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
module.exports = new Promise(async (resolve, reject) => {
  const { virtualBrowser } = await import('/js/state/VirtualBrowser.js');

  resolve({
    data() {
      return {
        windowOpenRequest: virtualBrowser.windowOpenRequest,
      };
    },
    mounted() {},
    computed: {},
    methods: {
      yes() {
        window.open(virtualBrowser.windowOpenRequest.url, '_blank');
        virtualBrowser.windowOpenRequest.url = null;
      },
      cancel() {
        virtualBrowser.closeWindowById(virtualBrowser.windowOpenRequest.id);
        virtualBrowser.windowOpenRequest.url = null;
      },
    },
  });
});
</script>
<style scoped>
.dialog h1 {
  margin-bottom: 1em;
}
.actions {
  width: 100%;
  padding-top: 1em;
  display: flex;
  justify-content: flex-end;
}

p {
  margin-bottom: 5px;
}

.url {
  font-weight: bold;
  word-break: break-all;
}
</style>
