import type { GameSettings, GameState } from '../../types'

export type GameAction =
  | { type: 'START_TURN' }
  | { type: 'CORRECT' }
  | { type: 'PASS' }
  | { type: 'TICK' }
  | { type: 'NEXT_TURN' }

export function createGame(
  players: string[],
  words: string[],
  settings: GameSettings,
): GameState {
  if (!areValidPlayers(players)) throw new Error('Se requieren de 2 a 10 jugadores únicos.')
  if (words.length < 5 || words.some((word) => word.trim().length === 0)) {
    throw new Error('Se requieren al menos 5 palabras no vacías.')
  }
  const deckWords = [...words]
  const queue = shuffle(deckWords)
  const currentWord = queue.shift() ?? null
  return {
    phase: 'turnReady',
    players: [...players],
    currentPlayerIndex: 0,
    scores: createScores(players),
    queue,
    currentWord,
    secondsLeft: settings.turnSeconds,
    settings: { ...settings },
    deckWords,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_TURN':
      return state.phase === 'turnReady' ? { ...state, phase: 'playing' } : state
    case 'CORRECT':
      return state.phase === 'playing' ? resolveWord(state, true) : state
    case 'PASS':
      return state.phase === 'playing' ? resolveWord(state, false) : state
    case 'TICK':
      return tick(state)
    case 'NEXT_TURN':
      return nextTurn(state)
  }
}

function areValidPlayers(players: string[]): boolean {
  if (players.length < 2 || players.length > 10) return false
  const normalized = players.map((player) => player.trim().toLocaleLowerCase())
  return normalized.every((player) => player.length > 0) && new Set(normalized).size === players.length
}

function createScores(players: string[]): Record<string, number> {
  return players.reduce<Record<string, number>>((scores, player) => {
    scores[player] = 0
    return scores
  }, {})
}

function shuffle(words: string[]): string[] {
  const shuffled = [...words]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const currentWord = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = currentWord
  }
  return shuffled
}

function resolveWord(state: GameState, correct: boolean): GameState {
  const pending = getPendingWords(state, correct)
  const nextQueue = pending.length === 0 ? shuffle(state.deckWords) : pending
  const [currentWord, ...queue] = nextQueue
  const player = state.players[state.currentPlayerIndex]
  const scores = correct ? { ...state.scores, [player]: state.scores[player] + 1 } : state.scores
  return { ...state, queue, currentWord, scores }
}

function getPendingWords(state: GameState, correct: boolean): string[] {
  if (correct) return state.queue
  const queue = state.queue.length === 0
    ? shuffle(state.deckWords).filter((word) => word !== state.currentWord)
    : state.queue
  return state.currentWord === null ? queue : [...queue, state.currentWord]
}

function tick(state: GameState): GameState {
  if (state.phase !== 'playing') return state
  const secondsLeft = Math.max(0, state.secondsLeft - 1)
  return { ...state, secondsLeft, phase: secondsLeft === 0 ? 'turnEnd' : state.phase }
}

function nextTurn(state: GameState): GameState {
  if (state.phase !== 'turnEnd') return state
  if (state.currentPlayerIndex === state.players.length - 1) {
    return { ...state, phase: 'finished' }
  }
  return {
    ...state,
    phase: 'turnReady',
    currentPlayerIndex: state.currentPlayerIndex + 1,
    secondsLeft: state.settings.turnSeconds,
  }
}
