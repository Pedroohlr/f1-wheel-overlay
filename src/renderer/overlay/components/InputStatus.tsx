import { useInputFrame } from '../state/input-store'

/** Shows where input is coming from; only rendered in edit mode. */
export function InputStatus(): React.JSX.Element {
  const { source, device } = useInputFrame()
  const label =
    source === 'wheel'
      ? (device ?? 'Wheel')
      : source === 'simulator'
        ? 'Simulator'
        : 'No wheel detected'
  return <div className={`input-status input-status--${source}`}>{label}</div>
}
