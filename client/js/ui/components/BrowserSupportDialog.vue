<template>
    <div class="dialog-wrapper" v-if="showDialog">
        <div class="dialog">
            <h1>Jimber Browser Isolation not yet fully supported!</h1>
            <div>
                <p>
                    For now, Jimber Browser Isolation is currently optimized for Google Chrome only, please use
                    <a href="https://www.google.com/intl/nl/chrome/" target="_blank">Google Chrome</a>.
                </p>
                <!-- <button @click="closeDialog">Continue anyway</button> -->
            </div>
        </div>
    </div>
</template>
<script>
module.exports = new Promise(async (resolve, reject) => {
    resolve({
        data() {
            return {
                showDialog: true,
            };
        },
        mounted() {
            if (/truncus/.test(window.location.hostname), /vault/.test(window.location.hostname)) {
                this.closeDialog();
                return;
            }
            if (!!window.chrome) {
                this.closeDialog();
            }
        },
        methods: {
            closeDialog() {
                this.$store.state.showBrowserSupport = false;
                localStorage.setItem('browserSupport', 'seen');
                this.showDialog = false;
            },
        },
    });
});
</script>
