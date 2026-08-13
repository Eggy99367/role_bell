import RequireAuth from '@/components/RequireAuth'
import { verifyWebContent } from '@/utils/axios'
import { useState } from 'react'

export default function CreateTracker() {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [failed, setFailed] = useState(false);
  const [targetURL, setTargetURL] = useState("");
  const [fetchResult, setFetchResult] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    const { ok, content } = await verifyWebContent(targetURL);
    setVerified(ok);
    setFailed(!ok);
    setFetchResult(content);
    setLoading(false);
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fetchResult);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

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
        {failed && <p>Fetch failed! The URL may be incorrect or the webpage could not be retrieved.</p>}
        {verified && <p>Fetch successful! Please copy the fetched results into an <a href="https://html.onlineviewer.net/" target='blank'>Online HTML Viewer</a> to double-check that the output is correct.</p>}
        <button onClick={handleCopy} disabled={!verified}>{isCopied ? "Copied" : "Copy Fetch Result"}</button>
        
      </div>
    </RequireAuth>
  )
}
