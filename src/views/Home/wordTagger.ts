// tslint:disable-next-line:no-var-requires
const nlp = require('compromise')

interface IBaseTag {
	text: string // how it appears in original text
	normal: string // remove punctuation and case
	tags: string[]
}

interface IEnhancedTag extends IBaseTag {
	base: string // convert to singular
	isTitleCase: boolean
	isUpperCase: boolean
}

export interface INounTag extends IEnhancedTag {
	tag: 'Noun'
	isPlural: boolean
}

export interface IVerbTag extends IEnhancedTag {
	tag: 'Verb'
	tense: 'Past' | 'Present' | 'Future' | 'Gerund'
}

export interface IAdjTag extends IEnhancedTag {
	tag: 'Adj'
}

export interface IAdvTag extends IEnhancedTag {
	tag: 'Adv'
}

export interface IOtherTag extends IEnhancedTag {
	tag: 'Other'
}

export type Tag = INounTag | IVerbTag | IAdjTag | IAdvTag | IOtherTag

export const tagWords = (input: string): Tag[] => {
	const baseTags: IBaseTag[] = nlp(input).out('tags')
	const enhancedTags: IEnhancedTag[] = baseTags.map((tag) => ({
		...tag,
		base: tag.normal,
		isTitleCase: tag.tags.includes('TitleCase'),
		isUpperCase: tag.normal.toUpperCase() === tag.normal,
	}))

	const tags: Tag[] = enhancedTags.map((tag) => {
		try {
			if (tag.tags.includes('Noun')) { return tagNoun(tag) }
			if (tag.tags.includes('Verb')) { return tagVerb(tag) }
			if (tag.tags.includes('Adjective')) { return tagAdj(tag) }
			if (tag.tags.includes('Adverb')) { return tagAdv(tag) }
			return { ...tag, tag: 'Other' } as IOtherTag
		} catch (e) {
			console.log(e)
			return { ...tag, tag: 'Other' } as IOtherTag
		}
	})
	return tags
}

const tagNoun = (baseTag: IEnhancedTag): INounTag => {
	const word = nlp(baseTag.normal).nouns()
	return {
		...baseTag,
		base: word.toSingular().out('text'),
		isPlural: word.hasPlural().length !== 0,
		tag: 'Noun',
	}
}

const tagVerb = (baseTag: IEnhancedTag): IVerbTag => {
	const word = nlp(baseTag.normal).verbs()
	return {
		...baseTag,
		base: word.conjugate()[0].Infinitive,
		tag: 'Verb',
		tense: word.verbs().conjugation()[0],
	}
}

const tagAdj = (baseTag: IEnhancedTag): IAdjTag => {
	return { ...baseTag, tag: 'Adj' }
}

const tagAdv = (baseTag: IEnhancedTag): IAdvTag => {
	return { ...baseTag, tag: 'Adv' }
}
