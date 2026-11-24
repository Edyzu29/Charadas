import { afterEach, describe, expect, it, vi } from 'vitest'
import { createGame, gameReducer } from './gameReducer'
import type { GameAction } from './gameReducer'

const PLAYERS = ['Ana', 'Beto']
const WORDS = ['Gato', 'Perro', 'Loro', 'Pez', 'Conejo']
const SETTINGS = { turnSeconds: 15 }

function startPlayingGame() {
  return gameReducer(createGame(PLAYERS, WORDS, SETTINGS), { type: 'START_TURN' })
}

afterEach(() => vi.restoreAllMocks())

describe('createGame', () => {
  it('creates an initial turn with each deck word represented once', () => {
    const state = createGame(PLAYERS, WORDS, SETTINGS)
    expect(state.phase).toBe('turnReady')
    expect(state.currentWord).not.toBeNull()
    expect(new Set([state.currentWord, ...state.queue])).toEqual(new Set(WORDS))
    expect(state.secondsLeft).toBe(15)
    expect(state.scores).toEqual({ Ana: 0, Beto: 0 })
  })

  it.each<[string[], string[]]>([
    [[], WORDS],
    [['Ana'], WORDS],
    [Array.from({ length: 11 }, (_, index) => `Player ${index}`), WORDS],
    [['Ana', ' Ana '], WORDS],
    [PLAYERS, WORDS.slice(0, 4)],
  ])('rejects invalid players or decks', (players, words) => {
    expect(() => createGame(players, words, SETTINGS)).toThrow()
  })
})

describe('gameReducer', () => {
  it('starts the turn when START_TURN is dispatched', () => {
    expect(startPlayingGame().phase).toBe('playing')
  })

  it('awards one point and shows a different word for CORRECT', () => {
    const initial = startPlayingGame()
    const state = gameReducer(initial, { type: 'CORRECT' })
    expect(state.scores.Ana).toBe(1)
    expect(state.currentWord).not.toBe(initial.currentWord)
    expect(state.phase).toBe('playing')
  })

  it('returns a passed word to the end of the queue without scoring', () => {
    const initial = startPlayingGame()
    const state = gameReducer(initial, { type: 'PASS' })
    expect(state.scores.Ana).toBe(0)
    expect(state.currentWord).not.toBe(initial.currentWord)
    expect(state.queue.at(-1)).toBe(initial.currentWord)
  })

  it('decrements seconds and ends the turn at zero', () => {
    const initial = { ...startPlayingGame(), secondsLeft: 1 }
    const state = gameReducer(initial, { type: 'TICK' })
    expect(state.secondsLeft).toBe(0)
    expect(state.phase).toBe('turnEnd')
  })

  it('advances to the next player with a fresh timer', () => {
    const initial = { ...startPlayingGame(), phase: 'turnEnd' as const, secondsLeft: 0 }
    const state = gameReducer(initial, { type: 'NEXT_TURN' })
    expect(state.currentPlayerIndex).toBe(1)
    expect(state.phase).toBe('turnReady')
    expect(state.secondsLeft).toBe(15)
  })

  it('finishes after the last player completes their turn', () => {
    const initial = {
      ...startPlayingGame(),
      phase: 'turnEnd' as const,
      currentPlayerIndex: 1,
    }
    expect(gameReducer(initial, { type: 'NEXT_TURN' }).phase).toBe('finished')
  })

  it('refills the queue only after every deck word has been used', () => {
    let state = startPlayingGame()
    const dealtWords = [state.currentWord]
    for (let index = 0; index < WORDS.length - 1; index += 1) {
      state = gameReducer(state, { type: 'CORRECT' })
      dealtWords.push(state.currentWord)
    }
    expect(new Set(dealtWords).size).toBe(WORDS.length)
    expect(state.queue).toHaveLength(0)
    state = gameReducer(state, { type: 'CORRECT' })
    expect(WORDS).toContain(state.currentWord)
    expect(state.queue).toHaveLength(WORDS.length - 1)
  })

  it('refills with other words when passing at the end of an exhausted queue', () => {
    let state = startPlayingGame()
    for (let index = 0; index < WORDS.length - 1; index += 1) {
      state = gameReducer(state, { type: 'CORRECT' })
    }
    const passedWord = state.currentWord
    state = gameReducer(state, { type: 'PASS' })
    expect(state.currentWord).not.toBe(passedWord)
    expect(state.queue).toContain(passedWord)
  })

  it('leaves state unchanged for an action invalid in the current phase', () => {
    const initial = createGame(PLAYERS, WORDS, SETTINGS)
    const action: GameAction = { type: 'TICK' }
    expect(gameReducer(initial, action)).toBe(initial)
  })
})
