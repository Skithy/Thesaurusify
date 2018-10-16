const getURL = (word: string) => `https://api.datamuse.com/words?rel_syn=${word}&md=p`

export type APIType = 'n' | 'v' | 'adj' | 'adv' | 'u'

export interface IAPIWordData {
	word: string
	score: number
	tags: APIType[]
}

export const getWordData = async (word: string): Promise<IAPIWordData[]> => {
	const request = await fetch(getURL(word))
	if (request.ok) {
		return await request.json()
	}
	return []
}
