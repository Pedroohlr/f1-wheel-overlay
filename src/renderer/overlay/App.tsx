import type { CSSProperties } from 'react'
import { ResizeGrip } from './components/ResizeGrip'
import { useOverlayMode } from './hooks/useOverlayMode'
import { useSettings } from './hooks/useSettings'

export function App(): React.JSX.Element {
  const mode = useOverlayMode()
  const settings = useSettings()
  const editing = mode === 'edit'

  // Opacity and scale apply to the content only, so the edit frame stays readable.
  const contentStyle: CSSProperties = settings
    ? { opacity: settings.overlay.opacity, transform: `scale(${settings.overlay.scale})` }
    : { visibility: 'hidden' }

  return (
    <main className={editing ? 'overlay overlay--edit' : 'overlay'}>
      <div className="overlay__content" style={contentStyle}>
        <div className="placeholder">F1 WHEEL OVERLAY</div>
      </div>
      {editing && (
        <>
          <div className="edit-banner">EDIT MODE · drag to move · Ctrl+Shift+O to lock</div>
          <ResizeGrip />
        </>
      )}
    </main>
  )
}
