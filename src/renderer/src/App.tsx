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
      <main className="flex-1 w-full overflow-hidden flex flex-col">
        <AppShell />
      </main>
    </div>
  )
}

export default App
