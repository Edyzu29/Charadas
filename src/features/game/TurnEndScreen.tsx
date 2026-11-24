import type { Dispatch } from 'react'
import type { GameState } from '../../types'
import type { GameAction } from './gameReducer'
import './game.css'

type TurnEndScreenProps = {
  state: GameState
  dispatch: Dispatch<GameAction>
}

export function TurnEndScreen({ state, dispatch }: TurnEndScreenProps) {
  const player = state.players[state.currentPlayerIndex]
  const nextPlayer = state.players[state.currentPlayerIndex + 1]
  return (
    <main className="game-screen end-screen">
      <p className="eyebrow">FIN DEL TURNO</p>
      <h1>¡Buen trabajo, {player}!</h1>
      <p className="turn-score">{state.scores[player]} puntos</p>
      <p>{nextPlayer ? `Sigue ${nextPlayer}.` : 'Todos los jugadores ya participaron.'}</p>
      <button type="button" className="primary-action" onClick={() => dispatch({ type: 'NEXT_TURN' })}>
        {nextPlayer ? 'Continuar' : 'Ver resultados'}
      </button>
    </main>
  )
}
