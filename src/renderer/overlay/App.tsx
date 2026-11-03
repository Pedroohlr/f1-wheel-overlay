import type { CSSProperties } from 'react'
import { f1ModernSkin } from '../skins/f1-modern/F1ModernWheel'
import type { WheelDisplay } from '../skins/types'
import { InputStatus } from './components/InputStatus'
import { ResizeGrip } from './components/ResizeGrip'
import { RotatingWheel } from './components/RotatingWheel'
import { useOverlayMode } from './hooks/useOverlayMode'
import { useSettings } from './hooks/useSettings'

const EMPTY_DISPLAY: WheelDisplay = { gear: null }

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
        {settings && (
          <RotatingWheel
            skin={f1ModernSkin}
            display={EMPTY_DISPLAY}
            rotation={settings.wheel.rotation}
            smoothing={settings.wheel.smoothing}
          />
        )}
      </div>
      {editing && (
        <>
          <div className="edit-banner">EDIT MODE · drag to move · Ctrl+Shift+O to lock</div>
          <InputStatus />
          <ResizeGrip />
        </>
      )}
    </main>
  )
}
