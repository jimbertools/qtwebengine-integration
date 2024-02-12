<template>
    <section class="password-manager-popup fade-in">
        <div>
            <button class="btn-close" @click="close">
                <img src="/img/jimber/close.svg" />
            </button>

            <div class="header">
                <img src="/img/jimber/googlepwbanner.png" /><br />
                Do you want the jimber browser to remember your passwords?
            </div>
            <div class="content">
                <br />
                <div class="form-entry">
                    <label for="username">Username</label>
                    <input
                        type="text"
                        name="username"
                        v-model="passwordHandler.submittedCredentialForm.username"
                        autocomplete="off"
                        class="username-input"
                    />
                </div>
                <br />
                <div class="form-entry">
                    <label for="Password">Password</label>
                    <input
                        type="password"
                        name="password"
                        v-model="passwordHandler.submittedCredentialForm.password"
                        autocomplete="off"
                        class="password-input"
                    />
                </div>
                <br />
                <div class="form-entry" v-if="shouldShowNeverAskMeAgainOption">
                    <label for="neveraskmeagain">Never ask me again</label
                    ><input
                        type="checkbox"
                        v-model="neveraskmeagain"
                        name="neveraskmeagain"
                        class="neveraskmeagain-checkbox"
                        id="neveraskmeagain"
                    />
                </div>
                <br />
                <div class="buttons">
                    <button @click="cancel" class="cancel-btn">Cancel</button>
                    <button @click="save" class="save-btn" :disabled="neveraskmeagain">Save</button>
                </div>
            </div>
            <footer>
                Passwords are safely stored on your browser instance so they'll be waiting for you to get back.
            </footer>
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
                    passwordHandler: passwordHandler,
                    password: '',
                    neveraskmeagain: false,
                };
            },
            computed: {
                shouldShowNeverAskMeAgainOption() {
                    return localStorage.getItem('showneveraskmeagain') === 'true';
                },
            },
            mounted() {},
            methods: {
                async save() {
                    localStorage.removeItem('showneveraskmeagain');
                    if (!passwordHandler.isKeyLoaded()) {
                        this.$store.state.credentialsToBeSubmitted = passwordHandler.submittedCredentialForm;
                        this.$store.state.showMasterPasswordCreationDialog = true;
                        this.close();
                        return;
                    }
                    await passwordHandler.saveCredentials({
                        domain: passwordHandler.submittedCredentialForm.domain,
                        username: passwordHandler.submittedCredentialForm.username,
                        password: passwordHandler.submittedCredentialForm.password,
                    });
                    this.close();
                },
                cancel() {
                    if (this.neveraskmeagain) {
                        localStorage.setItem('passwordmanager', 'disabled');
                        this.$store.state.passwordManagerDisabled = true;
                    }
                    localStorage.setItem('showneveraskmeagain', 'true');
                    passwordHandler.submittedCredentialForm = null;
                },
                close() {
                    passwordHandler.submittedCredentialForm = null;
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

        /* box-shadow: 0 0 2px 0px #000; */
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

    .form-entry {
        justify-content: space-between;
        display: flex;
        align-items: center;
    }

    .username-input,
    .password-input {
        /* width: 100%; */
        padding-left: 5px;
        padding-top: 8px;
        padding-right: 5px;
        padding-bottom: 8px;
        margin-left: 10px;
        overflow: hidden;
        text-overflow: ellipsis;

        border: none;
        color: #000;

        border: 1px solid rgb(224, 224, 224);
        border-radius: 2px;
        width: 190px;
    }

    .buttons {
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
    .save-btn {
        background-color: #4e8be8;
        color: #fff;
        box-shadow: 0 0 2px 0px #4e8be8;
    }
    .save-btn[disabled] {
        background-color: #4e8be8;
        color: #fff;
        box-shadow: 0 0 2px 0px #4e8be8;
        opacity: 50%;
        cursor: auto;
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
        /* display: inline-block; */
        width: 25px;
        height: 25px;
        /* text-align: right; */
        opacity: 0.5;
        float: right;
    }
    .btn-close:hover {
        /* border-radius: 50%; */
        background-color: rgba(0, 0, 0, 0.1);
    }

    .fade-in {
        animation: slide-in ease-out 0.5s both;
        animation-delay: 0.5s;
        transform: translateY(-110%);
    }
    @keyframes slide-in {
        /* 75% {
    transform: translateY(-30%);
  } */
        100% {
            transform: translateY(0%);
        }
    }
</style>
