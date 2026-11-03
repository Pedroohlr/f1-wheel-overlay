import { useEffect, useRef } from 'react'
import type { WheelDisplay, WheelSkin } from '../../skins/types'
import { smoothTowards } from '../smoothing'
import { inputStore } from '../state/input-store'

const FRAME_MS = 1000 / 60

interface RotatingWheelProps {
  skin: WheelSkin
  display: WheelDisplay
  /** Visual lock-to-lock rotation in degrees. */
  rotation: number
  /** 0 = raw, closer to 1 = smoother. */
  smoothing: number
}

/**
 * Draws the skin and rotates it to the current steering angle. The animation
 * loop writes the transform directly (no React re-render), is capped at 60 fps,
 * and stops as soon as the wheel reaches its target.
 */
export function RotatingWheel({
  skin,
  display,
  rotation,
  smoothing
}: RotatingWheelProps): React.JSX.Element {
  const wheelRef = useRef<HTMLDivElement>(null)
  const angleRef = useRef(0)

  useEffect(() => {
    let frame = 0
    let lastTick = performance.now()
    let lastDraw = 0

    const targetAngle = (): number => (inputStore.get().input.steering * rotation) / 2

    const tick = (now: number): void => {
      frame = 0
      if (now - lastDraw < FRAME_MS - 1) {
        frame = requestAnimationFrame(tick)
        return
      }
      const target = targetAngle()
      angleRef.current = smoothTowards(
        angleRef.current,
        target,
        smoothing,
        Math.min(100, now - lastTick)
      )
      lastTick = now
      lastDraw = now
      if (wheelRef.current) wheelRef.current.style.transform = `rotate(${angleRef.current}deg)`
      if (angleRef.current !== target) frame = requestAnimationFrame(tick)
    }

    const wake = (): void => {
      if (frame) return
      lastTick = performance.now()
      frame = requestAnimationFrame(tick)
    }

    const unsubscribe = inputStore.subscribe(wake)
    wake()
    return () => {
      unsubscribe()
      cancelAnimationFrame(frame)
    }
  }, [rotation, smoothing])

  const { Face } = skin
  return (
    <div className="wheel-stage">
      <div
        ref={wheelRef}
        className="wheel"
        style={{ aspectRatio: `${skin.width} / ${skin.height}` }}
      >
        <Face display={display} />
      </div>
    </div>
  )
}
