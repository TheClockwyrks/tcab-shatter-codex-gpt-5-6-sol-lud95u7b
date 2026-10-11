# Shatter

Shatter is a browser-based gravity-well rock shooter. Fly by momentum around a central star, curve gunfire through its well, break armored rocks through three sizes, and use a guided torpedo when a target needs to disappear now.

## Run it

```sh
npm ci
npm run dev
```

Open the address Vite prints. Build the self-contained static site with `npm run build`; the result is written to `dist/` and can be served from any static host.

## Controls

- Arrow keys or WASD: turn and thrust
- Space: fire
- F: launch the torpedo
- Enter or Space: confirm a menu choice
- Escape: back / pause / resume
- P: pause / resume
- M: mute
- Backquote: diagnostics overlay

Large and medium rocks carry armor. The torpedo flies through the well unaffected, destroys a rock outright, and recharges in ten seconds.
