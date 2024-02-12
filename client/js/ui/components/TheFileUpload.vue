<template>
  <!-- <div class="file-upload">
    <h1>Please choose your file{{ multiple ? 's' : '' }}</h1>
    <div id="dropContainer" class="dropzone">
      <label for="fileInput"><strong>Choose a file</strong><span> or drag it here</span>.</label>
    </div>
    <p>
      <span v-for="file in selectedFiles" :key="file" class="chip"
        ><img
          id="{{selectedFiles.indexOf(file)}}"
          class="removeItem"
          v-on:click="removeItem(selectedFiles.indexOf(file))"
          src="/img/jimber/close.svg"
        />{{ truncate(file) }}</span
      >
    </p>
    <input id="fileInput" type="file" name="file" :multiple="!!multiple" :accept="mimeTypes" @change="filesSelected" />
    <progress v-if="submitted" :value="progress" :max="uploadHandler.totalFileSizeInBytes"></progress>
    <div class="action-buttons">
      <button v-on:submit.prevent v-on:click="cancelUpload">Cancel</button>
      <button class="primary" v-on:submit.prevent v-on:click="submitFiles" :disabled="!selectedFiles.length">
        Submit
      </button>
    </div>
    <img v-if="submitted" src="/img/ui/loading-png-gif.gif" class="loading-img" />
  </div>
</template> -->
<script>
// module.exports = new Promise(async (resolve, reject) => {
//   const { uploadHandler } = await import('/js/state/UploadHandler.js');
//   const { socketHandler } = await import('/js/state/SocketHandler.js');
//   resolve({
//     name: 'TheFileUpload',
//     components: {},
//     props: [],
//     data() {
//       return {
//         uploadHandler,
//         multiple: uploadHandler.upload.multiple,
//         mimeTypes: uploadHandler.upload.mimeTypes,
//         upload: uploadHandler.upload,
//         submitted: false,
//         selectedFiles: [],
//         socketHandler: socketHandler,
//         progress: 0,
//         requestAnimation: true,
//       };
//     },
//     computed: {},
//     mounted() {
//       let dropContainer = document.querySelector('#dropContainer');
//       // dropContainer.ondragover;
//       dropContainer.ondragenter = evt => {
//         dropContainer.classList.add('hovered');
//         evt.preventDefault();
//       };

//       dropContainer.ondragleave = evt => {
//         dropContainer.classList.remove('hovered');
//         evt.preventDefault();
//       };

//       dropContainer.ondrop = evt => {
//         evt.preventDefault();
//         let realUploader = document.querySelector('#fileInput');
//         realUploader.files = evt.dataTransfer.files;
//         dropContainer.classList.remove('hovered');
//         this.filesSelected();
//         // If you want to use some of the dropped files
//         // const dT = new DataTransfer();
//         // dT.items.add(evt.dataTransfer.files[0]);
//         // dT.items.add(evt.dataTransfer.files[3]);
//         // fileInput.files = dT.files;
//       };
//     },
//     methods: {
//       directUpload() {
//         var fileInput = document.getElementById('fileInput');
//         fileInput.onchange = () => {
//           var fileInput = document.getElementById('fileInput');
//           if (fileInput.files) {
//             this.submitFiles();
//             // document.getElementsByClassName("primary")[0].click();
//           }
//         };
//       },
//       selectFilesImmediately() {
//         document.getElementById('fileInput').addEventListener('click', this.directUpload);
//         document.getElementsByClassName('file-upload-wrapper')[0].style.display = 'none';
//         let fileInput = document.getElementById('fileInput').click();
//       },

//       truncate(str, num = 25) {
//         return str.length < num ? str : `${str.slice(0, Math.ceil(num / 2))}...${str.slice(Math.floor(-num / 2))}`;
//       },
//       chooseFile() {
//         let realUploader = document.querySelector('#fileInput');
//         realUploader.click();
//       },
//       filesSelected() {
//         let realUploader = document.querySelector('#fileInput');
//         for (let index = 0; index < realUploader.files.length; index++) {
//           const file = realUploader.files[index];
//           this.selectedFiles.push(file.name);
//         }
//       },
//       cancelUpload() {
//         this.uploadHandler.cancelUpload();
//         this.$store.state.showFileUpload = false;
//       },
//       submitFiles() {
//         requestAnimationFrame(this.updateFileUploadProgress);

//         this.submitted = true;
//         this.uploadHandler.uploadFiles();
//         // todo disable form
//       },
//       removeItem(index) {
//         this.selectedFiles.splice(index, 1);
//       },
//       updateFileUploadProgress() {
//         this.progress = this.uploadHandler.totalFileSizeInBytes - this.socketHandler.getBufferedAmount();
//         if (!this.requestAnimation) {
//           return;
//         }
//         requestAnimationFrame(this.updateFileUploadProgress);
//       },
//     },
//     watch: {},
//     beforeDestroy() {
//       this.requestAnimation = false;
//     },
//   });
// });
</script>
<style scoped>
/* .file-upload {
  max-height: 500px;
  width: 300px;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  background-color: white;
  box-shadow: 0 4px 5px 3px rgba(0, 0, 0, 0.2);
  padding: 1em;
}
.file-upload p {
  max-width: 100%;
  overflow: auto;
}
.dropzone {
  outline: 2px dashed black;
  outline-offset: -10px;
  padding: 3em;
}
.dropzone label {
  cursor: pointer;
}
input[type='file'] {
  visibility: hidden;
}
.action-buttons {
  text-align: right;
  width: 100%;
}
button {
  padding: 10px 20px;
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
.hovered {
  background: #ddd;
  outline: white dashed 3px !important;
  border-radius: 5px;
}
.chip {
  display: block;
  background: var(--accent-txt-color);
  color: white;
  padding: 0px 20px;
  line-height: 30px;
  border-radius: 30px;
  margin: 5px 10px 0 0;
}
.removeItem {
  float: left;
  display: block;
  padding-top: 6px;
  width: 18px;
  height: 18px;
  padding-right: 6px;
} */
</style>
