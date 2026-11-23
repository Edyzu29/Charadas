# TASKS.md — Versión 1 (un solo teléfono)

Instrucciones de uso: da al agente UNA tarea por vez, con `docs/SPEC.md` y `src/types.ts` como contexto. Cada tarea va en su propia rama y se revisa con `git diff` antes de unirla.

---

## T00 · Configurar Vitest
- Objetivo: poder ejecutar tests.
- Archivos: `package.json`, `vite.config.ts`.
- Hacer: instalar `vitest` como dependencia de desarrollo; agregar el script `"test": "vitest"`.
- Aceptación: `npm run test -- --run` se ejecuta sin errores (sin tests aún puede avisar "no tests").
- No hacer: instalar otros paquetes.

## T01 · Tipos
- Objetivo: crear los contratos de datos.
- Archivos: `src/types.ts`.
- Hacer: copiar tal cual los tipos de la sección "Modelo de datos" de `docs/SPEC.md`.
- Aceptación: `npx tsc -b` pasa.
- No hacer: agregar o cambiar campos.

## T02 · Validar mazos por defecto
- Objetivo: asegurar la calidad de los datos entregados en `src/data/defaultDecks.ts` (el archivo ya existe; no modificarlo).
- Archivos: `src/data/defaultDecks.test.ts`.
- Aceptación: tests que verifican: hay 6 mazos; ids únicos; todos con `builtIn: true`; cada mazo tiene al menos 20 palabras; sin palabras vacías; sin repetidos dentro de un mazo (sin distinguir mayúsculas).
- No hacer: editar `defaultDecks.ts`; si un test falla por los datos, reportarlo.

## T03 · Guardado local de mazos propios
- Objetivo: leer y escribir mazos propios en localStorage.
- Archivos: `src/features/decks/deckStorage.ts`, `deckStorage.test.ts`.
- Funciones: `loadUserDecks()`, `saveUserDecks(decks)`, `createDeckCopy(deck)`, `addWord(deck, word)`, `removeWord(deck, word)`, `validateWord(word, existing)`.
- Aceptación (tests): datos corruptos devuelven lista vacía; `createDeckCopy` de un mazo por defecto devuelve `builtIn: false`, id nuevo y nombre `"<nombre> (mío)"`; `addWord` rechaza vacíos y repetidos sin distinguir mayúsculas; el original no se modifica.
- No hacer: tocar componentes de React.

## T04 · Ajustes: tiempo de turno configurable
- Objetivo: guardar y validar `turnSeconds`.
- Archivos: `src/features/settings/settingsStorage.ts`, `settingsStorage.test.ts`.
- Funciones: `loadSettings()`, `saveSettings(settings)`, `normalizeTurnSeconds(value)`.
- Aceptación (tests): sin dato guardado devuelve 60; valores menores a 15 se corrigen a 15; mayores a 300 a 300; se redondea al múltiplo de 5 más cercano; texto o NaN devuelve 60; datos corruptos devuelven 60.
- No hacer: crear interfaz.

## T05 · Lógica de partida (reducer puro)
- Objetivo: reglas del juego sin interfaz.
- Archivos: `src/features/game/gameReducer.ts`, `gameReducer.test.ts`.
- Funciones: `createGame(players, words, settings)`, `gameReducer(state, action)` con acciones `START_TURN`, `CORRECT`, `PASS`, `TICK`, `NEXT_TURN`.
- Aceptación (tests): los casos Given-When-Then de `docs/SPEC.md`; el barajado no repite palabras hasta agotar el mazo; con cola vacía se rellena; `TICK` baja `secondsLeft` y al llegar a 0 pasa a `turnEnd`; tras el último jugador pasa a `finished`; rechaza menos de 2 jugadores o menos de 5 palabras.
- No hacer: usar React, localStorage ni temporizadores reales.

## T06 · Hook del temporizador
- Objetivo: llamar `TICK` cada segundo mientras la fase sea `playing`.
- Archivos: `src/features/game/useTimer.ts`.
- Aceptación: se limpia el intervalo al desmontar o cambiar de fase; tipos y lint pasan.
- No hacer: lógica de puntaje.

## T07 · Pantalla de mazos
- Objetivo: ver, crear, copiar, editar y borrar mazos.
- Archivos: `src/features/decks/DecksScreen.tsx` (y componentes auxiliares si hace falta).
- Aceptación: muestra mazos por defecto y propios; editar un mazo por defecto crea la copia; solo se pueden borrar mazos propios; validación de palabras visible; textos en español.
- No hacer: modificar `deckStorage.ts` ni el reducer.

## T08 · Pantalla de preparar partida
- Objetivo: elegir mazo, jugadores y tiempo.
- Archivos: `src/features/game/SetupScreen.tsx`.
- Aceptación: selector de mazo; entrada de 2 a 10 nombres únicos y no vacíos; atajos de tiempo 30/60/90/120 más campo personalizado que usa `normalizeTurnSeconds`; el tiempo elegido se guarda con `saveSettings`; aviso si el mazo tiene menos de 5 palabras; botón Empezar.
- No hacer: cambiar el reducer.

## T09 · Pantallas de juego, fin de turno y resultados
- Objetivo: jugar una partida completa.
- Archivos: `src/features/game/GameScreen.tsx`, `TurnEndScreen.tsx`, `ResultsScreen.tsx`, `src/App.tsx`.
- Aceptación: flujo completo Mazos → Preparar → Turno → Fin de turno → Resultados; botones Acertar y Pasar; tiempo visible; "Jugar otra vez" y "Volver a mazos"; funciona en pantalla de teléfono (vertical) con botones grandes.
- No hacer: nueva lógica de negocio fuera del reducer.

## T10 · Inclinación del teléfono (opcional)
- Objetivo: acertar al inclinar hacia abajo y pasar al inclinar hacia arriba.
- Archivos: `src/features/game/useTilt.ts`, integración en `GameScreen.tsx`.
- Aceptación: pide permiso cuando el navegador lo exige (iPhone); si no hay sensor o se niega el permiso, solo funcionan los botones; evita disparos repetidos con una pausa corta entre gestos.
- No hacer: quitar los botones.

## T11 · Despliegue en GitHub Pages
- Objetivo: publicar la web automáticamente.
- Archivos: `vite.config.ts` (campo `base`), `.github/workflows/deploy.yml`.
- Aceptación: `npm run build` pasa; el flujo de GitHub Actions publica la carpeta `dist`.
- No hacer: subir claves ni secretos.
- Nota: esta tarea la revisamos juntos antes de ejecutarla.

---

## Fase 2 (después)
Supabase: nombre de jugador, salas con código, sincronización y reglas RLS. Se especificará en un documento aparte.
