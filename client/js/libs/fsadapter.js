const native$2 = globalThis.showDirectoryPicker;

/**
 * @param {Object} [options]
 * @param {boolean} [options._preferPolyfill] If you rather want to use the polyfill instead of the native
 * @returns Promise<FileSystemDirectoryHandle>
 */
async function showDirectoryPicker (options = {}) {
  if (native$2 && !options._preferPolyfill) {
    return native$2(options)
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.webkitdirectory = true;

  return new Promise(resolve => {
    const p = Promise.resolve().then(function () { return util; }).then(m => m.fromInput);
    input.onchange = () => resolve(p.then(fn => fn(input)));
    input.click();
  })
}

const def = {
  accepts: []
};
const native$1 = globalThis.showOpenFilePicker;

/**
 * @param {Object} [options]
 * @param {boolean} [options.multiple] If you want to allow more than one file
 * @param {boolean} [options.excludeAcceptAllOption=false] Prevent user for selecting any
 * @param {Object[]} [options.accepts] Files you want to accept
 * @param {boolean} [options._preferPolyfill] If you rather want to use the polyfill instead of the native
 * @returns Promise<FileSystemDirectoryHandle>
 */
async function showOpenFilePicker (options = {}) {
  const opts = { ...def, ...options };

  if (native$1 && !options._preferPolyfill) {
    return native$1(opts)
  }
  console.log("doing pony")
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = opts.multiple;
  input.accept = opts.accepts.map(e => [...(e.extensions || []).map(e => '.' + e), ...e.mimeTypes || []]).flat().join(',');

  return new Promise(resolve => {
    const p = Promise.resolve().then(function () { return util; }).then(m => m.fromInput);
    input.onchange = () => resolve(p.then(fn => fn(input)));
    input.click();
  })
}

const native = globalThis.showSaveFilePicker;

/**
 * @param {Object} [options]
 * @param {boolean} [options.excludeAcceptAllOption=false] Prevent user for selecting any
 * @param {Object[]} [options.accepts] Files you want to accept
 * @param {string} [options.suggestedName] the name to fall back to when using polyfill
 * @param {string} [options._name] the name to fall back to when using polyfill
 * @param {boolean} [options._preferPolyfill] If you rather want to use the polyfill instead of the native
 * @returns Promise<FileSystemDirectoryHandle>
 */
async function showSaveFilePicker (options = {}) {
  if (native && !options._preferPolyfill) {
    return native(options)
  }

  if (options._name) {
    console.warn('deprecated _name, spec now have `suggestedName`');
    options.suggestedName = options._name;
  }

  const FileSystemFileHandle = await Promise.resolve().then(function () { return FileSystemFileHandle$1; }).then(d => d.default);
  const { FileHandle } = await Promise.resolve().then(function () { return downloader; });
  return new FileSystemFileHandle(new FileHandle(options.suggestedName))
}

const kAdapter$2 = Symbol('adapter');

class FileSystemHandle {
  /** @type {FileSystemHandle} */
  [kAdapter$2]

  /** @type {string} */
  name
  /** @type {('file'|'directory')} */
  kind

  /** @param {FileSystemHandle & {writable}} adapter */
  constructor (adapter) {
    this.kind = adapter.kind;
    this.name = adapter.name;
    this[kAdapter$2] = adapter;
  }

  async queryPermission (options = {}) {
    if (options.readable) return 'granted'
    const handle = this[kAdapter$2];
    return handle.queryPermission ?
      await handle.queryPermission(options) :
      handle.writable
        ? 'granted'
        : 'denied'
  }

  async requestPermission (options = {}) {
    if (options.readable) return 'granted'
    const handle = this[kAdapter$2];
    return handle.writable ? 'granted' : 'denied'
  }

  /**
   * Attempts to remove the entry represented by handle from the underlying file system.
   *
   * @param {object} options
   * @param {boolean} [options.recursive=false]
   */
  async remove (options = {}) {
    await this[kAdapter$2].remove(options);
  }

  /**
   * @param {FileSystemHandle} other
   */
  async isSameEntry (other) {
    if (this === other) return true
    if (this.kind !== other.kind) return false
    return this[kAdapter$2].isSameEntry(other[kAdapter$2])
  }
}

Object.defineProperty(FileSystemHandle.prototype, Symbol.toStringTag, {
  value: 'FileSystemHandle',
  writable: false,
  enumerable: false,
  configurable: true
});

/* global globalThis */

/** @type {typeof WritableStream} */
const ws = globalThis.WritableStream
// const ws = globalThis.WritableStream || await import('https://cdn.jsdelivr.net/npm/web-streams-polyfill@3/dist/ponyfill.es2018.mjs').then(r => r.WritableStream).catch(() => import('web-streams-polyfill').then(r => r.WritableStream));

class FileSystemWritableFileStream extends ws {
  constructor (...args) {
    super(...args);

    // Stupid Safari hack to extend native classes
    // https://bugs.webkit.org/show_bug.cgi?id=226201
    Object.setPrototypeOf(this, FileSystemWritableFileStream.prototype);

    /** @private */
    this._closed = false;
  }
  close () {
    this._closed = true;
    const w = this.getWriter();
    const p = w.close();
    w.releaseLock();
    return p
    // return super.close ? super.close() : this.getWriter().close()
  }

  /** @param {number} position */
  seek (position) {
    return this.write({ type: 'seek', position })
  }

  /** @param {number} size */
  truncate (size) {
    return this.write({ type: 'truncate', size })
  }

  write (data) {
    if (this._closed) {
      return Promise.reject(new TypeError('Cannot write to a CLOSED writable stream'))
    }

    const writer = this.getWriter();
    const p = writer.write(data);
    writer.releaseLock();
    return p
  }
}

Object.defineProperty(FileSystemWritableFileStream.prototype, Symbol.toStringTag, {
  value: 'FileSystemWritableFileStream',
  writable: false,
  enumerable: false,
  configurable: true
});

Object.defineProperties(FileSystemWritableFileStream.prototype, {
  close: { enumerable: true },
  seek: { enumerable: true },
  truncate: { enumerable: true },
  write: { enumerable: true }
});

const kAdapter$1 = Symbol('adapter');

class FileSystemFileHandle extends FileSystemHandle {
  /** @type {FileSystemFileHandle} */
  [kAdapter$1]

  constructor (adapter) {
    super(adapter);
    this[kAdapter$1] = adapter;
  }

  /**
   * @param  {Object} [options={}]
   * @param  {boolean} [options.keepExistingData]
   * @returns {Promise<FileSystemWritableFileStream>}
   */
  async createWritable (options = {}) {
    return new FileSystemWritableFileStream(
      await this[kAdapter$1].createWritable(options)
    )
  }

  /**
   * @returns {Promise<File>}
   */
  getFile () {
    return Promise.resolve(this[kAdapter$1].getFile())
  }
}

Object.defineProperty(FileSystemFileHandle.prototype, Symbol.toStringTag, {
  value: 'FileSystemFileHandle',
  writable: false,
  enumerable: false,
  configurable: true
});

Object.defineProperties(FileSystemFileHandle.prototype, {
  createWritable: { enumerable: true },
  getFile: { enumerable: true }
});

var FileSystemFileHandle$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': FileSystemFileHandle,
  FileSystemFileHandle: FileSystemFileHandle
});

