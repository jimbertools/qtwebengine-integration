<template>
  <div class="file-upload" v-on:click.self="cancelUploadAreaClicked">
    <div class="safari-fileinput" v-if="!submitted && !upload.isDragnDrop">
      <label for="fileinput">Please pick your files</label>
      <input
        v-if="!uploadHandler.uploading"
        id="fileinput"
        type="file"
        name="fileinput"
        ref="fileinput"
        :multiple="!!multiple"
        :accept="mimeTypes"
        :webkitdirectory="!!directory"
        @change="filesSelected"
      />
      <div>
        <button v-on:click="cancelUpload">Cancel</button>
        <button v-on:click="$refs.fileinput.click()">Pick</button>
      </div>
    </div>
    <span v-if="uploadHandler.uploading" class="actions-wrapper">
      {{ uploadedSize }} of {{ totalSize }}
      <progress :value="uploadHandler.loadedSizeInBytes" :max="uploadHandler.totalSizeInBytes"></progress>
      <div class="actions-button">
        <button v-on:submit.prevent v-on:click="cancelUpload">Cancel</button>
      </div>
    </span>
    <!-- <img v-if="submitted" src="/img/ui/loading-png-gif.gif" class="loading-img" /> -->
  </div>
</template>
<script>
module.exports = new Promise(async (resolve, reject) => {
  const { uploadHandler } = await import('/js/state/UploadHandler.js');
  // const { showOpenFilePicker } = await import('/js/libs/fsadapter.js');

  resolve({
    name: 'TheFileUpload',
    components: {},
    props: [],
    data() {
      return {
        uploadHandler,
        multiple: uploadHandler.upload.multiple,
        mimeTypes: uploadHandler.upload.mimeTypes,
        upload: uploadHandler.upload,
        directory: uploadHandler.upload.directory,
        submitted: false,
        isSafari: window.isSafari(),
      };
    },
    computed: {
      uploadedSize() {
        return this.humanFileSize(uploadHandler.loadedSizeInBytes, true);
      },
      totalSize() {
        return this.humanFileSize(uploadHandler.totalSizeInBytes, true);
      },
    },
    mounted() {
      if (document.activeElement) {
        document.activeElement.blur();
      }
      window.document.body.focus();
      console.log(this.upload);
      if (this.upload.isDragnDrop) {
        return;
      }
      if (!this.isSafari) {
        this.$refs.fileinput.click();
      }
    },
    methods: {
      cancelUploadAreaClicked() {
        if (this.submitted) return;
        this.cancelUpload();
      },
      cancelUpload() {
        this.uploadHandler.cancelUpload();
        this.$store.state.showFileUpload = false;
      },
      filesSelected() {
        console.log('filesselecdted');
        const fileinput = this.$refs.fileinput;
        this.uploadHandler.uploadFiles(fileinput.files, null, this.directory);
        this.submitted = true;
      },
      humanFileSize(bytes, si = false, dp = 1) {
        const thresh = si ? 1000 : 1024;

        if (Math.abs(bytes) < thresh) {
          return bytes + ' B';
        }

        const units = si
          ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
          : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        const r = 10 ** dp;

        do {
          bytes /= thresh;
          ++u;
        } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

        return bytes.toFixed(dp) + ' ' + units[u];
      },
    },
    watch: {},
    beforeDestroy() {},
  });
});
</script>
<style scoped>
.actions-button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
}
button {
  padding: 10px 20px;
  margin: 10px;
  border: 1px solid #eee;
  text-transform: uppercase;
  background: #fff;
  color: black;
  border-radius: 5px;
}
button.primary {
  background: var(--accent-txt-color);
  color: white;
}
button:hover {
  background: #efefef;
  border: 1px solid #ddd;
}
button.primary:hover {
  color: var(--accent-txt-color);
}
.loading-img {
  width: 10%;
  height: auto;
}
h1 {
  margin: 20px 0 10px 0;
}
.actions-wrapper {
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  padding: 50px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0px 0px 15px -4px #000000;
}
.safari-fileinput {
  display: flex;
  flex-direction: column;
  padding: 50px;
  background-color: white;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  box-shadow: 0px 0px 15px -4px #000000;
  animation: fadeIn 0.4s;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

#fileinput {
  visibility: hidden;
}

label:hover {
  cursor: pointer;
}
</style>
