<template>
  <div class="dialog-wrapper">
    <div class="dialog">
      <h1>Jimber Browser Isolation Downloads</h1>
      <div>
        <p>
          Keep in mind that downloading files from the internet can be dangerous, we have put them in a download area
          for you and you can decide if you want to download them.
          <br />
          <br />
          When this solution is implemented in your environment, we can adjust security rules or download implementation
          based on your needs.
        </p>
        <br />
        <button @click="closeDialog">I understand</button>
      </div>
    </div>
  </div>
</template>
<script>
module.exports = new Promise(async (resolve, reject) => {
  resolve({
    data() {
      return {};
    },
    mounted() {},
    methods: {
      closeDialog() {
        localStorage.setItem('hasseendownload', 'true');
        this.$store.state.showDownloadOnboardingDialog = false;
      },
    },
  });
});
</script>
<style scoped>
.dialog {
  margin-left: 150px;
  margin-right: 150px;
}
</style>