const kAdapter = Symbol('adapter');

class FileSystemDirectoryHandle extends FileSystemHandle {
  /** @type {FileSystemDirectoryHandle} */
  [kAdapter]

  constructor (adapter) {
    super(adapter);
    this[kAdapter] = adapter;
  }

  /**
   * @param {string} name Name of the directory
   * @param {object} [options]
   * @param {boolean} [options.create] create the directory if don't exist
   * @returns {Promise<FileSystemDirectoryHandle>}
   */
  async getDirectoryHandle (name, options = {}) {
    if (name === '') throw new TypeError(`Name can't be an empty string.`)
    if (name === '.' || name === '..' || name.includes('/')) throw new TypeError(`Name contains invalid characters.`)
    return new FileSystemDirectoryHandle(await this[kAdapter].getDirectoryHandle(name, options))
  }

  /** @returns {AsyncGenerator<[string, FileSystemHandle], void, unknown>} */
  async * entries () {
    for await (const [_, entry] of this[kAdapter].entries())
      yield [entry.name, entry.kind === 'file' ? new FileSystemFileHandle(entry) : new FileSystemDirectoryHandle(entry)];
  }

  /** @deprecated use .entries() instead */
  async * getEntries() {
    console.warn('deprecated, use .entries() instead');
    for await (let entry of this[kAdapter].entries())
      yield entry.kind === 'file' ? new FileSystemFileHandle(entry) : new FileSystemDirectoryHandle(entry);
  }

