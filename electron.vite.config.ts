import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'

function copySchemaPlugin(): { name: string; closeBundle: () => void } {
  return {
    name: 'copy-schema',
    closeBundle(): void {
      const src = resolve('src/main/db/schema.sql')
      const dest = resolve('out/resources/schema.sql')
      const destDir = dirname(dest)
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true })
      }
      if (existsSync(src)) {
        copyFileSync(src, dest)
      }
    }
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), copySchemaPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [react()]
  }
})
