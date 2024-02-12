let config = {
    BROKER_HOST: `${window.location.host}`,
    BROKER_HOST_WS: `wss://${window.location.host}/ws`,
    RENDERER: "video",
    CI_COMMIT_SHA: "{CI_COMMIT_SHA}",
    CI_COMMIT_BRANCH: "{CI_COMMIT_BRANCH}",
    CI_COMMIT_TAG: "{CI_COMMIT_TAG}",
    CI_DATE: "{CI_DATE}"
};

export default config;
