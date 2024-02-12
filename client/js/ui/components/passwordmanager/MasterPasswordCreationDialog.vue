<template>
    <section class="dialog">
        <div>
            <button class="btn-close" @click="close">
                <img src="/img/jimber/close.svg" />
            </button>
            <div class="header">
                <img src="/img/jimber/googlepwbanner.png" /><br />
                You seem to have not set up a master password yet. Do you want to set this up now?
            </div>
            <div class="content">
                <br />
                <div class="form-entry">
                    <label for="Password">Password</label>
                    <input type="password" name="password" v-model="password" autocomplete="off" />
                </div>
                <br />
                <div v-if="error" class="form-entry">
                    {{ error }}
                </div>
                <div class="buttons">
                    <button @click="close" class="never-btn">No</button>
                    <button @click="save" class="save-btn">Save</button>
                </div>
            </div>
            <footer>
                Your master password is not stored by us. Remember it well or you will lose access to your passwords
                saved in your isolated browser.
            </footer>
        </div>
    </section>
</template>
<script>
    module.exports = new Promise(async (resolve, reject) => {
        const { passwordHandler } = await import('/js/state/PasswordHandler.js');

        resolve({
            name: 'ThePasswordManagerMasterPassCreationDialog',
            components: {},
            props: [],
            data() {
                return {
                    passwordHandler: passwordHandler,
                    password: '',
                    error: null,
                };
            },
            computed: {},
            mounted() {},
            methods: {
                close() {
                    this.$store.state.showMasterPasswordCreationDialog = false;
                },
                async save() {
                    this.error = null;
                    if (this.password.length < 10) {
                        this.error = 'Your master password must be at least 10 characters long!';
                        return;
                    }
                    await passwordHandler.saveMasterPassword(this.password);
                    if (this.areThereCredentialsToBeSubmitted()) {
                        await passwordHandler.saveCredentials(this.$store.state.credentialsToBeSubmitted);
                        this.$store.state.credentialsToBeSubmitted = {};
                    }
                    this.close();
                },
                areThereCredentialsToBeSubmitted() {
                    return Object.entries(this.$store.state.credentialsToBeSubmitted).length > 0;
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

    .never-btn {
        box-shadow: 0 0 2px 0px rgb(117, 117, 117);
        color: #4e8be8;
        background-color: #fff;
    }
    .save-btn {
        background-color: #4e8be8;
        color: #fff;
        box-shadow: 0 0 2px 0px #4e8be8;
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