  /**
   * @param {string} name Name of the file
   * @param {object} [options]
   * @param {boolean} [options.create] create the file if don't exist
   * @returns {Promise<FileSystemFileHandle>}
   */
  async getFileHandle (name, options = {}) {
    if (name === '') throw new TypeError(`Name can't be an empty string.`)
    if (name === '.' || name === '..' || name.includes('/')) throw new TypeError(`Name contains invalid characters.`)
    options.create = !!options.create;
    return new FileSystemFileHandle(await this[kAdapter].getFileHandle(name, options))
  }

  /**
   * @param {string} name
   * @param {object} [options]
   * @param {boolean} [options.recursive]
   */
  async removeEntry (name, options = {}) {
    if (name === '') throw new TypeError(`Name can't be an empty string.`)
    if (name === '.' || name === '..' || name.includes('/')) throw new TypeError(`Name contains invalid characters.`)
    options.recursive = !!options.recursive; // cuz node's fs.rm require boolean
    return this[kAdapter].removeEntry(name, options)
  }

  [Symbol.asyncIterator]() {
    return this.entries()
  }
}

Object.defineProperty(FileSystemDirectoryHandle.prototype, Symbol.toStringTag, {
	value: 'FileSystemDirectoryHandle',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(FileSystemDirectoryHandle.prototype, {
	getDirectoryHandle: { enumerable: true },
	entries: { enumerable: true },
	getFileHandle: { enumerable: true },
	removeEntry: { enumerable: true }
});

var FileSystemDirectoryHandle$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': FileSystemDirectoryHandle,
  FileSystemDirectoryHandle: FileSystemDirectoryHandle
});

/* global DataTransfer, DataTransferItem */

if (globalThis.DataTransferItem && !DataTransferItem.prototype.getAsFileSystemHandle) {
  DataTransferItem.prototype.getAsFileSystemHandle = async function () {
    const entry = this.webkitGetAsEntry();
    const [
      { FileHandle, FolderHandle },
      { FileSystemDirectoryHandle },
      { FileSystemFileHandle }
    ] = await Promise.all([
      Promise.resolve().then(function () { return sandbox$1; }),
      Promise.resolve().then(function () { return FileSystemDirectoryHandle$1; }),
      Promise.resolve().then(function () { return FileSystemFileHandle$1; })
    ]);

    return entry.isFile
      ? new FileSystemFileHandle(new FileHandle(entry, false))
      : new FileSystemDirectoryHandle(new FolderHandle(entry, false))
  };
}

/**
 * @param {object=} driver
 * @return {Promise<FileSystemDirectoryHandle>}
 */
async function getOriginPrivateDirectory (driver, options = {}) {
  if (typeof DataTransfer === 'function' && driver instanceof DataTransfer) {
    console.warn('deprecated getOriginPrivateDirectory(dataTransfer). Use "dt.items.getAsFileSystemHandle()"');
    const entries = Array.from(driver.items).map(item => item.webkitGetAsEntry());
    return Promise.resolve().then(function () { return util; }).then(m => m.fromDataTransfer(entries))
  }
  if (!driver) {
    return globalThis.navigator?.storage?.getDirectory() || globalThis.getOriginPrivateDirectory()
  }
  const module = await driver;
  const sandbox = module.default ? await module.default(options) : module(options);
  return new FileSystemDirectoryHandle(sandbox)
}

