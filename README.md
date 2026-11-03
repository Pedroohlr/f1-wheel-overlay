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
npm run build      # typecheck and build to out/
npm start          # run the built app
npm run format     # format sources with Prettier
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

## License

MIT
