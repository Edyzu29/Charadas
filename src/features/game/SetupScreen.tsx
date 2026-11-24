import { useState } from 'react'
import type { FormEvent } from 'react'
import { DEFAULT_DECKS } from '../../data/defaultDecks'
import type { Deck, GameSettings } from '../../types'
import { loadUserDecks } from '../decks/deckStorage'
import { loadSettings, normalizeTurnSeconds, saveSettings } from '../settings/settingsStorage'
import './setup.css'

type SetupScreenProps = {
  onBack: () => void
  onStart: (players: string[], deck: Deck, settings: GameSettings) => void
}

function hasValidPlayers(players: string[]): boolean {
  if (players.length < 2 || players.length > 10) return false
  const normalized = players.map((player) => player.trim().toLocaleLowerCase())
  return normalized.every((player) => player.length > 0) && new Set(normalized).size === players.length
}

export function SetupScreen({ onBack, onStart }: SetupScreenProps) {
  const [userDecks] = useState(() => loadUserDecks())
  const decks = [...DEFAULT_DECKS, ...userDecks]
  const [deckId, setDeckId] = useState(DEFAULT_DECKS[0].id)
  const [players, setPlayers] = useState(['', ''])
  const [secondsInput, setSecondsInput] = useState(() => String(loadSettings().turnSeconds))
  const [message, setMessage] = useState('')
  const selectedDeck = decks.find((deck) => deck.id === deckId) ?? decks[0]
  const turnSeconds = normalizeTurnSeconds(secondsInput.trim() ? Number(secondsInput) : Number.NaN)

  function updatePlayer(index: number, value: string): void {
    setPlayers(players.map((player, playerIndex) => playerIndex === index ? value : player))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!hasValidPlayers(players)) return setMessage('Ingresa entre 2 y 10 nombres únicos y no vacíos.')
    if (selectedDeck.words.length < 5) return setMessage('Este mazo necesita al menos 5 palabras para jugar.')
    const settings = { turnSeconds }
    saveSettings(settings)
    onStart(players.map((player) => player.trim()), selectedDeck, settings)
  }

  return (
    <main className="app-screen setup-screen">
      <button type="button" className="button-secondary" onClick={onBack}>← Volver a mazos</button>
      <header className="screen-header"><p className="eyebrow">PREPARACIÓN</p><h1>Preparen la partida</h1><p>Elijan el mazo, los jugadores y el tiempo.</p></header>
      <form className="setup-form" onSubmit={handleSubmit}>
        <label htmlFor="setup-deck">Mazo</label>
        <select id="setup-deck" value={deckId} onChange={(event) => setDeckId(event.target.value)}>
          {decks.map((deck) => <option key={deck.id} value={deck.id}>{deck.name}{deck.builtIn ? '' : ' · propio'}</option>)}
        </select>
        {selectedDeck.words.length < 5 && <p className="warning-message" role="alert">Este mazo tiene {selectedDeck.words.length} palabras. Agrega al menos 5 para poder jugar.</p>}
        <fieldset className="player-fieldset">
          <legend>Jugadores (de 2 a 10)</legend>
          {players.map((player, index) => <div className="player-row" key={index}>
            <label className="visually-hidden" htmlFor={`player-${index}`}>Jugador {index + 1}</label>
            <input id={`player-${index}`} value={player} onChange={(event) => updatePlayer(index, event.target.value)} placeholder={`Nombre del jugador ${index + 1}`} />
            {players.length > 2 && <button type="button" className="button-danger" aria-label={`Quitar jugador ${index + 1}`} onClick={() => setPlayers(players.filter((_, itemIndex) => itemIndex !== index))}>×</button>}
          </div>)}
          {players.length < 10 && <button type="button" className="button-secondary" onClick={() => setPlayers([...players, ''])}>+ Agregar jugador</button>}
        </fieldset>
        <fieldset className="time-fieldset">
          <legend>Duración del turno</legend>
          <div className="time-shortcuts">{[30, 60, 90, 120].map((seconds) => <button type="button" key={seconds} aria-pressed={Number(secondsInput) === seconds} onClick={() => setSecondsInput(String(seconds))}>{seconds} s</button>)}</div>
          <label htmlFor="turn-seconds">Personalizado (15–300 s, pasos de 5)</label>
          <input id="turn-seconds" type="number" min="15" max="300" step="1" value={secondsInput} onChange={(event) => setSecondsInput(event.target.value)} />
          <p>Se usará {turnSeconds} segundos.</p>
        </fieldset>
        <p className="form-message" role="alert">{message}</p>
        <button type="submit" className="primary-action" disabled={selectedDeck.words.length < 5}>Empezar partida</button>
      </form>
    </main>
  )
}