const errors = {
  INVALID: ['seeking position failed.', 'InvalidStateError'],
  GONE: ['A requested file or directory could not be found at the time an operation was processed.', 'NotFoundError'],
  MISMATCH: ['The path supplied exists, but was not an entry of requested type.', 'TypeMismatchError'],
  MOD_ERR: ['The object can not be modified in this way.', 'InvalidModificationError'],
  SYNTAX: m => [`Failed to execute 'write' on 'UnderlyingSinkBase': Invalid params passed. ${m}`, 'SyntaxError'],
  SECURITY: ['It was determined that certain files are unsafe for access within a Web application, or that too many calls are being made on file resources.', 'SecurityError'],
  DISALLOWED: ['The request is not allowed by the user agent or the platform in the current context.', 'NotAllowedError']
};

const config = {
  writable: globalThis.WritableStream
};

async function fromDataTransfer (entries) {
  console.warn('deprecated fromDataTransfer - use `dt.items[0].getAsFileSystemHandle()` instead');
  const [memory, sandbox, FileSystemDirectoryHandle] = await Promise.all([
    Promise.resolve().then(function () { return memory$1; }),
    Promise.resolve().then(function () { return sandbox$1; }),
    Promise.resolve().then(function () { return FileSystemDirectoryHandle$1; })
  ]);

  const folder = new memory.FolderHandle('', false);
  folder._entries = entries.map(entry => entry.isFile
    ? new sandbox.FileHandle(entry, false)
    : new sandbox.FolderHandle(entry, false)
  );

  return new FileSystemDirectoryHandle.default(folder)
}

async function fromInput (input) {
  const { FolderHandle, FileHandle } = await Promise.resolve().then(function () { return memory$1; });
  const dir = await Promise.resolve().then(function () { return FileSystemDirectoryHandle$1; });
  const file = await Promise.resolve().then(function () { return FileSystemFileHandle$1; });
  const FileSystemDirectoryHandle = dir.default;
  const FileSystemFileHandle = file.default;

  const files = [...input.files];
  if (input.webkitdirectory) {
    const rootName = files[0].webkitRelativePath.split('/', 1)[0];
    const root = new FolderHandle(rootName, false);
    files.forEach(file => {
      const path = file.webkitRelativePath.split('/');
      path.shift();
      const name = path.pop();
      const dir = path.reduce((dir, path) => {
        if (!dir._entries[path]) dir._entries[path] = new FolderHandle(path, false);
        return dir._entries[path]
      }, root);
      dir._entries[name] = new FileHandle(file.name, file, false);
    });
    return new FileSystemDirectoryHandle(root)
  } else {
    const files = Array.from(input.files).map(file =>
      new FileSystemFileHandle(new FileHandle(file.name, file, false))
    );
    if (input.multiple) {
      return files
    } else {
      return files[0]
    }
  }
}

var util = /*#__PURE__*/Object.freeze({
  __proto__: null,
  errors: errors,
  config: config,
  fromDataTransfer: fromDataTransfer,
  fromInput: fromInput
});

/* global Blob, DOMException, Response, MessageChannel */

const { GONE: GONE$1 } = errors;
// @ts-ignore
const isSafari = /constructor/i.test(window.HTMLElement) || window.safari || window.WebKitPoint;
let TransformStream = globalThis.TransformStream;
let WritableStream = globalThis.WritableStream;

class FileHandle$2 {
  constructor (name = 'unkown') {
    this.name = name;
    this.kind = 'file';
  }

  getFile () {
    throw new DOMException(...GONE$1)
  }

