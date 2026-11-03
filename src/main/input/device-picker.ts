export interface JoystickDeviceInfo {
  name: string | null
  type: string | null
}

/**
 * Picks the wheel among connected joysticks: first a name match against the
 * configured pattern, then any device SDL classifies as a wheel.
 */
export function pickWheelDevice<T extends JoystickDeviceInfo>(
  devices: readonly T[],
  pattern: string
): T | null {
  const needle = pattern.trim().toLowerCase()
  if (needle) {
    const byName = devices.find((device) => device.name?.toLowerCase().includes(needle))
    if (byName) return byName
  }
  return devices.find((device) => device.type === 'wheel') ?? null
}
