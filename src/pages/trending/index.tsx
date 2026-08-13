import RequireAuth from '@/components/RequireAuth'

export default function Trending() {
  return (
    <RequireAuth>
      <div>
        <h1>Trending</h1>
      </div>
    </RequireAuth>
  )
}
