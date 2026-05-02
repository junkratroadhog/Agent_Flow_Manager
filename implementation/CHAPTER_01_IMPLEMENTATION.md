# 📘 Chapter 1 Implementation Plan: Project Bootstrap & Environment Setup

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 1 of the Agent Flow Manager project. Follow this document EXACTLY in order.
>
> **CRITICAL RULES:**
>
> 1. Execute each task in the order given. DO NOT skip ahead.
> 2. After each task, run the verification command. If it fails, STOP and fix before moving on.
> 3. Copy file contents EXACTLY as written. Do not "improve" or modify them.
> 4. If a command fails, read the error carefully. Do not guess solutions.
> 5. Use `npm` only (not yarn or pnpm) unless the user explicitly says otherwise.
> 6. Run all commands from the project root directory unless specified otherwise.
> 7. After completing this chapter, run the FINAL VERIFICATION at the bottom.
> 8. The chapter is ONLY complete when ALL final verification checks pass.

---

## 🎯 Chapter 1 Goal

Establish a working Electron + React + TypeScript development environment that builds and launches without errors on Windows, with code quality tooling and a working production build pipeline.

## 📋 What Will Exist When This Chapter Is Done

- A folder called `agent-flow-manager` with proper structure
- A working Electron app that launches when running `npm run dev`
- A React + TypeScript renderer with hot reload
- ESLint + Prettier + Husky configured
- A production build that creates a `.exe` installer
- A Git repository with the first commit made
- All the boilerplate ready for Chapter 2

---

# 📦 SECTION 1: Prerequisite Verification

## Task 1.1: Verify Node.js

**Command to run:**

```bash
node --version
```

**Expected output:** Something like `v20.x.x` or `v22.x.x` (must be 20 or higher)

**If output is wrong or command fails:**

- STOP. Tell the user: "Please install Node.js v20 or later from https://nodejs.org/ before continuing."
- Do not proceed.

## Task 1.2: Verify npm

**Command to run:**

```bash
npm --version
```

**Expected output:** Something like `10.x.x` or higher

**If output is wrong:** STOP. Tell user to update npm with `npm install -g npm@latest`.

## Task 1.3: Verify Git

**Command to run:**

```bash
git --version
```

**Expected output:** Something like `git version 2.x.x`

**If output is wrong:** STOP. Tell user to install Git from https://git-scm.com/

## Task 1.4: Verify Docker (for later chapters, just check)

**Command to run:**

```bash
docker --version
```

**Expected output:** Something like `Docker version 24.x.x`

**If output fails:** WARN the user that Docker is needed in later chapters but allow them to proceed for Chapter 1.

---

# 📦 SECTION 2: Repository Initialization

## Task 2.1: Create Project Folder

**Commands to run:**

```bash
mkdir agent-flow-manager
cd agent-flow-manager
```

**Verification:**

```bash
pwd
```

Output should end with `/agent-flow-manager` or `\agent-flow-manager`.

## Task 2.2: Initialize Git

**Command to run:**

```bash
git init
```

**Expected output:** `Initialized empty Git repository in ...`

## Task 2.3: Create .gitignore

**Action:** Create a file named `.gitignore` in the project root.

**File path:** `.gitignore`

**Exact content:**

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
out/
build/
.vite/
*.tsbuildinfo

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Environment files
.env
.env.local
.env.*.local

# Editor directories
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
desktop.ini

# Electron
release/
release-builds/

# Test coverage
coverage/
.nyc_output/

# Cache
.cache/
.parcel-cache/
.eslintcache
.stylelintcache

# Database files (development)
*.db
*.db-journal
*.sqlite
*.sqlite-journal

# Local config
local.config.json
```

**Verification:**

```bash
cat .gitignore
```

Confirm the file content matches above.

## Task 2.4: Create README.md

**File path:** `README.md`

**Exact content:**

```markdown
# Agent Flow Manager

An Antigravity-style AI agent management desktop application built with Electron, React, and TypeScript.

## Features (Planned)

- 💬 Chat with multiple LLM providers (cloud + local)
- 🤖 Dynamic sub-agent spawning with live flow visualization
- 🛠️ Plugin-based tool system with marketplace
- 🧠 Multi-mode AI (Fast / Plan / Deep Think / Deep Research)
- 📁 Local + SSH remote workspace support
- 🔌 MCP (Model Context Protocol) integration

## Status

🚧 In active development - Chapter 1 (Foundation)

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
npm run build:win
\`\`\`

## License

MIT
```