  /**
   * @param {object} [options={}]
   */
  async createWritable (options = {}) {
    if (!TransformStream) {
      // @ts-ignore
      const ponyfill = await import('https://cdn.jsdelivr.net/npm/web-streams-polyfill@2.1.1/dist/ponyfill.es2018.mjs');
      TransformStream = ponyfill.TransformStream;
      WritableStream = ponyfill.WritableStream;
    }
    const sw = await navigator.serviceWorker.getRegistration();
    const link = document.createElement('a');
    const ts = new TransformStream();
    const sink = ts.writable;

    link.download = this.name;

    if (isSafari || !sw) {
      let chunks = [];
      ts.readable.pipeTo(new WritableStream({
        write (chunk) {
          chunks.push(new Blob([chunk]));
        },
        close () {
          const blob = new Blob(chunks, { type: 'application/octet-stream; charset=utf-8' });
          chunks = [];
          link.href = URL.createObjectURL(blob);
          link.click();
          setTimeout(() => URL.revokeObjectURL(link.href), 10000);
        }
      }));
    } else {
      const { writable, readablePort } = new RemoteWritableStream(WritableStream);
      // Make filename RFC5987 compatible
      const fileName = encodeURIComponent(this.name).replace(/['()]/g, escape).replace(/\*/g, '%2A');
      const headers = {
        'content-disposition': "attachment; filename*=UTF-8''" + fileName,
        'content-type': 'application/octet-stream; charset=utf-8',
        ...(options.size ? { 'content-length': options.size } : {})
      };

      const keepAlive = setTimeout(() => sw.active.postMessage(0), 10000);

      ts.readable.pipeThrough(new TransformStream({
        transform (chunk, ctrl) {
          if (chunk instanceof Uint8Array) return ctrl.enqueue(chunk)
          const reader = new Response(chunk).body.getReader();
          const pump = _ => reader.read().then(e => e.done ? 0 : pump(ctrl.enqueue(e.value)));
          return pump()
        }
      })).pipeTo(writable).finally(() => {
        clearInterval(keepAlive);
      });

      // Transfer the stream to service worker
      sw.active.postMessage({
        url: sw.scope + fileName,
        headers,
        readablePort
      }, [readablePort]);

      // Trigger the download with a hidden iframe
      const iframe = document.createElement('iframe');
      iframe.hidden = true;
      iframe.src = sw.scope + fileName;
      document.body.appendChild(iframe);
    }

    return sink.getWriter()
  }
}

const WRITE = 0;
const PULL = 0;
const ERROR = 1;
const ABORT = 1;
const CLOSE = 2;

class MessagePortSink {
  constructor (port) {
    this._port = port;
    this._resetReady();
    this._port.onmessage = event => this._onMessage(event.data);
  }

  start (controller) {
    this._controller = controller;
    // Apply initial backpressure
    return this._readyPromise
  }

  write (chunk) {
    const message = { type: WRITE, chunk };

    // Send chunk
    this._port.postMessage(message, [chunk.buffer]);

    // Assume backpressure after every write, until sender pulls
    this._resetReady();

    // Apply backpressure
    return this._readyPromise
  }

  close () {
    this._port.postMessage({ type: CLOSE });
    this._port.close();
  }

  abort (reason) {
    this._port.postMessage({ type: ABORT, reason });
    this._port.close();
  }

  _onMessage (message) {
    if (message.type === PULL) this._resolveReady();
    if (message.type === ERROR) this._onError(message.reason);
  }

  _onError (reason) {
    this._controller.error(reason);
    this._rejectReady(reason);
    this._port.close();
  }

  _resetReady () {
    this._readyPromise = new Promise((resolve, reject) => {
      this._readyResolve = resolve;
      this._readyReject = reject;
    });
    this._readyPending = true;
  }

  _resolveReady () {
    this._readyResolve();
    this._readyPending = false;
  }

  _rejectReady (reason) {
    if (!this._readyPending) this._resetReady();
    this._readyPromise.catch(() => {});
    this._readyReject(reason);
    this._readyPending = false;
  }
}

class RemoteWritableStream {
  constructor (WritableStream) {
    const channel = new MessageChannel();
    this.readablePort = channel.port1;
    this.writable = new WritableStream(
      new MessagePortSink(channel.port2)
    );
  }
}

var downloader = /*#__PURE__*/Object.freeze({
  __proto__: null,
  FileHandle: FileHandle$2
});

/* global Blob, DOMException */

const { DISALLOWED: DISALLOWED$1 } = errors;

class Sink$1 {
  /**
   * @param {FileWriter} writer
   * @param {FileEntry} fileEntry
   */
  constructor (writer, fileEntry) {
    this.writer = writer;
    this.fileEntry = fileEntry;
  }

  /**
   * @param {BlobPart | Object} chunk
   */
  async write (chunk) {
    if (typeof chunk === 'object') {
      if (chunk.type === 'write') {
        if (Number.isInteger(chunk.position) && chunk.position >= 0) {
          this.writer.seek(chunk.position);
          if (this.writer.position !== chunk.position) {
            await new Promise((resolve, reject) => {
              this.writer.onwriteend = resolve;
              this.writer.onerror = reject;
              this.writer.truncate(chunk.position);
            });
            this.writer.seek(chunk.position);
          }
        }
        if (!('data' in chunk)) {
          throw new DOMException('Failed to execute \'write\' on \'UnderlyingSinkBase\': Invalid params passed. write requires a data argument', 'SyntaxError')
        }
        chunk = chunk.data;
      } else if (chunk.type === 'seek') {
        if (Number.isInteger(chunk.position) && chunk.position >= 0) {
          this.writer.seek(chunk.position);
          if (this.writer.position !== chunk.position) {
            throw new DOMException('seeking position failed', 'InvalidStateError')
          }
          return
        } else {
          throw new DOMException('Failed to execute \'write\' on \'UnderlyingSinkBase\': Invalid params passed. seek requires a position argument', 'SyntaxError')
        }
      } else if (chunk.type === 'truncate') {
        return new Promise(resolve => {
          if (Number.isInteger(chunk.size) && chunk.size >= 0) {
            this.writer.onwriteend = evt => resolve();
            this.writer.truncate(chunk.size);
          } else {
            throw new DOMException('Failed to execute \'write\' on \'UnderlyingSinkBase\': Invalid params passed. truncate requires a size argument', 'SyntaxError')
          }
        })
      }
    }
    await new Promise((resolve, reject) => {
      this.writer.onwriteend = resolve;
      this.writer.onerror = reject;
      this.writer.write(new Blob([chunk]));
    });
  }

  close () {
    return new Promise(this.fileEntry.file.bind(this.fileEntry))
  }
}

class FileHandle$1 {
  /** @param {FileEntry} file */
  constructor (file, writable = true) {
    this.file = file;
    this.kind = 'file';
    this.writable = writable;
    this.readable = true;
  }

  get name () {
    return this.file.name
  }

  isSameEntry (other) {
    return this === other
  }

  /** @return {Promise<File>} */
  getFile () {
    return new Promise(this.file.file.bind(this.file))
  }

  /** @return {Promise<Sink>} */
  createWritable (opts) {
    if (!this.writable) throw new DOMException(...DISALLOWED$1)

    return new Promise((resolve, reject) =>
      this.file.createWriter(fileWriter => {
        if (opts.keepExistingData === false) {
          fileWriter.onwriteend = evt => resolve(new Sink$1(fileWriter, this.file));
          fileWriter.truncate(0);
        } else {
          resolve(new Sink$1(fileWriter, this.file));
        }
      }, reject)
    )
  }
}

class FolderHandle$1 {
  /** @param {DirectoryEntry} dir */
  constructor (dir, writable = true) {
    this.dir = dir;
    this.writable = writable;
    this.readable = true;
    this.kind = 'directory';
    this.name = dir.name;
  }

  /** @param {FolderHandle} other */
  isSameEntry (other) {
    return this.dir.fullPath === other.dir.fullPath
  }

  async * entries () {
    const reader = this.dir.createReader();
    const entries = await new Promise(reader.readEntries.bind(reader));
    for (const x of entries) {
      yield [x.name, x.isFile ? new FileHandle$1(x, this.writable) : new FolderHandle$1(x, this.writable)];
    }
  }

  /**
   * @param {string} name
   * @returns {Promise<FolderHandle>}
   */
  getDirectoryHandle (name, opts = {}) {
    return new Promise((resolve, reject) => {
      this.dir.getDirectory(name, opts, dir => {
        resolve(new FolderHandle$1(dir));
      }, reject);
    })
  }

  /**
   * @param {string} name
   * @returns {Promise<FileHandle>}
   */
  getFileHandle (name, opts = {}) {
    return new Promise((resolve, reject) =>
      this.dir.getFile(name, opts, file => resolve(new FileHandle$1(file)), reject)
    )
  }

  /**
   * @param {string} name
   * @param {{ recursive: any; }} opts
   */
  async removeEntry (name, opts) {
    /** @type {Error|FolderHandle|FileHandle} */
    const entry = await this.getDirectoryHandle(name).catch(err =>
      err.name === 'TypeMismatchError' ? this.getFileHandle(name) : err
    );

    if (entry instanceof Error) throw entry

    return new Promise((resolve, reject) => {
      if (entry instanceof FolderHandle$1) {
        opts.recursive
          ? entry.dir.removeRecursively(() => resolve(), reject)
          : entry.dir.remove(() => resolve(), reject);
      } else if (entry.file) {
        entry.file.remove(() => resolve(), reject);
      }
    })
  }
}

var sandbox = (opts = {}) => new Promise((resolve, reject) =>
  window.webkitRequestFileSystem(
    opts._persistent, 0,
    e => resolve(new FolderHandle$1(e.root)),
    reject
  )
);

var sandbox$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  FileHandle: FileHandle$1,
  FolderHandle: FolderHandle$1,
  'default': sandbox
});

