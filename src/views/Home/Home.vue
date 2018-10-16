<template>
<div id="home" class="ui form">
	<h1 id="header" class="ui header">Thesaurusify!</h1>
	<div class="field" id="input">
		<label class="ui header">Text goes in here:</label>
		<textarea
			name="input"
			v-model="inputString"
		/>
	</div>
	<button id="button" class="ui button" @click="convert">CONVERT</button>
	<div class="field" id="result">
		<label class="ui header">Text comes out here:</label>
		<textarea
			name="result"
			readonly
			v-bind:value="outputString"
		/>
	</div>
</div>
</template>


<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { convertText } from './processing'

@Component
export default class Home extends Vue {
	inputString: string = `Cats are similar in anatomy to the other felids, with a strong flexible body, quick reflexes, sharp retractable claws and teeth adapted to killing small prey. Cat senses fit a crepuscular and predatory ecological niche. Cats can hear sounds too faint or too high in frequency for human ears, such as those made by mice and other small animals. They can see in near darkness.`
	outputString: string = ''

	mounted () {
    this.convert()
  }

	async convert() {
		this.outputString = 'converting...'
		this.outputString = await convertText(this.inputString)
	}
}
</script>


<style lang="scss">
@import "../../all.scss";
textarea {
	resize: none;
}

#home {
	display: grid;
	height: 100%;
	grid-gap: 1em;

	@include for-phone-only {
		grid-template-columns: auto minmax(90vw, 26em) auto;
		grid-template-rows: 2em 15em 3em 15em;
		grid-template-areas: 
			". header ." 
			". input . "
			". button ."
			". result .";
	}

	@include for-tablet-portrait-up {
		grid-template-columns: auto minmax(15em, 45vw)  minmax(15em, 45vw) auto;
		grid-template-rows: 3em minmax(15em, 50vh);
		grid-template-areas: 
			". header button ." 
			". input result .";
	}
}
#header { grid-area: header; }
#input { grid-area: input; }
#result { grid-area: result; }
#button { grid-area: button; }
</style>