## Task 2.5: Create LICENSE file

**File path:** `LICENSE`

**Action:** Create a standard MIT License file. Use this template, replacing `[YEAR]` with current year and `[YOUR NAME]` with the user's name (ask user if not provided, default to "Agent Flow Manager Contributors"):

```
MIT License

Copyright (c) [YEAR] [YOUR NAME]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

# 📦 SECTION 3: Electron + Vite + React + TypeScript Scaffold

## Task 3.1: Initialize package.json

**Command to run:**

```bash
npm init -y
```

## Task 3.2: Replace package.json with the project version

**Action:** OVERWRITE the entire `package.json` file with this exact content:

**File path:** `package.json`

**Exact content:**

```json
{
  "name": "agent-flow-manager",
  "version": "0.1.0",
  "description": "Antigravity-style AI agent management desktop application",
  "main": "./out/main/index.js",
  "author": "Agent Flow Manager Contributors",
  "license": "MIT",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "npm run typecheck && electron-vite build",
    "build:win": "npm run build && electron-builder --win --config",
    "build:mac": "npm run build && electron-builder --mac --config",
    "build:linux": "npm run build && electron-builder --linux --config",
    "typecheck:node": "tsc --noEmit -p tsconfig.node.json --composite false",
    "typecheck:web": "tsc --noEmit -p tsconfig.web.json --composite false",
    "typecheck": "npm run typecheck:node && npm run typecheck:web",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:run": "vitest run",
    "prepare": "husky"
  },
  "dependencies": {
    "@electron-toolkit/preload": "^3.0.1",
    "@electron-toolkit/utils": "^3.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.10",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.16.1",
    "@typescript-eslint/parser": "^7.16.1",
    "@vitejs/plugin-react": "^4.3.1",
    "electron": "^31.2.0",
    "electron-builder": "^24.13.3",
    "electron-vite": "^2.3.0",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react": "^7.34.4",
    "eslint-plugin-react-hooks": "^4.6.2",
    "husky": "^9.1.1",
    "prettier": "^3.3.3",
    "typescript": "^5.5.3",
    "vite": "^5.3.4",
    "vitest": "^2.0.3",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.6",
    "jsdom": "^24.1.0"
  }
}
```

## Task 3.3: Install all dependencies

**Command to run:**

```bash
npm install
```

**Expected output:** Should complete without errors. Will take 2-5 minutes.

**If errors occur:**

- If you see "EACCES" errors on Linux/Mac, do NOT use sudo. Tell user to fix npm permissions.
- If you see network errors, retry with `npm install --registry https://registry.npmjs.org/`
- If specific package fails, do NOT change versions. Tell user to retry.

**Verification:**

```bash
ls node_modules
```

Should show many folders.

## Task 3.4: Create Folder Structure

**Commands to run (run each one separately):**

```bash
mkdir -p src/main
mkdir -p src/preload
mkdir -p src/renderer/src
mkdir -p src/renderer/src/components
mkdir -p src/renderer/src/styles
mkdir -p src/shared
mkdir -p resources
mkdir -p tests/unit
```

**Verification:**

```bash
ls src
```

Should output: `main`, `preload`, `renderer`, `shared`

## Task 3.5: Create Root tsconfig.json

**File path:** `tsconfig.json`