/** @type {typeof window.File} */
// const File = globalThis.File || await import('fetch-blob/file.js').then(m => m.File);
const File = globalThis.File;
/** @type {typeof window.Blob} */
// const Blob$1 = globalThis.Blob || await import('fetch-blob').then(m => m.Blob);
const Blob$1 = globalThis.Blob

const { INVALID, GONE, MISMATCH, MOD_ERR, SYNTAX, SECURITY, DISALLOWED } = errors;

class Sink {
  /** @param {FileHandle} fileHandle */
  constructor (fileHandle) {
    this.fileHandle = fileHandle;
    this.file = fileHandle.file;
    this.size = fileHandle.file.size;
    this.position = 0;
  }
  write (chunk) {
    let file = this.file;

    if (typeof chunk === 'object') {
      if (chunk.type === 'write') {
        if (Number.isInteger(chunk.position) && chunk.position >= 0) {
          this.position = chunk.position;
          if (this.size < chunk.position) {
            this.file = new File(
              [this.file, new ArrayBuffer(chunk.position - this.size)],
              this.file.name,
              this.file
            );
          }
        }
        if (!('data' in chunk)) {
          throw new DOMException(...SYNTAX('write requires a data argument'))
        }
        chunk = chunk.data;
      } else if (chunk.type === 'seek') {
        if (Number.isInteger(chunk.position) && chunk.position >= 0) {
          if (this.size < chunk.position) {
            throw new DOMException(...INVALID)
          }
          this.position = chunk.position;
          return
        } else {
          throw new DOMException(...SYNTAX('seek requires a position argument'))
        }
      } else if (chunk.type === 'truncate') {
        if (Number.isInteger(chunk.size) && chunk.size >= 0) {
          file = chunk.size < this.size
            ? new File([file.slice(0, chunk.size)], file.name, file)
            : new File([file, new Uint8Array(chunk.size - this.size)], file.name);

          this.size = file.size;
          if (this.position > file.size) {
            this.position = file.size;
          }
          this.file = file;
          return
        } else {
          throw new DOMException(...SYNTAX('truncate requires a size argument'))
        }
      }
    }

    chunk = new Blob$1([chunk]);

    let blob = this.file;
    // Calc the head and tail fragments
    const head = blob.slice(0, this.position);
    const tail = blob.slice(this.position + chunk.size);

    // Calc the padding
    let padding = this.position - head.size;
    if (padding < 0) {
      padding = 0;
    }
    blob = new File([
      head,
      new Uint8Array(padding),
      chunk,
      tail
    ], blob.name);

    this.size = blob.size;
    this.position += chunk.size;

    this.file = blob;
  }
  close () {
    if (this.fileHandle.deleted) throw new DOMException(...GONE)
    this.fileHandle.file = this.file;
    this.file =
    this.position =
    this.size = null;
    if (this.fileHandle.onclose) {
      this.fileHandle.onclose(this.fileHandle);
    }
  }
}

