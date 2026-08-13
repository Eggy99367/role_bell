import RequireAuth from '@/components/RequireAuth'
import { verifyWebContent } from '@/utils/axios'
import { useState } from 'react'

export default function CreateTracker() {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [failed, setFailed] = useState(false);
  const [targetURL, setTargetURL] = useState("")

  const handleVerify = async () => {
    setLoading(true);
    const ok = await verifyWebContent(targetURL);
    setVerified(ok);
    setFailed(!ok);
    setLoading(false);
  }

  return (
    <RequireAuth>
      <div className='flex flex-col gap-3'>
        <h1>Create Tracker</h1>
        <input
          type="url"
          placeholder="enter target page's url"
          onChange={(event) => {
            setTargetURL(event.target.value);
            setFailed(false);
          }}
          disabled={loading || verified}
        />
        <button onClick={handleVerify} disabled={loading || verified}>Verify URL</button>
        {failed && <p>fetch failed</p>}
        {verified && <p>fetch successfully</p>}
      </div>
    </RequireAuth>
  )
}