**Exact content:**

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.node.json" }, { "path": "./tsconfig.web.json" }]
}
```

## Task 3.6: Create tsconfig.node.json (for main + preload)

**File path:** `tsconfig.node.json`

**Exact content:**

```json
{
  "extends": "@electron-toolkit/tsconfig/tsconfig.node.json",
  "include": ["electron.vite.config.*", "src/main/**/*", "src/preload/**/*", "src/shared/**/*"],
  "compilerOptions": {
    "composite": true,
    "types": ["electron-vite/node"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/shared/*"]
    }
  }
}
```

**WARNING:** This file extends `@electron-toolkit/tsconfig`. We need to install it first.

## Task 3.7: Install electron-toolkit tsconfig

**Command to run:**

```bash
npm install --save-dev @electron-toolkit/tsconfig
```

## Task 3.8: Create tsconfig.web.json (for renderer)

**File path:** `tsconfig.web.json`

**Exact content:**

```json
{
  "extends": "@electron-toolkit/tsconfig/tsconfig.web.json",
  "include": [
    "src/renderer/src/**/*",
    "src/renderer/src/**/*.tsx",
    "src/preload/*.d.ts",
    "src/shared/**/*"
  ],
  "compilerOptions": {
    "composite": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": ".",
    "paths": {
      "@renderer/*": ["src/renderer/src/*"],
      "@shared/*": ["src/shared/*"]
    }
  }
}
```

## Task 3.9: Create electron.vite.config.ts

**File path:** `electron.vite.config.ts`

**Exact content:**

```typescript
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
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
```

## Task 3.10: Create Main Process Entry

**File path:** `src/main/index.ts`

**Exact content:**

```typescript
import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    autoHideMenuBar: true,
    title: 'Agent Flow Manager',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.agentflow.manager')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

## Task 3.11: Create Preload Script

**File path:** `src/preload/index.ts`

**Exact content:**

```typescript
import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  appName: 'Agent Flow Manager',
  appVersion: '0.1.0'
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
```

## Task 3.12: Create Preload Type Declaration

**File path:** `src/preload/index.d.ts`

**Exact content:**

```typescript
import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      appName: string
      appVersion: string
    }
  }
}
```

## Task 3.13: Create Renderer index.html

**File path:** `src/renderer/index.html`

**Exact content:**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="./src/assets/icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
    />
    <title>Agent Flow Manager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./src/main.tsx"></script>
  </body>
</html>
```

## Task 3.14: Create Renderer Entry main.tsx

**File path:** `src/renderer/src/main.tsx`

**Exact content:**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

## Task 3.15: Create App.tsx

**File path:** `src/renderer/src/App.tsx`

**Exact content:**

```typescript
import { useState, useEffect } from 'react'

function App(): JSX.Element {
  const [appName, setAppName] = useState<string>('Loading...')
  const [appVersion, setAppVersion] = useState<string>('')

  useEffect(() => {
    if (window.api) {
      setAppName(window.api.appName)
      setAppVersion(window.api.appVersion)
    }
  }, [])

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>{appName}</h1>
        <p className="version">v{appVersion}</p>
      </header>
      <main className="app-main">
        <div className="status-card">
          <h2>✅ Chapter 1 Complete</h2>
          <p>The application shell is working.</p>
          <ul>
            <li>✓ Electron main process running</li>
            <li>✓ Preload script loaded</li>
            <li>✓ React renderer mounted</li>
            <li>✓ Context isolation enabled</li>
            <li>✓ TypeScript compiling</li>
          </ul>
        </div>
      </main>
      <footer className="app-footer">
        <p>Ready for Chapter 2</p>
      </footer>
    </div>
  )
}

export default App
```

## Task 3.16: Create Initial Global CSS

**File path:** `src/renderer/src/styles/globals.css`

**Exact content:**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#root {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #0a0a0a;
  color: #e0e0e0;
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(180deg, #0a0a0a 0%, #111111 100%);
}

.app-header {
  padding: 24px 32px;
  border-bottom: 1px solid #1f1f1f;
}

.app-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.version {
  font-size: 12px;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
}

.app-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.status-card {
  background-color: #141414;
  border: 1px solid #1f1f1f;
  border-radius: 12px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
}

.status-card h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #ffffff;
}

.status-card p {
  color: #9ca3af;
  margin-bottom: 16px;
}

.status-card ul {
  list-style: none;
  padding: 0;
}

.status-card li {
  padding: 6px 0;
  color: #d1d5db;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.app-footer {
  padding: 12px 32px;
  border-top: 1px solid #1f1f1f;
  text-align: center;
  font-size: 11px;
  color: #6b7280;
}
```

## Task 3.17: Create Shared Types Placeholder

**File path:** `src/shared/types.ts`

**Exact content:**

```typescript
// Shared TypeScript types between main, preload, and renderer.
// This file is intentionally minimal at this stage - it will be
// expanded in Chapter 6 (IPC & Process Communication).

export interface AppInfo {
  name: string
  version: string
}
```

---

# 📦 SECTION 4: First Test Run

## Task 4.1: Run Type Check

**Command to run:**

```bash
npm run typecheck
```

**Expected output:** No errors. Both `typecheck:node` and `typecheck:web` should complete with exit code 0.

**If errors occur:**

- Read the error message carefully
- Check that all file paths and contents match exactly
- Common issue: missing files - verify all files from Section 3 exist
- Common issue: typos in imports - verify exact match

**STOP HERE if typecheck fails. Fix all errors before proceeding.**

## Task 4.2: Run Dev Mode

**Command to run:**

```bash
npm run dev
```

**Expected behavior:**

