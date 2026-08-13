import RequireAuth from '@/components/RequireAuth'

export default function MyTracker() {
  return (
    <RequireAuth>
      <div>
        <h1>My Tracker</h1>
      </div>
    </RequireAuth>
  )
}
