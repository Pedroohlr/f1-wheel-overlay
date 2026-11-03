# F1 Wheel Overlay

Steering wheel overlay for F1 streams. Shows your G29 inputs on screen.

A lightweight Windows desktop app (Electron + React + TypeScript) that draws a
virtual F1-style steering wheel, pedal bars and race telemetry on top of your
screen, ready to be captured by OBS.

> Work in progress. Installation, game telemetry setup, OBS setup and skin
> authoring guides will be added as the features land.

## Planned features

- Transparent, frameless, always-on-top overlay with click-through and edit modes
- Logitech G29 input (wheel, throttle, brake, clutch) with calibration
- Configurable visual rotation (180° to 900°) and optional smoothing
- F1 game UDP telemetry: speed, gear, RPM LEDs, DRS
- Skin system with modern F1 and classic round wheels
- Local server for OBS Browser Source
- Settings window and system tray menu

## Development

Requirements: Windows 10/11 and Node.js 22 or newer.

```bash
npm install
npm run dev        # start the app with hot reload
npm run dev:sim    # same, driven by the input simulator (no wheel needed)
npm run build      # typecheck and build to out/
npm start          # run the built app
npm run format     # format sources with Prettier
npm test           # run unit tests
```

### Overlay controls

| Action                      | How                                          |
| --------------------------- | -------------------------------------------- |
| Toggle edit / click-through | `Ctrl+Shift+O`                               |
| Move the overlay            | Edit mode, drag anywhere inside the frame    |
| Resize the overlay          | Edit mode, drag the bottom-right corner grip |

In click-through mode the overlay never takes focus and every click goes to
the game. Position, size, opacity and scale are saved to
`%APPDATA%\f1-wheel-overlay\settings.json`.

### Wheel input

The wheel is read natively through SDL in the main process, so input keeps
flowing while the game has focus (Chromium's Gamepad API stops without focus).
The wheel is picked by name (default `G29`) or by SDL's wheel classification,
and plugging or unplugging it is detected automatically.

Default G29 mapping (G HUB installed, PC mode):

| Axis | Control  | Raw range                    |
| ---- | -------- | ---------------------------- |
| 0    | Steering | -1 (left) to 1 (right)       |
| 1    | Throttle | 1 (released) to -1 (pressed) |
| 2    | Brake    | 1 (released) to -1 (pressed) |
| 3    | Clutch   | 1 (released) to -1 (pressed) |

The visual lock-to-lock rotation (`wheel.rotation`, default 900) should match
the operating range set in G HUB so the overlay mirrors the real wheel.
`wheel.smoothing` goes from 0 (raw) to 0.95 (very smooth).

## License

MIT