1. Vite dev server starts
2. Electron window opens within ~5 seconds
3. The window shows "Agent Flow Manager" title
4. The status card displays "✅ Chapter 1 Complete"
5. All 5 checkmarks appear

**If the app doesn't start:**

- Check terminal output for errors
- If "ELECTRON_RENDERER_URL is undefined", restart with `npm run dev` again
- If port already in use, kill node processes and retry
- If white screen, open DevTools (Ctrl+Shift+I) and check console

**To stop the app:** Close the window OR press `Ctrl+C` in terminal.

**🛑 USER VERIFICATION REQUIRED:** Ask the user to confirm:

- [ ] App window opens
- [ ] Title bar shows "Agent Flow Manager"
- [ ] Dark theme is visible
- [ ] Status card shows all 5 checkmarks
- [ ] Closing the window quits the app

**DO NOT PROCEED until user confirms all 5 items work.**

---

# 📦 SECTION 5: Code Quality Tooling

## Task 5.1: Create ESLint Config

**File path:** `.eslintrc.cjs`

**Exact content:**

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }]
  },
  ignorePatterns: ['node_modules', 'dist', 'out', '.eslintrc.cjs', 'electron.vite.config.ts']
}
```

## Task 5.2: Create Prettier Config

**File path:** `.prettierrc`

**Exact content:**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf",
  "arrowParens": "always",
  "bracketSpacing": true
}
```

## Task 5.3: Create Prettier Ignore

**File path:** `.prettierignore`

**Exact content:**

```
node_modules
dist
out
build
release
coverage
*.log
package-lock.json
```

## Task 5.4: Create EditorConfig

**File path:** `.editorconfig`

**Exact content:**

```
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

## Task 5.5: Create VS Code Recommendations

**File path:** `.vscode/extensions.json`

**Exact content:**

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "editorconfig.editorconfig",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## Task 5.6: Create VS Code Settings

**File path:** `.vscode/settings.json`

**Exact content:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Task 5.7: Initialize Husky

**Commands to run:**

```bash
npx husky init
```

**Expected output:** Creates `.husky/pre-commit` file.

## Task 5.8: Configure Pre-commit Hook

**File path:** `.husky/pre-commit`

**Action:** OVERWRITE the existing file with this exact content:

```sh
npm run lint
npm run format:check
```

## Task 5.9: Run Lint Check

**Command to run:**

```bash
npm run lint
```

**Expected output:** No errors. May have warnings.

**If errors occur:** Run `npm run lint:fix` to auto-fix, then run lint again.

## Task 5.10: Run Format Check

**Command to run:**

```bash
npm run format
```

**Expected output:** Files are formatted. Will modify some files.

**Verification:**

```bash
npm run format:check
```

Should pass.

---

# 📦 SECTION 6: Production Build Pipeline

## Task 6.1: Create electron-builder Config

**File path:** `electron-builder.yml`

**Exact content:**

```yaml
appId: com.agentflow.manager
productName: Agent Flow Manager
directories:
  buildResources: build
  output: release/${version}
files:
  - '!**/.vscode/*'
  - '!src/*'
  - '!electron.vite.config.{js,ts,mjs,cjs}'
  - '!{.eslintrc.cjs,.prettierrc,.prettierignore,.editorconfig}'
  - '!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}'
  - '!{tests,docs}'
  - '!*.{md,log}'
