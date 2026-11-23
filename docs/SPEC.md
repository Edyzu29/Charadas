# Charadas — Especificación (versión 1: un solo teléfono)

## Resumen
Juego de charadas ("adivina la palabra con el teléfono en la frente") que corre en el navegador del teléfono. Trae mazos por defecto y permite crear mazos propios. Versión 1: un solo teléfono, jugadores por turnos. Versión 2 (fuera de esta especificación): salas con código y Supabase.

## Alcance de la versión 1
- Mazos por defecto (solo lectura) y mazos propios (editables, guardados en el navegador).
- Editar un mazo por defecto crea una copia propia; el original no cambia.
- Tiempo de turno configurable.
- Partida por turnos con temporizador, Acertar y Pasar, puntaje y resultados.
- Inclinación del teléfono como método opcional (siempre hay botones).
- Interfaz solo en español. Código y nombres en inglés.

## Fuera de alcance
Cuentas, multijugador en red, equipos, sonidos, estadísticas, mazos compartidos.

## Reglas del juego
- Jugadores: de 2 a 10 nombres, no vacíos y sin repetir. Juegan en orden, uno por turno.
- Cada jugador juega exactamente 1 turno. La partida termina cuando todos jugaron.
- En su turno, el jugador sostiene el teléfono en la frente y el resto actúa la palabra.
- Duración del turno: `turnSeconds` (ver "Tiempo configurable").
- Acertar: +1 punto al jugador del turno y muestra la siguiente palabra.
- Pasar: 0 puntos; la palabra vuelve al final de la cola y muestra la siguiente.
- Las palabras se barajan al iniciar la partida y no se repiten hasta agotar el mazo. Si la cola se vacía, se rellena con el mazo barajado de nuevo.
- Mínimo 5 palabras en un mazo para poder jugarlo.

## Tiempo configurable
- `turnSeconds`: entero entre 15 y 300, en pasos de 5. Valor por defecto: 60.
- Atajos en pantalla: 30, 60, 90 y 120 segundos, más un campo para valor personalizado.
- Se guarda en localStorage (clave `charadas.settings`) y se recuerda en la siguiente partida.
- Al leer un valor guardado inválido o ausente, se usa 60.
- Se aplica al empezar la partida; no cambia durante una partida en curso.

## Mazos
- Mazos por defecto: definidos en `src/data/defaultDecks.ts`, con `builtIn: true`. Nunca se modifican desde la app.
- Mazos propios: `builtIn: false`, guardados en localStorage (clave `charadas.decks`).
- Al editar o agregar palabras a un mazo por defecto, la app crea una copia propia con el nombre `"<nombre> (mío)"` y aplica el cambio a la copia.
- Palabras: texto no vacío, sin espacios sobrantes, sin repetidos dentro del mismo mazo (sin distinguir mayúsculas).
- Solo se pueden borrar mazos propios.

## Pantallas
1. **Mazos**: lista de mazos por defecto y propios; crear, editar (copia si es por defecto), borrar propios.
2. **Preparar partida**: elegir mazo, escribir nombres de jugadores, elegir tiempo de turno, empezar.
3. **Turno**: cuenta regresiva corta (3 s), palabra grande, botones Acertar y Pasar, tiempo restante, puntaje del jugador.
4. **Fin de turno**: puntos del turno y quién sigue; botón para continuar.
5. **Resultados**: ranking final y botones "Jugar otra vez" y "Volver a mazos".

## Modelo de datos (`src/types.ts`)
```ts
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
```

## Almacenamiento (localStorage)
| Clave | Contenido |
|---|---|
| `charadas.decks` | `Deck[]` solo con mazos propios |
| `charadas.settings` | `GameSettings` |

Toda lectura de localStorage debe estar dentro de try/catch y validar el formato; ante datos corruptos, usar valores por defecto.

## Criterios de aceptación globales (Given-When-Then)
- Given una partida en turno, When el jugador pulsa Acertar, Then su puntaje sube 1 y aparece otra palabra.
- Given una partida en turno, When pulsa Pasar, Then su puntaje no cambia y la palabra vuelve al final de la cola.
- Given que `secondsLeft` llega a 0, When termina el turno, Then la fase pasa a `turnEnd`.
- Given que todos los jugadores jugaron, When termina el último turno, Then la fase pasa a `finished`.
- Given un mazo por defecto, When el usuario agrega una palabra, Then se crea una copia propia y el original permanece igual.
- Given un valor de tiempo fuera de 15–300, When se guarda o se lee, Then se corrige o se usa 60.
- Given un mazo con menos de 5 palabras, When se intenta jugar, Then se muestra un aviso y no empieza.

## Versión 2 (referencia)
Nombre de jugador sin registro, salas con código, estado sincronizado en Supabase (con RLS activado), el anfitrión envía las palabras del mazo a la sala. Se especificará aparte.
