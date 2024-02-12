<template>
    <section class="password-manager-popup">
        <div>
            <button class="btn-close" @click="close">
                <img src="/img/jimber/close.svg" />
            </button>

            <div class="header">
                <img src="/img/jimber/googlepwbanner.png" /><br />
                Are you sure you want to reset your password manager? All your credentials will be lost forever.
            </div>
            <div class="content">
                <br />
                <label for="message">Please type: <span class="message">Yes, I am sure</span></label>
                <input type="text" autocomplete="off" id="message" name="message" class="input" v-model="message" />
                <div class="buttons">
                    <button @click="close" class="cancel-btn">Cancel</button>
                    <button @click="resetPasswordManager" class="reset-btn">Reset</button>
                </div>
            </div>
            <footer>Because we do not store your master password, we can not recover your passwords.</footer>
        </div>
    </section>
</template>
<script>
    module.exports = new Promise(async (resolve, reject) => {
        const { passwordHandler } = await import('/js/state/PasswordHandler.js');

        resolve({
            name: 'SaveCredentialsDialog',
            components: {},
            props: [],
            data() {
                return {
                    message: null,
                };
            },
            computed: {},
            mounted() {},
            methods: {
                close() {
                    this.$store.state.showResetPasswordManagerDialog = false;
                },
                resetPasswordManager() {
                    if (this.message !== 'Yes, I am sure') {
                        this.message = '';
                        return;
                    }
                    passwordHandler.resetPasswordManager();
                    this.close();
                },
            },
            watch: {},
        });
    });
</script>
<style scoped>
    .password-manager-popup {
        max-width: 330px;
        position: absolute;
        top: 10px;
        right: 100px;
        z-index: 1;

        background-color: #fff;
        color: rgb(48, 48, 48);

        border-radius: 2px;
        border-color: rgb(209, 209, 209);
        border-width: 1px;
        border-style: solid;

        box-shadow: 0 1px 6px rgba(60, 64, 67, 0.28);

        font-size: 1rem;
    }

    .header {
        padding: 0px 20px 0 20px;
    }

    .content {
        padding: 0px 20px 10px 20px;
    }

    .input {
        padding-left: 5px;
        padding-top: 8px;
        padding-right: 5px;
        padding-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;

        border: none;
        color: #000;
        margin-top: 10px;
        border: 1px solid rgb(224, 224, 224);
        border-radius: 2px;
        width: 96%;
    }
    .reset-btn {
        color: #fff;
        background-color: #ff5252;
    }
    .buttons {
        margin-top: 20px;
        text-align: right;
        margin-bottom: 10px;
    }

    button {
        display: inline-block;
        padding: 10px 18px 10px 18px;
        border-radius: 4px;
        border: none;
        font-weight: bold;
        margin-left: 10px;
    }
    button:hover {
        cursor: pointer;
    }

    .cancel-btn {
        box-shadow: 0 0 2px 0px rgb(117, 117, 117);
        color: #4e8be8;
        background-color: #fff;
    }

    footer {
        border-top: 1px solid rgb(209, 209, 209);
        background-color: #f8f9fa;
        padding: 20px 20px 20px 20px;
        color: #86898d;
        font-size: 0.9rem;
    }

    .btn-close {
        padding: 0;
        margin: 2px 2px 0 0;
        border: none;
        background: none;
        width: 25px;
        height: 25px;
        opacity: 0.5;
        float: right;
    }
    .btn-close:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }
    .message {
        background-color: #f8f9fa;
        padding: 2px 5px 2px 5px;
    }
</style>