asarUnpack:
  - resources/**
win:
  target:
    - target: nsis
      arch:
        - x64
  artifactName: ${productName}-${version}-setup.${ext}
nsis:
  oneClick: false
  perMachine: false
  allowToChangeInstallationDirectory: true
  deleteAppDataOnUninstall: false
mac:
  target:
    - target: dmg
      arch:
        - x64
        - arm64
  category: public.app-category.developer-tools
  artifactName: ${productName}-${version}.${ext}
linux:
  target:
    - AppImage
    - deb
  maintainer: agent-flow-manager
  category: Development
  artifactName: ${productName}-${version}.${ext}
```

## Task 6.2: Create build Resources Folder

**Commands to run:**

```bash
mkdir -p build
mkdir -p resources
```

## Task 6.3: Create Placeholder Icon

**Note:** electron-builder needs an icon. We'll create a placeholder.

**File path:** `build/icon.png`

**Action:** Since we can't create binary files in this plan, do this:

1. Tell the user: "We need a 512x512 PNG icon at `build/icon.png`. For now, you can:
   - Option A: Skip this - Electron will use default icon for development
   - Option B: Download any 512x512 PNG and save as `build/icon.png`
   - Option C: I'll generate one in a later chapter"
2. Continue without icon for now.

## Task 6.4: Run Production Build (Skip on Slow Machines)

**Command to run:**

```bash
npm run build
```

**Expected output:**

- TypeScript check passes
- Three builds complete (main, preload, renderer)
- Output appears in `out/` folder
- No errors

**Verification:**

```bash
ls out
```

Should show: `main`, `preload`, `renderer`

**If build fails:** Read errors, do NOT skip. Common issues:

- TypeScript errors: fix them
- Missing imports: verify files exist

## Task 6.5: Test Building Windows Installer (Optional - Time Consuming)

**Command to run (only if user wants to verify):**

```bash
npm run build:win
```

**Expected output:** Creates `.exe` installer in `release/0.1.0/` folder. Takes 2-5 minutes.

**Verification:**

```bash
ls release
```

**Note:** Skip this if user wants to move quickly. Just running `npm run build` is sufficient proof the pipeline works.

---

# 📦 SECTION 7: Test Setup

## Task 7.1: Create Vitest Config

**File path:** `vitest.config.ts`

**Exact content:**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'out', 'release']
  },
  resolve: {
    alias: {
      '@renderer': resolve('src/renderer/src'),
      '@shared': resolve('src/shared')
    }
  }
})
```

## Task 7.2: Create Test Setup File

**File path:** `tests/setup.ts`

**Exact content:**

```typescript
import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
```

## Task 7.3: Create First Smoke Test

**File path:** `tests/unit/App.test.tsx`

**Exact content:**

```typescript
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../src/renderer/src/App'

describe('App', () => {
  beforeAll(() => {
    // Mock window.api before App tries to read it
    Object.defineProperty(window, 'api', {
      value: {
        appName: 'Agent Flow Manager',
        appVersion: '0.1.0'
      },
      writable: true
    })
  })

  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText(/Agent Flow Manager/i)).toBeInTheDocument()
  })

  it('displays the chapter 1 status card', () => {
    render(<App />)
    expect(screen.getByText(/Chapter 1 Complete/i)).toBeInTheDocument()
  })

  it('displays the version', () => {
    render(<App />)
    expect(screen.getByText(/0\.1\.0/)).toBeInTheDocument()
  })
})
```

## Task 7.4: Run Tests

**Command to run:**

```bash
npm run test:run
```

**Expected output:**

- 3 tests pass
- No failures
- Total time under 5 seconds

**If tests fail:** Read errors carefully. Do NOT skip. Tests must pass.

---

# 📦 SECTION 8: Initial Git Commit

## Task 8.1: Stage All Files

**Command to run:**

```bash
git add .
```

## Task 8.2: Verify Staged Files

**Command to run:**

```bash
git status
```

**Expected:** Many files listed under "Changes to be committed". `node_modules` should NOT appear.

**If `node_modules` appears:** Stop. Verify `.gitignore` has `node_modules/` and re-run.

## Task 8.3: Make Initial Commit

**Command to run:**

```bash
git commit -m "chore: bootstrap Electron + React + TypeScript project (Chapter 1)"
```

**Expected output:** Pre-commit hook runs (lint + format check), then commit succeeds.

**If pre-commit fails:** Fix the errors, run `git add .` again, retry commit.

---

# 🏁 FINAL VERIFICATION CHECKLIST

Run each command and verify the expected output. ALL must pass before declaring Chapter 1 done.

## ✅ Check 1: All required files exist

**Command:**

```bash
ls package.json tsconfig.json tsconfig.node.json tsconfig.web.json electron.vite.config.ts .eslintrc.cjs .prettierrc .gitignore README.md LICENSE
```

**Expected:** All 10 files listed without "No such file" errors.

## ✅ Check 2: Source files exist

**Command:**

```bash
ls src/main/index.ts src/preload/index.ts src/preload/index.d.ts src/renderer/index.html src/renderer/src/main.tsx src/renderer/src/App.tsx src/renderer/src/styles/globals.css src/shared/types.ts
```

**Expected:** All 8 files listed.

## ✅ Check 3: TypeScript compiles

**Command:**

```bash
npm run typecheck
```

**Expected:** Exits with code 0, no errors.

## ✅ Check 4: Lint passes

**Command:**

```bash
npm run lint
```

**Expected:** Exits with code 0, no errors (warnings acceptable).

## ✅ Check 5: Format check passes

**Command:**

```bash
npm run format:check
```

**Expected:** Exits with code 0.

## ✅ Check 6: Tests pass

**Command:**

```bash
npm run test:run
```

**Expected:** 3 tests pass.

## ✅ Check 7: Production build works

**Command:**

```bash
npm run build
```

**Expected:** Exits with code 0. Creates `out/` folder with `main`, `preload`, `renderer` subfolders.

## ✅ Check 8: Dev mode launches successfully

**Command:**

```bash
npm run dev
```

**🛑 USER MUST CONFIRM:**

- [ ] App window opens
- [ ] No errors in terminal
- [ ] Title shows "Agent Flow Manager"
- [ ] Dark theme visible
- [ ] All 5 status checkmarks appear
- [ ] Closing window quits app cleanly

**Stop the app after verification (Ctrl+C or close window).**

## ✅ Check 9: Git is properly configured

**Command:**

```bash
git log --oneline
```

**Expected:** At least one commit visible with message about bootstrapping.

## ✅ Check 10: Folder structure is correct

**Command:**

```bash
ls src
```

**Expected output:** `main`, `preload`, `renderer`, `shared`

---

# 📊 Chapter 1 Completion Report

When all 10 final verification checks pass, report this to the user:

```
✅ Chapter 1: Project Bootstrap & Environment Setup - COMPLETE

Acceptance Criteria Met:
✅ Node.js v20+ verified
✅ Project repository initialized with Git
✅ Electron + Vite + React + TypeScript scaffold working
✅ Dev mode launches Electron window successfully
✅ React renders inside Electron window
✅ Hot reload works for renderer
✅ No TypeScript errors
✅ ESLint configured and passing
✅ Prettier configured and passing
✅ Husky pre-commit hook installed
✅ Vitest configured with first smoke test passing
✅ Production build produces working output
✅ Initial git commit made

Deliverables Created:
- package.json
- tsconfig.json + tsconfig.node.json + tsconfig.web.json
- electron.vite.config.ts
- electron-builder.yml
- src/main/index.ts
- src/preload/index.ts + index.d.ts
- src/renderer/index.html
- src/renderer/src/main.tsx + App.tsx + styles/globals.css
- src/shared/types.ts
- .eslintrc.cjs + .prettierrc + .prettierignore + .editorconfig
- .vscode/extensions.json + settings.json
- .husky/pre-commit
- vitest.config.ts + tests/setup.ts + tests/unit/App.test.tsx
- .gitignore + README.md + LICENSE

Ready to proceed to Chapter 2: Application Shell & Window Management.
```

---

# 🚨 Troubleshooting Guide

## Problem: `npm install` hangs or fails

**Solutions:**

1. Delete `node_modules` and `package-lock.json`
2. Clear npm cache: `npm cache clean --force`
3. Retry: `npm install`

## Problem: "Cannot find module '@electron-toolkit/...'"

**Solution:** Run `npm install` again. If persistent, check `package.json` matches exactly.

## Problem: Electron window doesn't open

**Solutions:**

1. Check terminal for errors
2. Verify `electron.vite.config.ts` exists and matches exactly
3. Try `npm run build` first, then `npm run dev`

## Problem: Blank white window

**Solutions:**

1. Open DevTools: Ctrl+Shift+I
2. Check Console for errors
3. Verify `src/renderer/index.html` script path is correct

## Problem: TypeScript errors about missing types

**Solution:** Run `npm install` to ensure all `@types/*` packages are installed.

## Problem: Husky pre-commit hook not running

**Solutions:**

1. Run `npm run prepare` manually
2. Verify `.husky/pre-commit` exists and is executable
3. On Linux/Mac: `chmod +x .husky/pre-commit`

## Problem: Build fails with "icon not found"

**Solution:** Skip Windows build for now (Task 6.5 is optional). The dev environment works without an icon.

---

# 📝 Notes for the Implementing LLM

1. **DO NOT add features not specified.** This chapter is foundation only.
2. **DO NOT install extra packages.** Use exactly what's in `package.json`.
3. **DO NOT modify code style.** Follow Prettier rules strictly.
4. **DO NOT skip verification.** Each check exists for a reason.
5. **DO NOT proceed to Chapter 2** until all 10 final checks pass.
6. **ASK THE USER** for confirmation at each USER VERIFICATION REQUIRED point.
7. **REPORT ERRORS HONESTLY.** Do not pretend something works when it doesn't.

---

**End of Chapter 1 Implementation Plan**
