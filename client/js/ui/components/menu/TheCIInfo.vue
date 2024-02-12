<template>
    <section class="ci-info">
        <ul>
            <li>CI_COMMIT_SHA: {{ config.CI_COMMIT_SHA }}</li>
            <li>CI_COMMIT_BRANCH: {{ config.CI_COMMIT_BRANCH }}</li>
            <li>CI_COMMIT_TAG: {{ config.CI_COMMIT_TAG }}</li>
            <li>CI_DATE: {{ config.CI_DATE }}</li>
        </ul>
    </section>
</template>
<script>
    module.exports = new Promise(async (resolve, reject) => {
        const Config = await import('/config.js');
        resolve({
            name: 'TheCIInfo',
            components: {},
            props: [],
            data() {
                return {
                    config: {
                        CI_COMMIT_SHA: Config.default.CI_COMMIT_SHA,
                        CI_COMMIT_BRANCH: Config.default.CI_COMMIT_BRANCH,
                        CI_COMMIT_TAG: Config.default.CI_COMMIT_TAG,
                        CI_DATE: new Date(Config.default.CI_DATE * 1000),
                    },
                };
            },
            computed: {},
            mounted() {
                console.log(Config, Config.default);
            },
            methods: {},
            watch: {},
        });
    });
</script>
<style scoped>
    .ci-info {
        font-size: 8px;
    }
</style>
