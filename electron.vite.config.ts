import { resolve } from 'node:path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

const sharedAlias = { '@shared': resolve(__dirname, 'src/shared') }

export default defineConfig({
  main: {
    resolve: { alias: sharedAlias }
  },
  preload: {
    resolve: { alias: sharedAlias }
  },
  renderer: {
    root: resolve(__dirname, 'src/renderer'),
    resolve: { alias: sharedAlias },
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          overlay: resolve(__dirname, 'src/renderer/overlay/index.html')
        }
      }
    }
  }
})
