import { useCallback, useState } from 'react'
import { DecksScreen } from './features/decks/DecksScreen'
import { GameScreen } from './features/game/GameScreen'
import { ResultsScreen } from './features/game/ResultsScreen'
import { SetupScreen } from './features/game/SetupScreen'
import { TurnEndScreen } from './features/game/TurnEndScreen'
import { createGame, gameReducer } from './features/game/gameReducer'
import type { GameAction } from './features/game/gameReducer'
import type { Deck, GameSettings, GameState } from './types'

type AppScreen = 'decks' | 'setup' | 'game'

function App() {
  const [screen, setScreen] = useState<AppScreen>('decks')
  const [game, setGame] = useState<GameState | null>(null)
  const dispatch = useCallback((action: GameAction) => {
    setGame((current) => current ? gameReducer(current, action) : current)
  }, [])
  const handleStart = (players: string[], deck: Deck, settings: GameSettings) => {
    setGame(createGame(players, deck.words, settings))
    setScreen('game')
  }
  const handlePlayAgain = () => {
    if (game) setGame(createGame(game.players, game.deckWords, game.settings))
  }
  if (screen === 'decks') return <DecksScreen onPrepare={() => setScreen('setup')} />
  if (screen === 'setup') return <SetupScreen onBack={() => setScreen('decks')} onStart={handleStart} />
  if (!game) return <DecksScreen onPrepare={() => setScreen('setup')} />
  if (game.phase === 'finished') return <ResultsScreen state={game} onPlayAgain={handlePlayAgain} onBackToDecks={() => setScreen('decks')} />
  if (game.phase === 'turnEnd') return <TurnEndScreen state={game} dispatch={dispatch} />
  return <GameScreen state={game} dispatch={dispatch} />
}

export default App
