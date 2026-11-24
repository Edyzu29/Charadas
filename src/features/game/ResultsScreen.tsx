import type { GameState } from '../../types'
import './game.css'

type ResultsScreenProps = {
  state: GameState
  onPlayAgain: () => void
  onBackToDecks: () => void
}

export function ResultsScreen({ state, onPlayAgain, onBackToDecks }: ResultsScreenProps) {
  const ranking = [...state.players].sort((first, second) => state.scores[second] - state.scores[first])
  return (
    <main className="game-screen results-screen">
      <p className="eyebrow">PARTIDA TERMINADA</p>
      <h1>¡Resultados!</h1>
      <ol className="results-list">
        {ranking.map((player, index) => <li key={player}>
          <span><strong>{index + 1}.</strong> {player}</span><strong>{state.scores[player]} pts</strong>
        </li>)}
      </ol>
      <div className="results-actions">
        <button type="button" className="primary-action" onClick={onPlayAgain}>Jugar otra vez</button>
        <button type="button" className="button-secondary" onClick={onBackToDecks}>Volver a mazos</button>
      </div>
    </main>
  )
}
