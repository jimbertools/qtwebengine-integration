<template>
    <div class="dialog-wrapper" v-if="url">
        <div class="dialog">
            <h1>Leaving secure isolation</h1>
            <div>
                <p>
                    You are trying to visit an external and potentially dangerous site outside of the secure app
                    isolation.
                </p>
                <p>Are you sure you want to continue?</p>
                <p class="url">{{ url }}</p>
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
                    virtualBrowser,
                };
            },
            mounted() {},
            computed: {
                url() {
                    return virtualBrowser.externalUrlToOpen;
                },
            },
            methods: {
                yes() {
                    window.location = virtualBrowser.externalUrlToOpen;
                    // window.open(virtualBrowser.externalUrlToOpen);
                    // window.open(virtualBrowser.externalUrlToOpen, "_blank", 'noopener');
                    virtualBrowser.externalUrlToOpen = null;
                    if (virtualBrowser.shouldCleanupWindow) {
                        // window.close();
                    }
                },
                cancel() {
                    virtualBrowser.externalUrlToOpen = null;
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
