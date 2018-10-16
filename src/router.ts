import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home/Home.vue'

Vue.use(Router)

export default new Router({
	mode: 'history',
	routes: [
		{
			component: Home,
			name: 'home',
			path: '/',
		},
	],
})
