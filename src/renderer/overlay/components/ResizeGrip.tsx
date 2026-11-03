import { useRef } from 'react'

interface DragStart {
  x: number
  y: number
  width: number
  height: number
}

/** Bottom-right handle that resizes the frameless overlay window in edit mode. */
export function ResizeGrip(): React.JSX.Element {
  const start = useRef<DragStart | null>(null)
  const frame = useRef<number | null>(null)

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    event.currentTarget.setPointerCapture(event.pointerId)
    start.current = {
      x: event.screenX,
      y: event.screenY,
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    const origin = start.current
    if (!origin || frame.current !== null) return
    const { screenX, screenY } = event
    // Coalesce pointer events to one resize request per frame.
    frame.current = requestAnimationFrame(() => {
      frame.current = null
      window.overlayApi.resizeTo({
        width: origin.width + (screenX - origin.x),
        height: origin.height + (screenY - origin.y)
      })
    })
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
    event.currentTarget.releasePointerCapture(event.pointerId)
    start.current = null
  }

  return (
    <div
      className="resize-grip"
      title="Drag to resize"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  )
}
