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
  const [conditions, setConditions] = useState<{ id: string, type: 'text' | 'css', value: string }[]>([]);

  const addCondition = (type: 'text' | 'css') => {
    setConditions(prev => [...prev, { id: crypto.randomUUID(), type, value: '' }]);
  };

  const updateCondition = (id: string, value: string) => {
    setConditions(prev => prev.map(c => c.id === id ? { ...c, value } : c));
  };

  const removeCondition = (id: string) => {
    setConditions(prev => prev.filter(c => c.id !== id));
  };

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
        {verified && <div className='flex flex-col gap-3'>
          <p>Fetch successful! Please copy the fetched results into an <a href="https://html.onlineviewer.net/" target='blank'>Online HTML Viewer</a> to double-check that the output is correct.</p>
          <button onClick={handleCopy} disabled={!verified}>{isCopied ? "Copied" : "Copy Fetch Result"}</button>
          <h2>Tracked Conditions</h2>
          <p>You'll be notified if any condition is met.</p>
          <div className='flex gap-3'>
            <button onClick={() => addCondition('text')}>Add Text</button>
            <button onClick={() => addCondition('css')}>Add CSS Selecter</button>
          </div>
          {[...conditions]
            .sort((a, b) => (a.type === b.type ? 0 : a.type === 'text' ? -1 : 1))
            .map(condition => (
              <div key={condition.id} className='flex flex-col gap-2 border p-3 rounded'>
                <div className='flex justify-between items-center'>
                  <h3>{condition.type === 'text' ? 'Track Text' : 'Track CSS Selecter'}</h3>
                  <button onClick={() => removeCondition(condition.id)}>Delete</button>
                </div>
                {condition.type === 'text' ? (
                  <input
                    type="text"
                    placeholder="enter text to track"
                    value={condition.value}
                    onChange={(event) => updateCondition(condition.id, event.target.value)}
                  />
                ) : (
                  <textarea
                    placeholder="enter CSS selector to track"
                    value={condition.value}
                    onChange={(event) => updateCondition(condition.id, event.target.value)}
                  />
                )}
              </div>
            ))}
        </div>}
      </div>
    </RequireAuth>
  )
}
