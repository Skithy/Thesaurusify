<template>
<div id="app">
	<Navbar />
	<div id="view">
		<router-view />
	</div>
</div>
</template>

<script lang="ts">
import Navbar from '@/views/Navbar/Navbar.vue'
import Vue from 'vue'
export default Vue.extend({
	components: {
		Navbar,
	},
})
</script>


<style scoped lang="scss">
#app {
	height: 100%;
	font-family: 'Times New Roman', Times, serif;
	#view {
		padding-top: 6em;
	}
}
</style>
