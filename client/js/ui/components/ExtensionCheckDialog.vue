<template>
    <section class="extension-check-dialog" v-if="!canAccessLocalStorage">
        <div class="content">
            <img id="jimberlogo" src="/img/jimber/jimber_logo.svg" alt="Jimber Logo" />
            <h1>Browser Isolation</h1>
            <p>
                We need access to the Browser Session Storage to function correctly, please make sure you are not
                running in private or incognito mode.
            </p>
        </div>
    </section>
</template>
<script>
    module.exports = new Promise(async (resolve, reject) => {
        resolve({
            name: 'ExtensionCheckDialog',
            components: {},
            props: [],
            data() {
                return {
                    canAccessLocalStorage: true,
                };
            },
            computed: {},
            mounted() {
                try {
                    window.sessionStorage.getItem('someitem');
                } catch (error) {
                    this.canAccessLocalStorage = false;
                }
            },
            methods: {},
            watch: {},
        });
    });
</script>
<style scoped>
    .extension-check-dialog {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 2;
        background: white;
        display: grid;
        place-items: center;
        overflow: auto;
    }
    img {
        max-width: 150px;
        margin-bottom: 50px;
    }
    .content {
        font-size: 1em;
        line-height: 1.55;
        margin: 0 auto;
        max-width: 600px;
        margin-bottom: 300px;
        padding: 100px 30px;
    }
    h1 {
        margin-bottom: 30px;
        font-size: 3em;
        color: #35383b;
    }
    p {
        margin-bottom: 10px;
        color: #5d6267;
    }
    .error p {
        color: red;
        margin-bottom: 0;
    }
</style>
