<template>
    <section class="onboarding-dialog" id="onboarding-dialog">
        <div class="content">
            <img id="jimberlogo" src="/img/jimber/jimber_logo.svg" alt="Jimber Logo" />
            <h1>Browser Isolation</h1>

            <p v-if="isFirefox">
                We recommend using Google Chrome to give you the best browsing experience.<br />
                We are working very hard to support all mayor browsers, we are sorry for the inconvenience.
            </p>

            <p>
                With Jimber Browser Isolation, an extra layer, a container, is built between the Internet and the
                computers within your company. A virus or cyberattack is stopped in the isolated Jimber container. They
                are removed when the session is closed and no longer pose a threat to your organization.
            </p>
            <p>
                This is the first time you use the Jimber Browser, please allow clipboard permissions to be able to
                unlock all functionality. Without this permission, certain keyboard and copy/paste features will not be
                usable.
            </p>
            <p>Surf's up!</p>

            <button v-if="showRequestPermissionButton" v-on:click="requestPermissions">Request permissions</button>

            <div v-if="clipboardAccessDenied" class="error">
                <button v-on:click="continueAnyway">Continue anyway</button>
                <p>You seem to have disallowed clipboard access, expect things to misbehave!</p>
            </div>

            <div v-if="showArrow" class="arrow"></div>
        </div>
    </section>
</template>

<script>
    module.exports = new Promise(async (resolve, reject) => {
        resolve({
            name: 'OnboardingDialog',
            components: {},
            props: [],
            data() {
                return {
                    showArrow: false,
                    isFirefox: false,
                    clipboardAccessDenied: false,
                    showRequestPermissionButton: true,
                    focusListener: null,
                };
            },
            computed: {},
            mounted() {
                this.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            },
            methods: {
                requestPermissions() {
                    this.showArrow = true;
                    navigator.clipboard
                        .read()
                        .then(clipboardItem => {
                            this.$store.state.showOnboardingDialog = false;
                        })
                        .catch(reason => {
                            if (reason.name === 'NotAllowedError') {
                                this.clipboardAccessDenied = true;
                                this.showRequestPermissionButton = false;
                                return;
                            }
                            this.$store.state.showOnboardingDialog = false;
                        });
                },
                continueAnyway() {
                    this.$store.state.showOnboardingDialog = false;
                    localStorage.setItem('onboarding', 'seen');
                },
            },
            watch: {},
        });
    });
</script>
<style scoped>
    .onboarding-dialog {
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
    button {
        border: 0;
        background: #00aeef;
        color: white;
        border-radius: 4px;
        box-sizing: border-box;
        cursor: pointer;
        float: right;
        font-size: 0.875em;
        margin: 0;
        padding: 8px 16px;
        transition: box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
    }
</style>
