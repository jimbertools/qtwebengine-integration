import { physicalBrowser } from '/js/state/PhysicalBrowser.js';

Vue.use(Vuex);

const state = {
    showStats: false,
    showDownloadList: false,
    showBottomDownloadList: false,
    showDownloadOnboardingDialog: false,
    showFileUpload: false,
    showBrowserBar: false,
    showSearchBar: false,
    showSettingsMenu: false,
    // shouldOpenMenu: true,
    menuActive: false,
    showOnboardingDialog: false,
    showBrowserSupport: localStorage.getItem('browserSupport') !== 'seen',
    showPasswordManagerMasterPasswordDialog: false,
    showMasterPasswordCreationDialog: false,
    credentialsToBeSubmitted: {},
    showResetPasswordManagerDialog: false,
    passwordManagerDisabled: false,
    currentRenderer: 'dom',
    userSetRenderer: false,
    // currentRenderer: "video",
    domRenderingDisabled: false,
    pageRefreshTrigger: 0,
};

const actions = {
    setAdblockEnabled: function (context, enabled) {
        localStorage.setItem('adblockEnabled', enabled);
        physicalBrowser.setAdblockEnabled(enabled);
    },
};

const store = new Vuex.Store({
    state,
    // getters,
    actions,
    // mutations
});

export default store;
