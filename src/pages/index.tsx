import { Link } from 'react-router-dom'

const FEATURES = [
  { label: 'Watch', copy: 'Point RoleBell at any job page, public or gated behind a login.' },
  { label: 'Detect', copy: "We check for the text or element that means applications are open." },
  { label: 'Notify', copy: 'The moment it appears, you get an email. No more refreshing.' },
]

export default function Home() {
  return (
    <div className='flex-1 flex flex-col items-center justify-center gap-14 text-center py-10'>
      <div className='relative flex flex-col items-center gap-6 max-w-2xl'>
        <div
          className='pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full blur-3xl opacity-40'
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
          aria-hidden='true'
        />
        <span className='relative text-xs font-semibold tracking-[0.2em] text-violet-300 uppercase'>Automated job watch</span>
        <h1 className='relative text-[#f1eefa]'>When a job opens for applications, we'll tell you first</h1>
        <p className='relative text-[#9a8fb8] sm:text-lg'>
          Many job pages go live before applications open. RoleBell watches the page for you and emails you the moment the apply button appears, so you don't have to keep checking.
        </p>
        <Link to='/create_bell' className='relative no-underline'>
          <button className='relative px-6 py-3 text-base animate-pulsering'>Create your first tracker</button>
        </Link>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl'>
        {FEATURES.map((f) => (
          <div key={f.label} className='rounded-xl border border-line bg-surface p-5 text-left flex flex-col gap-1.5'>
            <span className='text-sm font-semibold text-violet-300'>{f.label}</span>
            <p className='text-sm text-[#9a8fb8]'>{f.copy}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