class FileHandle {
  constructor (name = '', file = new File([], name), writable = true) {
    this.file = file;
    this.name = name;
    this.kind = 'file';
    this.deleted = false;
    this.writable = writable;
    this.readable = true;
  }

  getFile () {
    if (this.deleted) throw new DOMException(...GONE)
    return this.file
  }

  createWritable (opts) {
    if (!this.writable) throw new DOMException(...DISALLOWED)
    if (this.deleted) throw new DOMException(...GONE)
    return new Sink(this)
  }

  isSameEntry (other) {
    return this === other
  }

  destroy () {
    this.deleted = true;
    this.file = null;
  }
}

class FolderHandle {

  /** @param {string} name */
  constructor (name, writable = true) {
    this.name = name;
    this.kind = 'directory';
    this.deleted = false;
    /** @type {Object.<string, (FolderHandle|FileHandle)>} */
    this._entries = {};
    this.writable = writable;
    this.readable = true;
  }

  async * entries () {
    if (this.deleted) throw new DOMException(...GONE)
    yield* Object.entries(this._entries);
  }

  isSameEntry (other) {
    return this === other
  }

  /** @param {string} name */
  getDirectoryHandle (name, opts = {}) {
    if (this.deleted) throw new DOMException(...GONE)
    const entry = this._entries[name];
    if (entry) { // entry exist
      if (entry instanceof FileHandle) {
        throw new DOMException(...MISMATCH)
      } else {
        return entry
      }
    } else {
      if (opts.create) {
        return (this._entries[name] = new FolderHandle(name))
      } else {
        throw new DOMException(...GONE)
      }
    }
  }

