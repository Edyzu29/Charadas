import { useEffect } from 'react'
import type { Dispatch } from 'react'
import type { GamePhase } from '../../types'
import type { GameAction } from './gameReducer'

export function useTimer(phase: GamePhase, dispatch: Dispatch<GameAction>): void {
  useEffect(() => {
    if (phase !== 'playing') return
    const intervalId = window.setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => window.clearInterval(intervalId)
  }, [phase, dispatch])
}
