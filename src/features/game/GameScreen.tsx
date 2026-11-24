import { useEffect, useState } from 'react'
import type { Dispatch } from 'react'
import type { GameState } from '../../types'
import type { GameAction } from './gameReducer'
import { useTimer } from './useTimer'
import './game.css'

type GameScreenProps = {
  state: GameState
  dispatch: Dispatch<GameAction>
}

type CountdownProps = { player: string; dispatch: Dispatch<GameAction> }

function TurnCountdown({ player, dispatch }: CountdownProps) {
  const [countdown, setCountdown] = useState(3)
  useEffect(() => {
    if (countdown === 0) {
      dispatch({ type: 'START_TURN' })
      return
    }
    const timeoutId = window.setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => window.clearTimeout(timeoutId)
  }, [countdown, dispatch])
  return <main className="game-screen countdown-screen"><p className="eyebrow">TURNO DE</p><h1>{player}</h1><p>Preparaos…</p><strong className="countdown-number">{countdown}</strong></main>
}

export function GameScreen({ state, dispatch }: GameScreenProps) {
  useTimer(state.phase, dispatch)
  if (state.phase === 'turnReady') {
    return <TurnCountdown key={state.currentPlayerIndex} player={state.players[state.currentPlayerIndex]} dispatch={dispatch} />
  }
  const player = state.players[state.currentPlayerIndex]
  return (
    <main className="game-screen">
      <header className="game-topline"><span>Turno de {player}</span><span>{state.secondsLeft} s</span></header>
      <p className="score-line">Puntos: {state.scores[player]}</p>
      <section className="word-panel" aria-live="polite"><p>Representa esta palabra</p><h1>{state.currentWord}</h1></section>
      <div className="game-actions">
        <button type="button" className="action-pass" onClick={() => dispatch({ type: 'PASS' })}>Pasar</button>
        <button type="button" className="action-correct" onClick={() => dispatch({ type: 'CORRECT' })}>¡Acertar!</button>
      </div>
    </main>
  )
}
