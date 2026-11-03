import type { WheelFaceProps, WheelSkin } from '../types'

const WIDTH = 400
const HEIGHT = 260

/** Outline of the wheel body: flat top, flared grips, open bottom between the grips. */
const BODY_PATH = [
  'M 96 30',
  'L 304 30',
  'C 330 30, 346 42, 352 62',
  'L 384 150',
  'C 392 176, 390 214, 368 234',
  'C 350 250, 318 246, 308 222',
  'L 296 196',
  'C 290 184, 280 180, 266 180',
  'L 134 180',
  'C 120 180, 110 184, 104 196',
  'L 92 222',
  'C 82 246, 50 250, 32 234',
  'C 10 214, 8 176, 16 150',
  'L 48 62',
  'C 54 42, 70 30, 96 30',
  'Z'
].join(' ')

const LED_COUNT = 15
const LED_SPACING = 14
const LED_START_X = WIDTH / 2 - ((LED_COUNT - 1) * LED_SPACING) / 2
const LED_COLORS = ['#22e055', '#ff2a2a', '#3a7bff'] as const

function ledColor(index: number): string {
  return LED_COLORS[Math.min(2, Math.floor(index / 5))] ?? LED_COLORS[0]
}

interface ButtonSpec {
  x: number
  y: number
  color: string
  label: string
}

const BUTTONS: readonly ButtonSpec[] = [
  { x: 118, y: 84, color: '#ffd400', label: 'DRS' },
  { x: 116, y: 114, color: '#2d6bff', label: 'BB' },
  { x: 110, y: 144, color: '#f2f2f2', label: 'N' },
  { x: 282, y: 84, color: '#ff2a2a', label: 'PIT' },
  { x: 284, y: 114, color: '#20c45a', label: 'OK' },
  { x: 290, y: 144, color: '#ff8a00', label: 'R' }
]

interface KnobSpec {
  x: number
  y: number
  r: number
  angle: number
}

const KNOBS: readonly KnobSpec[] = [
  { x: 162, y: 164, r: 11, angle: -30 },
  { x: 200, y: 166, r: 8, angle: 0 },
  { x: 238, y: 164, r: 11, angle: 40 }
]

const FONT = 'Bahnschrift, "Segoe UI", sans-serif'

function F1ModernFace({ display }: WheelFaceProps): React.JSX.Element {
  const gear = display.gear ?? 'N'

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height="100%"
      role="img"
      aria-label="F1 steering wheel"
    >
      <defs>
        <pattern id="f1m-carbon" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#16171a" />
          <rect width="3" height="3" fill="#1f2125" />
          <rect x="3" y="3" width="3" height="3" fill="#1f2125" />
        </pattern>
        <linearGradient id="f1m-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="f1m-grip" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2a2b2f" />
          <stop offset="0.5" stopColor="#3a3b40" />
          <stop offset="1" stopColor="#25262a" />
        </linearGradient>
        <linearGradient id="f1m-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d1117" />
          <stop offset="1" stopColor="#05070a" />
        </linearGradient>
        <radialGradient id="f1m-knob" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#7d8088" />
          <stop offset="1" stopColor="#2a2c31" />
        </radialGradient>
        <clipPath id="f1m-body-clip">
          <path d={BODY_PATH} />
        </clipPath>
      </defs>

      {/* Body */}
      <path d={BODY_PATH} fill="url(#f1m-carbon)" stroke="#000" strokeWidth="2" />

      {/* Rubber grips, clipped to the body outline */}
      <g clipPath="url(#f1m-body-clip)">
        <rect x="0" y="40" width="94" height="220" fill="url(#f1m-grip)" />
        <rect x="306" y="40" width="94" height="220" fill="url(#f1m-grip)" />
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i} stroke="#1a1b1e" strokeWidth="2" opacity="0.7">
            <line x1="14" y1={110 + i * 12} x2="84" y2={104 + i * 12} />
            <line x1="316" y1={104 + i * 12} x2="386" y2={110 + i * 12} />
          </g>
        ))}
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#f1m-sheen)" />
      </g>

      {/* Top centre marker */}
      <rect x="194" y="30" width="12" height="6" rx="1" fill="#e10600" />

      {/* Rev LEDs (lit by telemetry in a later stage) */}
      <rect
        x={LED_START_X - 10}
        y="40"
        width={(LED_COUNT - 1) * LED_SPACING + 20}
        height="16"
        rx="8"
        fill="#050608"
      />
      {Array.from({ length: LED_COUNT }, (_, i) => (
        <circle
          key={i}
          cx={LED_START_X + i * LED_SPACING}
          cy="48"
          r="4.2"
          fill={ledColor(i)}
          opacity="0.18"
        />
      ))}

      {/* Display */}
      <rect x="138" y="64" width="124" height="82" rx="7" fill="#000" />
      <rect x="142" y="68" width="116" height="74" rx="5" fill="url(#f1m-screen)" />
      <text
        x="200"
        y="124"
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight="700"
        fontSize="54"
        fill="#ffffff"
      >
        {gear}
      </text>
      <text x="148" y="80" fontFamily={FONT} fontSize="9" fill="#7f8794">
        GEAR
      </text>

      {/* Buttons */}
      {BUTTONS.map((button) => (
        <g key={button.label}>
          <circle cx={button.x} cy={button.y} r="10" fill="#0b0c0e" />
          <circle cx={button.x} cy={button.y} r="7.5" fill={button.color} />
          <circle cx={button.x - 2} cy={button.y - 2.5} r="2.5" fill="#fff" opacity="0.35" />
          <text
            x={button.x}
            y={button.y + 20}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize="7"
            fill="#9aa1ab"
          >
            {button.label}
          </text>
        </g>
      ))}

      {/* Rotary knobs */}
      {KNOBS.map((knob) => (
        <g key={knob.x} transform={`rotate(${knob.angle} ${knob.x} ${knob.y})`}>
          <circle cx={knob.x} cy={knob.y} r={knob.r + 2} fill="#0b0c0e" />
          <circle cx={knob.x} cy={knob.y} r={knob.r} fill="url(#f1m-knob)" />
          <rect x={knob.x - 1} y={knob.y - knob.r} width="2" height={knob.r * 0.7} fill="#e10600" />
        </g>
      ))}
    </svg>
  )
}

export const f1ModernSkin: WheelSkin = {
  id: 'f1-modern',
  name: 'F1 Modern',
  width: WIDTH,
  height: HEIGHT,
  Face: F1ModernFace
}
