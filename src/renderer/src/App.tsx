import { useState, useEffect } from 'react'
import TitleBar from './components/TitleBar/TitleBar'

function App(): JSX.Element {
  const [appName, setAppName] = useState<string>('Agent Flow Manager')
  const [appVersion, setAppVersion] = useState<string>('0.1.0')
  const [platform, setPlatform] = useState<string>('')

  useEffect(() => {
    if (window.api) {
      setAppName(window.api.appName)
      setAppVersion(window.api.appVersion)
    }

    if (window.platform) {
      window.platform.get().then((p) => setPlatform(p))
    }
  }, [])

  return (
    <div className="app-container">
      <TitleBar title={appName} />
      <main className="app-main">
        <div className="status-card">
          <h2>✅ Chapter 2 Complete</h2>
          <p>Application shell and window management working.</p>
          <ul>
            <li>✓ Frameless window with custom title bar</li>
            <li>✓ Window state persists across launches</li>
            <li>✓ Single-instance enforcement active</li>
            <li>✓ Window controls (minimize/maximize/close)</li>
            <li>✓ Platform detected: {platform || 'detecting...'}</li>
            <li>✓ App version: {appVersion}</li>
          </ul>
          <p className="hint">Try: resize window, close and reopen — it remembers.</p>
        </div>
      </main>
      <footer className="app-footer">
        <p>Ready for Chapter 3</p>
      </footer>
    </div>
  )
}

export default App
