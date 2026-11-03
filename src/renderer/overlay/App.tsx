import { useOverlayMode } from './hooks/useOverlayMode'

export function App(): React.JSX.Element {
  const mode = useOverlayMode()
  const editing = mode === 'edit'

  return (
    <main className={editing ? 'overlay overlay--edit' : 'overlay'}>
      <div className="placeholder">F1 WHEEL OVERLAY</div>
      {editing && (
        <div className="edit-banner">EDIT MODE · drag to move · Ctrl+Shift+O to lock</div>
      )}
    </main>
  )
}
