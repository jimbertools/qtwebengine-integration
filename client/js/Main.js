import { physicalBrowser } from './state/PhysicalBrowser.js';
import { audioStreamerContext } from './state/AudioStreamer.js';
import store from './store/store.js';
import { socketHandler } from './state/SocketHandler.js';
import config from '../config.js';

class Main {
    constructor() {
        store.state.currentRenderer = config.RENDERER;
        console.log(store.state.currentRenderer);
        if (store.state.currentRenderer == 'video') {
            store.state.domRenderingDisabled = true;
        }
        // Extensions();
        Vue.use(httpVueLoader);
        new Vue({
            components: {
                app: httpVueLoader('/js/ui/components/App.vue'),
            },
            store,
            template: '<app />',
        }).$mount('#app');

        // socketHandler.addSocketClosedHandler(physicalBrowser.initConnection.bind(physicalBrowser));
        physicalBrowser.initConnection();
        audioStreamerContext.start();
    }
}

new Main();