  /** @param {string} name */
  getFileHandle (name, opts = {}) {
    const entry = this._entries[name];
    const isFile = entry instanceof FileHandle;
    if (entry && isFile) return entry
    if (entry && !isFile) throw new DOMException(...MISMATCH)
    if (!entry && !opts.create) throw new DOMException(...GONE)
    if (!entry && opts.create) {
      return (this._entries[name] = new FileHandle(name))
    }
  }

  removeEntry (name, opts) {
    const entry = this._entries[name];
    if (!entry) throw new DOMException(...GONE)
    entry.destroy(opts.recursive);
    delete this._entries[name];
  }

  destroy (recursive) {
    for (let x of Object.values(this._entries)) {
      if (!recursive) throw new DOMException(...MOD_ERR)
      x.destroy(recursive);
    }
    this._entries = {};
    this.deleted = true;
  }
}

const fs = new FolderHandle('');

var memory = opts => fs;

var memory$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Sink: Sink,
  FileHandle: FileHandle,
  FolderHandle: FolderHandle,
  'default': memory
});

export { FileSystemDirectoryHandle, FileSystemFileHandle, FileSystemHandle, FileSystemWritableFileStream, getOriginPrivateDirectory, showDirectoryPicker, showOpenFilePicker, showSaveFilePicker };
