import { socketHandler } from './../state/SocketHandler.js';
import { ClientToServerCommand } from '../Proto.js';
import Command from '/js/models/Command.js';

class UploadHandler {
    constructor() {
        this.upload = null;
        this.totalSizeInBytes = 0;
        this.loadedSizeInBytes = 0;
        this.axiosSource = null;
        this.uploading = false;
    }

    requestUpload(uploadId, multiple, mimeTypes, isDragnDrop, directory) {
        this.upload = {
            multiple: parseInt(multiple),
            mimeTypes: mimeTypes,
            id: uploadId,
            isDragnDrop: isDragnDrop,
            directory: directory,
        };
    }

    uploadFiles(files, position, uploadingDirectory) {
        this.uploading = true;

        const formData = new FormData();
        formData.append('uploadId', this.upload.id);

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            // console.log("uploading dir", uploadingDirectory)
            if (uploadingDirectory) {
                formData.append(`file${i}`, file, `/${file.webkitRelativePath}`);
            } else {
                formData.append(`file${i}`, file, `/${file.name}`);
            }
        }
        if (this.upload.isDragnDrop) {
            formData.append('x', position.x);
            formData.append('y', position.y);
        }

        this.uploadFormData(formData);
    }

    cancelUpload() {
        if (this.axiosSource) {
            this.axiosSource.cancel();
        }
        if (!this.upload.isDragnDrop) {
            var c = new Command();
            c.setContent(ClientToServerCommand.FILEUPLOADCANCEL, [this.upload.id]);
            c.send();
        }

        this.reset();
    }

    uploadIsDone() {
        this.reset();
    }

    reset() {
        this.upload = null;
        this.totalSizeInBytes = 0;
        this.loadedSizeInBytes = 0;
        this.axiosSource = null;
        this.uploading = false;
    }

    uploadFiles2(e, position) {
        this.uploading = true;
        this.getAllFileEntries(e.dataTransfer.items).then(async files => {
            console.log(e);

            let formData = new FormData();
            formData.append('uploadId', this.upload.id);
            for (let i = 0; i < files.length; i++) {
                let fileEntry = files[i];
                console.log(fileEntry, fileEntry.file);
                const file = await new Promise((resolve, reject) => {
                    fileEntry.file(e => {
                        resolve(e);
                    });
                });
                console.log(file);
                formData.append(`file${i}`, file, fileEntry.fullPath);
            }
            if (this.upload.isDragnDrop) {
                formData.append('x', position.x);
                formData.append('y', position.y);
            }

            this.uploadFormData(formData);
        });
    }
    // Drop handler function to get all files
    async getAllFileEntries(dataTransferItemList) {
        let fileEntries = [];
        // Use BFS to traverse entire directory/file structure
        let queue = [];
        // Unfortunately dataTransferItemList is not iterable i.e. no forEach
        for (let i = 0; i < dataTransferItemList.length; i++) {
            queue.push(dataTransferItemList[i].webkitGetAsEntry());
        }
        while (queue.length > 0) {
            let entry = queue.shift();
            if (entry.isFile) {
                fileEntries.push(entry);
            } else if (entry.isDirectory) {
                queue.push(...(await this.readAllDirectoryEntries(entry.createReader())));
            }
        }
        return fileEntries;
    }

    // Get all the entries (files or sub-directories) in a directory
    // by calling readEntries until it returns empty array
    async readAllDirectoryEntries(directoryReader) {
        let entries = [];
        let readEntries = await this.readEntriesPromise(directoryReader);
        while (readEntries.length > 0) {
            entries.push(...readEntries);
            readEntries = await this.readEntriesPromise(directoryReader);
        }
        return entries;
    }

    // Wrap readEntries in a promise to make working with readEntries easier
    // readEntries will return only some of the entries in a directory
    // e.g. Chrome returns at most 100 entries at a time
    async readEntriesPromise(directoryReader) {
        try {
            return await new Promise((resolve, reject) => {
                directoryReader.readEntries(resolve, reject);
            });
        } catch (err) {
            console.log(err);
        }
    }

    uploadFormData(formData) {
        const CancelToken = axios.CancelToken;
        this.axiosSource = CancelToken.source();
        var config = {
            onUploadProgress: progressEvent => {
                this.totalSizeInBytes = progressEvent.total;
                this.loadedSizeInBytes = progressEvent.loaded;
            },
            cancelToken: this.axiosSource.token,
        };

        let userId = localStorage.getItem('userId');
        let url = '';
        if (this.upload.isDragnDrop) {
            url += '/uploaddnd';
        } else {
            url += '/upload';
        }
        if (userId) {
            url += `/${userId}`;
        }
        axios
            .post(url, formData, config)
            .then(e => {
                this.reset();
            })
            .catch(e => {
                this.reset();
            });
    }
}

export default UploadHandler;
