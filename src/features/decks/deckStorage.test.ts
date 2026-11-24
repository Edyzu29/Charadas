import { describe, expect, it } from 'vitest'
import type { Deck } from '../../types'
import {
  addWord,
  createDeckCopy,
  loadUserDecks,
  removeWord,
  saveUserDecks,
  validateWord,
} from './deckStorage'

type MemoryStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

function createMemoryStorage(initial: Record<string, string> = {}): MemoryStorage {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

const BUILT_IN_DECK: Deck = {
  id: 'builtin-1',
  name: 'Animales',
  words: ['Gato', 'Perro'],
  builtIn: true,
}

describe('user deck storage', () => {
  it('returns an empty list when stored JSON is corrupt', () => {
    const storage = createMemoryStorage({ 'charadas.decks': '{invalid' })
    expect(loadUserDecks(storage)).toEqual([])
  })

  it('returns an empty list when stored data has an invalid shape', () => {
    const storage = createMemoryStorage({ 'charadas.decks': '[{"id":3}]' })
    expect(loadUserDecks(storage)).toEqual([])
  })

  it('loads and saves valid user decks through the provided storage', () => {
    const storage = createMemoryStorage()
    const decks = [{ ...BUILT_IN_DECK, builtIn: false }]
    saveUserDecks(decks, storage)
    expect(loadUserDecks(storage)).toEqual(decks)
  })

  it('stores only user decks', () => {
    const storage = createMemoryStorage()
    saveUserDecks([BUILT_IN_DECK, { ...BUILT_IN_DECK, builtIn: false }], storage)
    expect(loadUserDecks(storage)).toEqual([{ ...BUILT_IN_DECK, builtIn: false }])
  })

  it('returns an empty list when storage access throws', () => {
    const storage: MemoryStorage = {
      getItem: () => {
        throw new Error('unavailable')
      },
      setItem: () => undefined,
    }
    expect(loadUserDecks(storage)).toEqual([])
  })

  it('does not throw when saving fails', () => {
    const storage: MemoryStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('unavailable')
      },
    }
    expect(() => saveUserDecks([], storage)).not.toThrow()
  })

  it('creates an independent user copy of a built-in deck', () => {
    const copy = createDeckCopy(BUILT_IN_DECK)
    expect(copy).toEqual({
      ...BUILT_IN_DECK,
      id: expect.not.stringMatching(/^builtin-1$/),
      name: 'Animales (mío)',
      words: ['Gato', 'Perro'],
      builtIn: false,
    })
    expect(copy.words).not.toBe(BUILT_IN_DECK.words)
    expect(BUILT_IN_DECK.builtIn).toBe(true)
  })

  it('rejects empty and whitespace-padded words', () => {
    expect(validateWord('', [])).toBe(false)
    expect(validateWord('   ', [])).toBe(false)
    expect(validateWord(' gato ', [])).toBe(false)
  })

  it('rejects words already in the deck without case sensitivity', () => {
    expect(validateWord('gAtO', ['Gato'])).toBe(false)
  })

  it('adds a valid word without mutating the original deck', () => {
    const deck = { ...BUILT_IN_DECK, builtIn: false }
    const updated = addWord(deck, 'Conejo')
    expect(updated.words).toEqual(['Gato', 'Perro', 'Conejo'])
    expect(deck.words).toEqual(['Gato', 'Perro'])
  })

  it('throws when adding an empty or duplicate word', () => {
    const deck = { ...BUILT_IN_DECK, builtIn: false }
    expect(() => addWord(deck, ' ')).toThrow()
    expect(() => addWord(deck, 'gato')).toThrow()
  })

  it('removes a word without mutating the original deck', () => {
    const deck = { ...BUILT_IN_DECK, builtIn: false }
    const updated = removeWord(deck, 'Gato')
    expect(updated.words).toEqual(['Perro'])
    expect(deck.words).toEqual(['Gato', 'Perro'])
  })
})
