import { useState, useEffect } from 'react'
import TitleBar from './components/TitleBar/TitleBar'
import AppShell from './components/Layout/AppShell'

function App(): JSX.Element {
  const [appName, setAppName] = useState<string>('Agent Flow Manager')

  useEffect(() => {
    if (window.api) setAppName(window.api.appName)
  }, [])

  return (
    <div className="app-container">
      <TitleBar title={appName} />
      <div className="flex-1 overflow-hidden">
        <AppShell />
      </div>
    </div>
  )
}

export default App
