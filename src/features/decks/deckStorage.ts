import type { Deck } from '../../types'

const USER_DECKS_KEY = 'charadas.decks'
type DeckStorage = Pick<Storage, 'getItem' | 'setItem'>

function isDeck(value: unknown): value is Deck {
  if (typeof value !== 'object' || value === null) return false
  const deck = value as Record<string, unknown>
  return (
    typeof deck.id === 'string' &&
    typeof deck.name === 'string' &&
    Array.isArray(deck.words) &&
    deck.words.every((word: unknown) => typeof word === 'string') &&
    deck.builtIn === false
  )
}

export function loadUserDecks(storage: DeckStorage = window.localStorage): Deck[] {
  try {
    const savedDecks = storage.getItem(USER_DECKS_KEY)
    if (savedDecks === null) return []
    const parsed: unknown = JSON.parse(savedDecks)
    return Array.isArray(parsed) && parsed.every(isDeck) ? parsed : []
  } catch {
    return []
  }
}

export function saveUserDecks(
  decks: Deck[],
  storage: DeckStorage = window.localStorage,
): void {
  try {
    storage.setItem(
      USER_DECKS_KEY,
      JSON.stringify(decks.filter((deck) => !deck.builtIn)),
    )
  } catch {
    // Storage may be unavailable or full.
  }
}

export function createDeckCopy(deck: Deck): Deck {
  return {
    ...deck,
    id: crypto.randomUUID(),
    name: deck.builtIn ? `${deck.name} (mío)` : deck.name,
    words: [...deck.words],
    builtIn: false,
  }
}

export function validateWord(word: string, existing: string[]): boolean {
  if (word.trim().length === 0 || word !== word.trim()) return false
  const normalizedWord = word.toLocaleLowerCase()
  return !existing.some((item) => item.toLocaleLowerCase() === normalizedWord)
}

export function addWord(deck: Deck, word: string): Deck {
  if (!validateWord(word, deck.words)) {
    throw new Error('La palabra está vacía, tiene espacios sobrantes o ya existe.')
  }
  return { ...deck, words: [...deck.words, word] }
}

export function removeWord(deck: Deck, word: string): Deck {
  const normalizedWord = word.toLocaleLowerCase()
  return {
    ...deck,
    words: deck.words.filter((item) => item.toLocaleLowerCase() !== normalizedWord),
  }
}
