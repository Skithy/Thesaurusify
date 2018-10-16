<template>
<div id="app">
	<div id="view">
		<router-view />
	</div>
	<footer class="footer">
		<div className="footer-left"><p>Skithy © {{year}}</p></div>
		<div className="footer-right"><p>Made by Tony Dong</p></div>
	</footer>
</div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'

@Component
export default class Home extends Vue {
	public year = new Date().getFullYear()
}
</script>


<style lang="scss">
#app {
	height: 100%;
	font-family: Lato,Helvetica Neue,Arial,Helvetica,sans-serif;
  background: repeating-linear-gradient(45deg, #EFFEFF, #EFFEFF 80px, #EFF6FF 80px, #EFF6FF 160px);

	#view {
		padding-top: 6em;
	}
}
.footer {
	position: fixed;
	left: 0;
	bottom: 0;
	width: 100%;
	display: flex;
	justify-content: space-between;
	padding-top: 0.5em;
	padding-left: 0.5em;
	padding-right: 0.5em;
}
</style>
