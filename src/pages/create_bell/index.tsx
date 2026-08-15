import RequireAuth from '@/components/RequireAuth'
import { verifyWebContent, triggerCheck } from '@/utils/axios'
import { createTracker } from '@/utils/supabase';
import { useAuth } from '@/utils/AuthContext';
import { useState } from 'react'

const CSS_SELECTOR_RULES = `Supported selectors (Cloudflare HTMLRewriter):
- tag, *, .class, #id
- [attr], [attr="value"], [attr^=], [attr$=], [attr*=], [attr~=], [attr|=]
- descendant (A B) and child (A > B) combinators
- :nth-child(n), :first-child, :nth-of-type(n), :first-of-type, :not(...)

NOT supported:
- :has(), :is(), :where()
- :last-child, :nth-last-child()
- sibling combinators (+, ~)
- :hover and other dynamic pseudo-classes

Tip: to detect "more than 6 items", use
ul.my-list > li:nth-child(7)`;

const DEFAULT_DATA = {
  loading: false,
  verified: false,
  failed: false,
  fetchResult: "",
  conditions: [{id: crypto.randomUUID(), type: "text" as const, value: ""}],
  formData: { targetURL: "", company: "", jobTitle: "", isPublic: false }
};

export default function CreateBell() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(DEFAULT_DATA.loading);
  const [verified, setVerified] = useState(DEFAULT_DATA.verified);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(DEFAULT_DATA.failed);
  const [fetchResult, setFetchResult] = useState(DEFAULT_DATA.fetchResult);
  const [isCopied, setIsCopied] = useState(false);
  const [conditions, setConditions] = useState<{ id: string, type: 'text' | 'css', value: string }[]>(DEFAULT_DATA.conditions);
  const [formData, setFormData] = useState(DEFAULT_DATA.formData);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

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
    const { ok, content } = await verifyWebContent(formData.targetURL);
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

  const handleCreate = async () => {
    if (!session) return;
    const { ok, error, id } = await createTracker(session, conditions, formData);
    if (!ok) {
      console.error("Failed to create bell: ", error);
      return;
    }
    setMessage("Bell Created Successfully!");
    setTimeout(() => setMessage(""), 4000);
    reset();
    if (id) triggerCheck(id);
  }

  const reset = () => {
    setLoading(DEFAULT_DATA.loading);
    setVerified(DEFAULT_DATA.verified);
    setFailed(DEFAULT_DATA.failed);
    setFetchResult(DEFAULT_DATA.fetchResult);
    setConditions(DEFAULT_DATA.conditions);
    setFormData(DEFAULT_DATA.formData);
  }

  return (
    <RequireAuth>
      <div className='flex flex-col gap-3 w-full'>
        <h1 className='text-[#f1eefa]'>Create A Bell</h1>

        <input
          type="url"
          name="targetURL"
          placeholder="enter target page's url"
          value={formData.targetURL}
          onChange={(event) => {
            handleChange(event);
            setFailed(false);
          }}
          disabled={loading || verified}
        />
        <button onClick={handleVerify} disabled={loading || verified || !formData.targetURL.trim()}>Verify URL</button>
        {failed && <p className='text-red-400'>Fetch failed! The URL may be incorrect or the webpage could not be retrieved.</p>}
        {verified && <div className='flex flex-col gap-3'>
          <p className='text-[#9a8fb8]'>Fetch successful! Please copy the fetched results into an <a href="https://html.onlineviewer.net/" target='blank'>Online HTML Viewer</a> to double-check that the output is correct.</p>
          <div className='w-full flex gap-2'>
            <button className="flex-1" onClick={handleCopy} disabled={!verified}>{isCopied ? "Copied" : "Copy Fetch Result"}</button>
            <button className='w-fit bg-gray-500 hover:!bg-gray-600' onClick={reset}>RESET</button>
          </div>
          
          <h2 className='text-[#f1eefa]'>Bell Information</h2>
          <input
            type="text"
            name="company"
            placeholder="enter company"
            value={formData.company}
            onChange={handleChange}
          />
          <input
            type="text"
            name="jobTitle"
            placeholder="enter job title"
            value={formData.jobTitle}
            onChange={handleChange}
          />
          
          <h2 className='text-[#f1eefa]'>Tracked Conditions</h2>
          <p className='text-[#9a8fb8]'>You'll be notified if any condition is met.</p>
          <div className='flex gap-3'>
            <button onClick={() => addCondition('text')}>Add Text</button>
            <button onClick={() => addCondition('css')}>Add CSS Selecter</button>
          </div>
          {[...conditions]
            .sort((a, b) => (a.type === b.type ? 0 : a.type === 'text' ? -1 : 1))
            .map(condition => (
              <div key={condition.id} className='flex flex-col gap-2 border border-line bg-surface p-3 rounded-xl'>
                <div className='flex justify-between items-center'>
                  <h3 className='text-[#f1eefa] flex items-center gap-2'>
                    {condition.type === 'text' ? 'Track Text' : 'Track CSS Selecter'}
                    {condition.type === 'css' && (
                      <span className='relative group' tabIndex={0}>
                        <span className='text-xs text-[#9a8fb8] border border-line rounded-full w-4 h-4 inline-flex items-center justify-center cursor-help'>?</span>
                        <pre className='hidden group-hover:block group-focus:block absolute left-0 top-6 z-10 w-80 whitespace-pre-wrap border border-line bg-surface text-[#9a8fb8] text-xs font-sans p-3 rounded-xl shadow-lg'>
                          {CSS_SELECTOR_RULES}
                        </pre>
                      </span>
                    )}
                  </h3>
                  <button onClick={() => removeCondition(condition.id)} className='border border-red-600 bg-transparent text-red-400 hover:bg-red-950/50'>Delete</button>
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

          <label className='flex items-center gap-2 text-[#9a8fb8]'>
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className='accent-violet-500'
            />
            Make Public <b className='text-[#f1eefa]'>PUBLIC BELL CAN NOT BE DELETED!</b>
          </label>
          <button disabled={formData.company.trim() === "" || formData.jobTitle.trim() === "" || !conditions.some(c => c.value.trim() !== '')} onClick={handleCreate}>Create</button>
        </div>}
        <p className='text-emerald-400'>{message}</p>
      </div>
    </RequireAuth>
  )
}
