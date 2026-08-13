import RequireAuth from '@/components/RequireAuth'

export default function CreateTracker() {
  return (
    <RequireAuth>
      <div>
        <h1>Create Tracker</h1>
      </div>
    </RequireAuth>
  )
}
