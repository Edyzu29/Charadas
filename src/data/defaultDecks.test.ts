import { describe, expect, it } from 'vitest'
import { DEFAULT_DECKS } from './defaultDecks'

describe('DEFAULT_DECKS', () => {
  it('contains exactly six decks', () => {
    expect(DEFAULT_DECKS).toHaveLength(6)
  })

  it('has unique ids', () => {
    const ids = DEFAULT_DECKS.map((deck) => deck.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('marks every deck as built in', () => {
    expect(DEFAULT_DECKS.every((deck) => deck.builtIn)).toBe(true)
  })

  it('contains at least twenty words in every deck', () => {
    expect(DEFAULT_DECKS.every((deck) => deck.words.length >= 20)).toBe(true)
  })

  it('contains no empty or whitespace-only words', () => {
    const words = DEFAULT_DECKS.flatMap((deck) => deck.words)
    expect(words.every((word) => word.trim().length > 0)).toBe(true)
  })

  it('contains no repeated words within a deck, ignoring case', () => {
    for (const deck of DEFAULT_DECKS) {
      const normalizedWords = deck.words.map((word) => word.toLocaleLowerCase())
      expect(new Set(normalizedWords).size).toBe(normalizedWords.length)
    }
  })
})
