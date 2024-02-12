// We create impls for abstraction and queue usage
// Sometimes elements and actions on elements come in a weird order
// Creating impls with some abstraction makes for a little bit more readability
export class MSEHandler {
    constructor() {
        this.mediaSourceImpls = new Map();
        window.toet = this.mediaSourceImpls;
        this.locked = false;
        this.buffersToBeProcessed = [];
    }

    async createMediaSource(id) {
        // console.log("MSE::createMediaSource", id)
        let mediaSourceImpl = new MediaSourceImpl(id);
        this.mediaSourceImpls.set(id, mediaSourceImpl);
    }

    closeMediaSource(mediaSourceId) {
        // console.log("MSE::closeMediaSource", mediaSourceId)
        let mediaSourceImpl = this.mediaSourceImpls.get(mediaSourceId);
        mediaSourceImpl.close();
        this.mediaSourceImpls.delete(mediaSourceId);
    }

    async addSourceBuffer(mediaSourceId, sourceBufferId, type, codecs) {
        let mediaSourceImpl = this.mediaSourceImpls.get(mediaSourceId);
        mediaSourceImpl.addSourceBuffer(sourceBufferId, type, codecs);
    }

    async appendData(mediaSourceId, sourceBufferId, data) {
        const mediaSource = this.mediaSourceImpls.get(mediaSourceId);
        // console.log(mediaSource)
        let sourceBufferImpl = mediaSource.getSourceBufferById(sourceBufferId);
        sourceBufferImpl.appendData(data);
    }

    attachMediaSourceToElement(element, mediaSourceId) {
        let mediaSourceImpl = this.mediaSourceImpls.get(mediaSourceId);
        mediaSourceImpl.attachToElement(element);
        return;
    }

    markEndOfStream(mediaSourceId) {
        let mediaSource = this.mediaSourceImpls.get(mediaSourceId);
        return;
    }

    resetSourceBufferParser(mediaSourceId, sourceBufferId) {
        const mediaSourceImpl = this.mediaSourceImpls.get(mediaSourceId);
        let sourceBufferImpl = mediaSourceImpl.getSourceBufferById(sourceBufferId);
        sourceBufferImpl.resetParser();
    }
}

class MediaSourceImpl {
    constructor(mediaSourceId) {
        this.id = mediaSourceId;
        this.mediaSource = new MediaSource();
        this.sourceBufferImpls = new Map();
        this.objectUrl = null;
        this.playerElement = null;
        // this.testobjecturl = null;
        this.mediaSource.addEventListener('sourceclose', e => {
            console.log('MediaSourceImpl::sourceclose', this.id, this.mediaSource.readyState);
        });
        this.mediaSource.addEventListener('sourceopen', () => {
            for (let sourceBufferImpl of this.sourceBufferImpls.values()) {
                if (!sourceBufferImpl.hasSourcebuffer()) {
                    let sourceBuffer = this.mediaSource.addSourceBuffer(
                        `${sourceBufferImpl.getType()}; codecs="${sourceBufferImpl.getCodecs()}"`
                    );
                    sourceBufferImpl.setSourceBuffer(sourceBuffer);
                }
            }
        });
    }
    getSourceBufferById(sourceBufferId) {
        return this.sourceBufferImpls.get(sourceBufferId);
    }
    addSourceBuffer(sourceBufferId, type, codecs) {
        let sourceBufferImpl = new SourceBufferImpl(sourceBufferId, type, codecs, this);
        this.sourceBufferImpls.set(sourceBufferImpl.getId(), sourceBufferImpl);

        if (this.mediaSource && this.mediaSource.readyState !== 'open') {
            console.warn(
                'MediaSourceImpl::addSourceBuffer',
                this.id,
                'is not open yet. Could not attach',
                sourceBufferId,
                codecs
            );
            return;
        }

        let sourceBuffer = this.mediaSource.addSourceBuffer(`${type}; codecs="${codecs}"`);
        sourceBufferImpl.setSourceBuffer(sourceBuffer);
    }
    attachToElement(element) {
        this.playerElement = element;
        this.objectUrl = URL.createObjectURL(this.mediaSource);
        this.playerElement.src = this.objectUrl;
        if (this.playerElement.shouldPlay) {
            this.playerElement.play();
            delete this.playerElement.shouldPlay;
        }
    }
    close() {
        console.log('revoking', this.objectUrl);
        URL.revokeObjectURL(this.objectUrl);
        this.playerElement.removeAttribute('src');
    }

    notifySourceBufferUpdateEnd() {
        if (this.playerElement.shouldPlay) {
            this.playerElement.play();
            delete this.playerElement.shouldPlay;
        }
    }
}

class SourceBufferImpl {
    constructor(id, type, codecs, mediaSourceImpl) {
        console.log('Creating sourcebufferimpl', type, codecs);
        this.id = id;
        this.type = type;
        this.codecs = codecs;
        this.sourceBuffer = null;
        this.buffersToBeProcessed = [];
        this.ctr = 0;
        this.mediaSourceImpl = mediaSourceImpl;
    }
    getType() {
        return this.type;
    }
    getCodecs() {
        return this.codecs;
    }

    setSourceBuffer(buffer) {
        this.sourceBuffer = buffer;
        this.sourceBuffer.addEventListener(
            'error',
            e => {
                console.log('onerror', e);
            },
            false
        );
        this.sourceBuffer.addEventListener(
            'abort',
            e => {
                console.log('abort', e);
            },
            false
        );
        this.sourceBuffer.addEventListener(
            'updateend',
            e => {
                if (this.buffersToBeProcessed.length && !this.sourceBuffer.updating) {
                    this.sourceBuffer.appendBuffer(this.buffersToBeProcessed.shift());
                    // console.log(e)
                    this.mediaSourceImpl.notifySourceBufferUpdateEnd();
                }
            },
            false
        );

        if (this.buffersToBeProcessed.length && !this.sourceBuffer.updating) {
            this.sourceBuffer.appendBuffer(this.buffersToBeProcessed.shift());
        }
    }

    appendData(data) {
        if (!this.hasSourcebuffer()) {
            this.buffersToBeProcessed.push(data);
        } else if (this.buffersToBeProcessed.length) {
            this.buffersToBeProcessed.push(data);
        } else if (this.sourceBuffer.updating) {
            this.buffersToBeProcessed.push(data);
        } else {
            this.sourceBuffer.appendBuffer(data);
        }
    }

    hasSourcebuffer() {
        return !!this.sourceBuffer;
    }

    setAppendWindowStart(start) {
        // this.sourceBuffer.appendWindowStart = start;
    }
    setAppendWindowEnd(end) {
        if (end == 'inf') {
            console.log('setting end to Infinity');
            end = 'Infinity';
        }
        // this.sourceBuffer.appendWindowEnd = Infinity;
    }
    resetParser() {
        console.log('resetting parser');
        this.sourceBuffer.abort();
    }
    getId() {
        return this.id;
    }
}
