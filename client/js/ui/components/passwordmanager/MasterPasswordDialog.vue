<template>
    <section class="dialog fade-in">
        <div>
            <button class="btn-close" @click="close">
                <img src="/img/jimber/close.svg" />
            </button>

            <div class="header">
                <img src="/img/jimber/googlepwbanner.png" />
                <br />
                Please fill in your master password to enable autofilling forms
            </div>
            <div class="content">
                <br />
                <div class="form-entry">
                    <label for="Password">Password</label>
                    <input
                        type="password"
                        name="password"
                        v-model="password"
                        autocomplete="off"
                        @keyup.enter="submit"
                    />
                </div>
                <br />
                <div v-if="wrongPassword" class="form-entry">
                    You seem to have entered the wrong password, please try again.
                </div>
                <div class="form-entry" v-if="timesIncorrect > 3">
                    <br />
                    Did you forget your password?
                </div>
                <br />
                <div class="buttons">
                    <button v-if="timesIncorrect > 3" @click="resetPasswordManager" class="reset-btn">Reset</button>
                    <button @click="close" class="cancel-btn">Not Now</button>
                    <button @click="submit" class="save-btn">Submit</button>
                </div>
            </div>
            <!-- <footer>
        Lorem ipsum
      </footer> -->
        </div>
    </section>
</template>
<script>
    module.exports = new Promise(async (resolve, reject) => {
        const { passwordHandler } = await import('/js/state/PasswordHandler.js');

        resolve({
            name: 'MasterPasswordDialog',
            components: {},
            props: [],
            data() {
                return {
                    passwordHandler: passwordHandler,
                    password: '',
                    wrongPassword: false,
                    timesIncorrect: 0,
                };
            },
            computed: {},
            mounted() {},
            methods: {
                close() {
                    this.passwordHandler.passwordsToBeDecrypted = [];
                    // passwordHandler.submittedCredentialForm = null;
                },
                async submit() {
                    this.wrongPassword = false;
                    if (!(await this.passwordHandler.loadKeyFromLocalStorage(this.password))) {
                        this.wrongPassword = true;
                        this.timesIncorrect++;
                        password = '';
                        return;
                    }

                    this.timesIncorrect = 0;
                    this.passwordHandler.passwordsToBeDecrypted.forEach((creds, index, object) => {
                        this.passwordHandler.onPasswordDecryptionRequest(creds.domain, creds.password);
                        object.splice(index, 1);
                    });
                    //
                },
                resetPasswordManager() {
                    this.$store.state.showResetPasswordManagerDialog = true;
                    this.close();
                },
            },
            watch: {},
        });
    });
</script>
<style scoped>
    .dialog {
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

    input {
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
    .reset-btn {
        color: #fff;
        background-color: #ff5252;
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

    .shake {
        animation: shake 0.5s infinite;
    }
    @keyframes shake {
        0% {
            transform: translate(0);
        }
        20% {
            transform: translate(3em);
        }
        40% {
            transform: translate(-3em);
        }
        60% {
            transform: translate(3em);
        }
        80% {
            transform: translate(-3em);
        }
        100% {
            transform: translate(0);
        }
    }
</style>
