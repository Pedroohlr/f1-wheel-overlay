import type { ComponentType } from 'react'

/** Data a wheel face can display. Fields are null when no source provides them. */
export interface WheelDisplay {
  gear: string | null
}

export interface WheelFaceProps {
  display: WheelDisplay
}

/**
 * A wheel skin draws the wheel face. Rotation, smoothing and scaling are applied
 * by the overlay, so skins only render a static, upright wheel.
 */
export interface WheelSkin {
  id: string
  name: string
  /** Intrinsic size of the drawing; the overlay preserves this aspect ratio. */
  width: number
  height: number
  Face: ComponentType<WheelFaceProps>
}
