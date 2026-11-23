# AGENTS.md — Reglas para el agente ejecutor

## Proyecto
Juego de charadas web (PWA). Stack: TypeScript estricto, React + Vite, Vitest. Despliegue en GitHub Pages. La especificación está en `docs/SPEC.md` y las tareas en `docs/TASKS.md`. Haz solo la tarea que se te indique.

## Estructura de carpetas
```
src/
  types.ts                      # contratos de datos (no cambiar sin autorización)
  data/defaultDecks.ts          # mazos por defecto (NO modificar)
  features/
    decks/                      # guardado de mazos propios y pantalla de mazos
    settings/                   # tiempo de turno configurable
    game/                       # reducer, temporizador, pantallas de juego, inclinación
  App.tsx
```

## Idioma
- Código, nombres de archivos, variables y commits: inglés.
- Textos que ve el usuario: español.

## Reglas de código
- TypeScript estricto. Prohibido `any`, `@ts-ignore` y suprimir advertencias.
- Funciones de una sola responsabilidad, máximo 30 líneas.
- Lógica de negocio en funciones puras (sin React, sin localStorage directo), en archivos separados de los componentes.
- Componentes funcionales con hooks. Sin librerías nuevas salvo autorización explícita en la tarea.
- Nombres: componentes en PascalCase, funciones y variables en camelCase, constantes en MAYUSCULAS.
- Todo acceso a localStorage va en try/catch y valida el formato leído.
- Nunca escribir claves, tokens ni secretos en el código. El repositorio es público.

## Tests
- Lógica de negocio: escribe los tests primero (Vitest) con caso feliz, casos borde y errores.
- Interfaz: basta con tipos, lint y build. No se exigen tests de componentes.
- Prohibido borrar, comentar o debilitar tests existentes para que pasen.

## Quality gate (al terminar cada tarea)
```
npm run lint
npx tsc -b
npm run test -- --run
npm run build
```
Todo debe pasar en verde.

## Git
- No hagas commits ni uses `git add`, `git reset` ni `git push`. Deja los cambios en el árbol de trabajo.
- Pide confirmación antes de borrar archivos o cambiar configuración global.

## Escalada
- Si falta un contrato o hay una ambigüedad importante, detente y pregunta.
- Si una tarea falla dos veces seguidas en el mismo punto, detente y reporta el error sin seguir intentando y sin tocar archivos fuera de la tarea.

## Formato de respuesta al terminar
1. Archivos creados o modificados.
2. Resultado del quality gate (lint, tipos, tests, build).
3. Resumen de `git diff --stat`.
