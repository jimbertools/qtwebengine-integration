<template>
    <div class="dialog-wrapper">
        <div class="dialog">
            <h1>Sign in</h1>
            <p>{{ url.origin }}</p>
            <div>
                <div class="input-group">
                    <label for="user">Username:</label>
                    <input ref="user" id="user" v-model="user" type="text" /><br />
                </div>
                <div class="input-group">
                    <label for="password">Password:</label>
                    <input id="password" @keyup.enter="signIn" v-model="password" type="password" /><br />
                </div>
                <div class="actions">
                    <button v-on:click="cancel">Cancel</button>
                    <button v-on:click="signIn">Sign in</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    module.exports = new Promise(async (resolve, reject) => {
        const authenticationHandler = (await import('/js/state/AuthenticationHandler.js')).authenticationHandler;
        resolve({
            data() {
                return {
                    authenticationHandler,
                    user: null,
                    password: null,
                };
            },
            mounted() {
                this.$refs.user.focus();
            },
            computed: {
                url() {
                    return this.authenticationHandler.url;
                },
            },
            methods: {
                cancel() {
                    this.authenticationHandler.cancelRequest();
                },
                signIn() {
                    authenticationHandler.login(this.user, this.password);
                    this.user = null;
                    this.password = null;
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
    .input-group {
        margin: 10px 0;
        display: grid;
        grid-template-columns: 1fr 3fr;
        align-items: center;
        width: 500px;
    }
</style>
