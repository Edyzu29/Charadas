export type Deck = {
  id: string;
  name: string;
  words: string[];
  builtIn: boolean;
};

export type GameSettings = {
  turnSeconds: number; // 15–300, pasos de 5
};

export type GamePhase = 'turnReady' | 'playing' | 'turnEnd' | 'finished';

export type GameState = {
  phase: GamePhase;
  players: string[];
  currentPlayerIndex: number;
  scores: Record<string, number>;
  queue: string[]; // palabras pendientes, ya barajadas
  currentWord: string | null;
  secondsLeft: number;
  settings: GameSettings;
  deckWords: string[]; // palabras originales, para rellenar la cola
};
