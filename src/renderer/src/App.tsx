import { useState, useEffect } from 'react'
import TitleBar from './components/TitleBar/TitleBar'
import ComponentShowcase from './routes/ComponentShowcase'
import IpcSmokeTest from './routes/IpcSmokeTest'
import { Button } from './components/ui/Button'

type Route = 'showcase' | 'ipc'

function App(): JSX.Element {
  const [appName, setAppName] = useState<string>('Agent Flow Manager')
  const [route, setRoute] = useState<Route>('ipc')

  useEffect(() => {
    if (window.api) setAppName(window.api.appName)
  }, [])

  return (
    <div className="app-container">
      <TitleBar title={appName} />
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border-subtle bg-bg-deep">
        <Button
          variant={route === 'ipc' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setRoute('ipc')}
        >
          IPC Test
        </Button>
        <Button
          variant={route === 'showcase' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setRoute('showcase')}
        >
          Components
        </Button>
      </div>
      {route === 'showcase' ? <ComponentShowcase /> : <IpcSmokeTest />}
    </div>
  )
}

export default App
