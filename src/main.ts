import 'semantic-ui-css/semantic.min.css'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { unregisterServiceWorker } from './scripts/registerServiceWorker'
import store from './store'

Vue.config.productionTip = false
unregisterServiceWorker()
new Vue({
	render: (h) => h(App),
	router,
	store,
}).$mount('#app')
