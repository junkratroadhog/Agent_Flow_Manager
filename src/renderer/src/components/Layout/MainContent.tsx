export default function MainContent(): JSX.Element {
  return (
    <div className="flex-1 flex flex-col bg-bg-deepest min-w-0">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <h2 className="text-xl font-semibold mb-2">Welcome to Agent Flow Manager</h2>
          <p className="text-sm text-text-secondary">
            Tabs and chat will be added in Chapter 8. For now, the layout shell is in place.
          </p>
        </div>
      </div>
    </div>
  )
}
