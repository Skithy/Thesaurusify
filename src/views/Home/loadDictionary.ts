import { get, set } from '@/scripts/store'
import { APIType, getWordData, IAPIWordData } from './dictionaryAPI'
import { Tag } from './wordTagger'

export interface IDictionary {
	[word: string]: IWordData
}

interface IWordData {
	n: IEntry[]
	v: IEntry[]
	adj: IEntry[]
	adv: IEntry[]
}

export interface IEntry {
	word: string
	probability: number
}

export const updateDictionary = async (tags: Tag[], existingDictionary: IDictionary): Promise<IDictionary> => {
	const copy = {...existingDictionary}
	const newWords = {} as any
	// Check if tags are stored already. If not, start fetch request
	for (const tag of tags) {
		if (tag.tag === 'Other') { continue }
		if (tag.base in copy) { continue }

		const storedData = get(`v1/${tag.base}`)
		if (storedData) {
			copy[tag.base] = storedData
			continue
		}

		newWords[tag.base] = getWordData(tag.base)
	}

	// Wait for all fetch requests to finish.
	await Promise.all(Object.values(newWords))
	for (const word of Object.keys(newWords)) {
		const apiData = await newWords[word]
		const wordData = createWordData(apiData)
		newWords[word] = wordData
		set(`v1/${word}`, wordData)
	}

	const newDictionary: IDictionary = {
		...copy,
		...newWords,
	}

	return newDictionary
}

const createWordData = (apiData: IAPIWordData[]): IWordData => {
	return {
		adj: createEntries('adj', apiData),
		adv: createEntries('adv', apiData),
		n: createEntries('n', apiData),
		v: createEntries('v', apiData),
	}
}

const createEntries = (type: APIType, apiData: IAPIWordData[]): IEntry[] => {
	const nWords = apiData.filter((data) => data.tags && data.tags.includes(type))
	const totalScore = nWords.reduce((total, data) => total + data.score, 0)
	const entries: IEntry[] = nWords.map((data) => ({
		probability: data.score / totalScore,
		word: data.word,
	}))
	return entries
}
