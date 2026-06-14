'use client'

import { useEffect } from 'react'

type Modifier = 'ctrl' | 'meta' | 'shift' | 'alt'

interface Shortcut {
  key: string
  modifiers?: Modifier[]
  handler: () => void
  description?: string
}

export function useKeyboard(shortcuts: Shortcut[]) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        const mods = shortcut.modifiers ?? []
        const ctrlOk = mods.includes('ctrl') ? e.ctrlKey : !e.ctrlKey || mods.includes('meta')
        const metaOk = mods.includes('meta') ? e.metaKey : !e.metaKey || mods.includes('ctrl')
        const shiftOk = mods.includes('shift') ? e.shiftKey : !e.shiftKey
        const altOk = mods.includes('alt') ? e.altKey : !e.altKey

        const cmdKey = mods.includes('ctrl') || mods.includes('meta')
        const ctrlOrMeta = cmdKey ? e.ctrlKey || e.metaKey : true

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlOrMeta &&
          (!mods.includes('shift') || e.shiftKey) &&
          (!mods.includes('alt') || e.altKey)
        ) {
          e.preventDefault()
          shortcut.handler()
          return
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts])
}
