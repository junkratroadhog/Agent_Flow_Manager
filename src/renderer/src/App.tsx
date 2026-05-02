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
