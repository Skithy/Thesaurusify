// tslint:disable-next-line:no-var-requires
const nlp = require('compromise')
import { IDictionary, IEntry, updateDictionary } from './loadDictionary'
import { IAdjTag, IAdvTag, INounTag, IVerbTag, Tag, tagWords } from './wordTagger'

export const convertText = async (input: string, existingDictionary: IDictionary = {}) => {
	const tags: Tag[] = tagWords(input)
	const dictionary: IDictionary = await updateDictionary(tags, existingDictionary)
	const output = replaceWords(tags, dictionary)
	return output
}

const replaceWords = (tags: Tag[], dictionary: IDictionary): string => {
	const words = tags.map((tag) => {
		if (!(tag.base in dictionary)) {
			return tag.text
		}

		let word
		switch (tag.tag) {
			case 'Adj': word = replaceAdj(tag, dictionary); break
			case 'Adv': word = replaceAdv(tag, dictionary); break
			case 'Noun': word = replaceNoun(tag, dictionary); break
			case 'Verb': word = replaceVerb(tag, dictionary); break
			default: word = tag.normal
		}

		if (tag.isUpperCase) {
			word = word.toUpperCase()
		} else if (tag.isTitleCase) {
			word = capitalize(word)
		}

		const final = tag.text.replace(new RegExp(tag.normal, 'i'), word)
		return final
	})
	const output = words.join(' ')
	return output
}

const replaceNoun = (tag: INounTag, dictionary: IDictionary): string => {
	const similarWords = dictionary[tag.base]
	const word = getRandomEntry(similarWords.n) || tag.normal
	const wordNLP = nlp(word)
	if (tag.isPlural) {
		wordNLP.nouns().toPlural()
	}
	return wordNLP.out('text')
}

const replaceVerb = (tag: IVerbTag, dictionary: IDictionary): string => {
	const similarWords = dictionary[tag.base]
	const word = getRandomEntry(similarWords.v) || tag.normal
	const wordNLP = nlp(word)
	switch (tag.tense) {
		case 'Past':
			wordNLP.verbs().toPastTense()
			break
		case 'Present':
			wordNLP.verbs().toPresentTense()
			break
		case 'Future':
			wordNLP.verbs().toFutureTense()
			break
		case 'Gerund':
			wordNLP.verbs().toGerund()
			break
	}
	return wordNLP.out('text')
}

const replaceAdj = (tag: IAdjTag, dictionary: IDictionary): string => {
	const similarWords = dictionary[tag.base]
	const word = getRandomEntry(similarWords.adj) || tag.normal
	return word
}

const replaceAdv = (tag: IAdvTag, dictionary: IDictionary): string => {
	const similarWords = dictionary[tag.base]
	const word = getRandomEntry(similarWords.adv) || tag.normal
	return word
}

const getRandomEntry = (entries: IEntry[]): string => {
	const random = Math.random()
	let total = 0
	for (const entry of entries) {
		total += entry.probability
		if (total > random) {
			return entry.word
		}
	}
	return ''
}

const capitalize = (word: string) => word ? word[0].toUpperCase() + word.slice(1) : ''
