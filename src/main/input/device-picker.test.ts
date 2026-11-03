import { describe, expect, it } from 'vitest'
import { pickWheelDevice } from './device-picker'

const g29 = { name: 'G29 Driving Force Racing Wheel', type: 'wheel' }
const pad = { name: 'Xbox Controller', type: 'gamecontroller' }
const otherWheel = { name: 'Some Wheel', type: 'wheel' }

describe('pickWheelDevice', () => {
  it('prefers a case-insensitive name match', () => {
    expect(pickWheelDevice([pad, otherWheel, g29], 'g29')).toBe(g29)
  })

  it('falls back to any wheel when the name does not match', () => {
    expect(pickWheelDevice([pad, otherWheel], 'G29')).toBe(otherWheel)
    expect(pickWheelDevice([pad, otherWheel], '   ')).toBe(otherWheel)
  })

  it('never picks a non-wheel device without a name match', () => {
    expect(pickWheelDevice([pad, { name: null, type: null }], 'G29')).toBeNull()
    expect(pickWheelDevice([], 'G29')).toBeNull()
  })
})
