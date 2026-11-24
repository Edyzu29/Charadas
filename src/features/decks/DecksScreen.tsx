import { useState } from 'react'
import type { FormEvent } from 'react'
import { DEFAULT_DECKS } from '../../data/defaultDecks'
import type { Deck } from '../../types'
import {
  addWord,
  createDeckCopy,
  loadUserDecks,
  removeWord,
  saveUserDecks,
} from './deckStorage'
import './decks.css'

type DeckCardProps = {
  deck: Deck
  onAddWord: (deck: Deck, word: string) => boolean
  onRemoveWord: (deck: Deck, word: string) => void
  onCopy: (deck: Deck) => void
  onDelete: (deck: Deck) => void
}

type DecksScreenProps = { onPrepare: () => void }

function DeckCard({ deck, onAddWord, onRemoveWord, onCopy, onDelete }: DeckCardProps) {
  const [word, setWord] = useState('')
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (onAddWord(deck, word)) setWord('')
  }
  return (
    <article className="deck-card">
      <div className="deck-card-heading">
        <div><h2>{deck.name}</h2><p>{deck.words.length} palabras</p></div>
        {deck.builtIn ? (
          <button type="button" onClick={() => onCopy(deck)}>Crear copia</button>
        ) : (
          <button type="button" className="button-danger" onClick={() => onDelete(deck)}>Borrar</button>
        )}
      </div>
      <details><summary>Ver palabras</summary><ul className="word-list">
        {deck.words.map((item) => <li key={item}>{item}{!deck.builtIn && (
          <button type="button" aria-label={`Quitar ${item}`} onClick={() => onRemoveWord(deck, item)}>×</button>
        )}</li>)}
      </ul></details>
      <form className="inline-form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor={`word-${deck.id}`}>Agregar palabra a {deck.name}</label>
        <input id={`word-${deck.id}`} value={word} onChange={(event) => setWord(event.target.value)} placeholder="Nueva palabra" />
        <button type="submit">Agregar</button>
      </form>
    </article>
  )
}

export function DecksScreen({ onPrepare }: DecksScreenProps) {
  const [userDecks, setUserDecks] = useState<Deck[]>(() => loadUserDecks())
  const [deckName, setDeckName] = useState('')
  const [message, setMessage] = useState('')
  const decks = [...DEFAULT_DECKS, ...userDecks]

  function persist(decksToSave: Deck[]): void {
    setUserDecks(decksToSave)
    saveUserDecks(decksToSave)
  }

  function handleCreateDeck(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const name = deckName.trim()
    if (!name) return setMessage('Escribe un nombre para el mazo.')
    const deck: Deck = { id: crypto.randomUUID(), name, words: [], builtIn: false }
    persist([...userDecks, deck])
    setDeckName('')
    setMessage('Mazo creado.')
  }

  function handleAddWord(deck: Deck, word: string): boolean {
    try {
      const editableDeck = deck.builtIn ? createDeckCopy(deck) : deck
      const updatedDeck = addWord(editableDeck, word)
      const nextDecks = deck.builtIn
        ? [...userDecks, updatedDeck]
        : userDecks.map((item) => item.id === deck.id ? updatedDeck : item)
      persist(nextDecks)
      setMessage(`Se agregó «${word}» a ${updatedDeck.name}.`)
      return true
    } catch {
      setMessage('La palabra está vacía, tiene espacios sobrantes o ya existe.')
      return false
    }
  }

  function handleRemoveWord(deck: Deck, word: string): void {
    persist(userDecks.map((item) => item.id === deck.id ? removeWord(item, word) : item))
  }

  function handleCopy(deck: Deck): void {
    const copy = createDeckCopy(deck)
    persist([...userDecks, copy])
    setMessage(`Se creó «${copy.name}».`)
  }

  function handleDelete(deck: Deck): void {
    persist(userDecks.filter((item) => item.id !== deck.id))
    setMessage(`Se borró «${deck.name}».`)
  }

  return (
    <main className="app-screen decks-screen">
      <header className="screen-header"><p className="eyebrow">CHARADAS</p><h1>Tus mazos</h1><p>Elige, crea y personaliza tus palabras.</p><button type="button" onClick={onPrepare}>Preparar partida</button></header>
      <form className="create-deck-form" onSubmit={handleCreateDeck}>
        <label htmlFor="deck-name">Crear un mazo</label>
        <div className="inline-form"><input id="deck-name" value={deckName} onChange={(event) => setDeckName(event.target.value)} placeholder="Nombre del mazo" />
          <button type="submit">Crear mazo</button></div>
      </form>
      <p className="form-message" role="status">{message}</p>
      <section className="deck-grid" aria-label="Mazos disponibles">
        {decks.map((deck) => <DeckCard key={deck.id} deck={deck} onAddWord={handleAddWord} onRemoveWord={handleRemoveWord} onCopy={handleCopy} onDelete={handleDelete} />)}
      </section>
    </main>
  )
}
