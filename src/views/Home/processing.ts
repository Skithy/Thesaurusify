// tslint:disable-next-line:no-var-requires
const nlp = require('compromise')

interface INounData {
	original: string
	base: string
	isPlural: boolean
}

interface IVerbData {
	original: string
	currentForm: 'Past' | 'Present' | 'Future'
	base: string
	isNegative: boolean
}

interface IAdjectiveData {
	base: string
}

interface IAdverbData {
	base: string
}

interface IJSONRecord {
	ant?: string[]
	rel?: string[]
	syn?: string[]
	sim?: string[]
	usr?: string[]
}
interface IJSONData {
	verb?: IJSONRecord
	noun?: IJSONRecord
	adjective?: IJSONRecord
	adverb?: IJSONRecord
}

interface IRecord {
	antonym: string[]
	synonym: string[]
}
interface IData {
	verb: IRecord
	noun: IRecord
	adjective: IRecord
	adverb: IRecord
}
type Database = Map<string, IData>

export const convertText = async (inputString: string): Promise<string> => {
	const { nouns, verbs, adjectives, adverbs } = processInput(inputString)

	const db = await buildDatabase([
		...nouns.map((n) => n.base),
		...verbs.map((v) => v.base),
		...adjectives.map((a) => a.base),
		...adverbs.map((a) => a.base),
	])

	let outputString = replaceNouns(inputString, nouns, db)
	outputString = replaceVerbs(outputString, verbs, db)
	outputString = replaceAdjectives(outputString, adjectives, db)
	outputString = replaceAdverbs(outputString, adverbs, db)
	return outputString
}

const normalize = (m: any) => m.data()[0].normal

const processInput = (inputString: string) => {
	const text = nlp(inputString)

	const nouns: INounData[] = text.nouns().map((m: any) => ({
		base: normalize(m.clone().nouns().toSingular()),
		isPlural: m.nouns().isPlural().length !== 0,
		original: normalize(m),
	}))
	const verbs: IVerbData[] = text.verbs().map((m: any) => ({
		base: m.verbs().conjugate()[0].Infinitive,
		currentForm: m.verbs().conjugation()[0],
		isNegative: m.verbs().isNegative().length !== 0,
		original: normalize(m),
	}))
	const adjectives: IAdjectiveData[] = text.adjectives().map((m: any) => ({ base: normalize(m) }))
	const adverbs: IAdverbData[] = text.adverbs().map((m: any) => ({ base: normalize(m) }))

	return {
		adjectives,
		adverbs,
		nouns,
		verbs,
	}
}

const url = (word: string) => `http://words.bighugelabs.com/api/2/2601c40018ab5d51ea6a0884c8fe2a24/${word}/json`
const get = (obj: any, ...args: string[]) => {
	let prop = obj
	for (const arg of args) {
		if (prop[arg] === undefined) {
			return undefined
		}
		prop = prop[arg]
	}
	return prop
}

const buildDatabase = async (words: string[]): Promise<Database> => {
	const db: Database = new Map()
	const uniqueWords = Array.from(new Set(words))

	await Promise.all(uniqueWords.map(async (word) => {
		const response = await fetch(url(word))
		if (response && response.ok) {
			const json: IJSONData = await response.json()

			const data = ['adjective', 'adverb', 'noun', 'verb'].reduce((d, key) => ({
				...d,
				[key]: {
					antonym: get(json, key, 'ant') || [],
					synonym: [
						...(get(json, key, 'rel') || []),
						...(get(json, key, 'syn') || []),
						...(get(json, key, 'sim') || []),
						...(get(json, key, 'usr') || []),
					],
				},
			}), {}) as IData
			db.set(word, data)
		}
	}))
	return db
}

const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1) + min)

const randItem = <T>(arr: T[]): T => arr[randRange(0, arr.length - 1)]

const isCapital = (word: string): boolean => word[0] !== word[0].toLowerCase()

const toCapital = (word: string): string => word[0].toUpperCase() + word.slice(1)

const replaceKeepCase = (inputString: string, replace: string, replaceWith: string): string => {
	const match = inputString.match(new RegExp(replace, 'i'))
	if (replace && replaceWith && match) {
		const word = match[0]
		return inputString.replace(word, isCapital(word) ? toCapital(replaceWith) : replaceWith)
	}
	return inputString
}

const replaceNouns = (inputString: string, nouns: INounData[], db: Database): string => {
	let outputString = inputString
	for (const nounData of nouns) {
		const data = db.get(nounData.base)
		if (!data || data.noun.synonym.length === 0) { continue }

		const result = nlp(randItem(data.noun.synonym))
		if (nounData.isPlural) {
			result.nouns().toPlural()
		}
		outputString = replaceKeepCase(outputString, nounData.original, result.out())
	}
	return outputString
}

const replaceVerbs = (inputString: string, verbs: IVerbData[], db: Database): string => {
	let outputString = inputString
	for (const verbData of verbs) {
		const data = db.get(verbData.base)
		if (!data || data.verb.synonym.length === 0) { continue }

		let result = nlp(randItem(data.verb.synonym))
		if (verbData.isNegative) {
			if (data.verb.antonym.length === 0) {
				result.verbs().toNegative()
			} else {
				result = nlp(randItem(data.verb.antonym))
			}
		}

		switch (verbData.currentForm) {
			case 'Past':
				result.verbs().toPastTense()
				break
			case 'Present':
				result.verbs().toPresentTense()
				break
			case 'Future':
				result.verbs().toFutureTense()
				break
		}
		outputString = replaceKeepCase(outputString, verbData.original, result.out())
	}
	return outputString
}

const replaceAdjectives = (inputString: string, adjectives: IAdjectiveData[], db: Database): string => {
	let outputString = inputString
	for (const adjectiveData of adjectives) {
		const data = db.get(adjectiveData.base)
		if (!data || data.adjective.synonym.length === 0) { continue }

		const result = randItem(data.adjective.synonym)
		outputString = replaceKeepCase(outputString, adjectiveData.base, result)
	}
	return outputString
}

const replaceAdverbs = (inputString: string, adverbs: IAdverbData[], db: Database): string => {
	let outputString = inputString
	for (const adverbData of adverbs) {
		const data = db.get(adverbData.base)
		if (!data || data.adverb.synonym.length === 0) { continue }

		const result = randItem(data.adverb.synonym)
		outputString = replaceKeepCase(outputString, adverbData.base, result)
	}
	return outputString
}
