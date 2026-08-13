import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className='min-h-screen w-full flex flex-col bg-void'>
      <Navbar />
      <div className='w-full max-w-6xl mx-auto px-4 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-20 flex-1 flex flex-col'>
        <Outlet />
      </div>
      <footer className='text-center text-xs text-[#6b6480] py-6 border-t border-line'>
        Made by <a href='https://github.com/Eggy99367' target='_blank' rel='noopener noreferrer' className='hover:underline'>Vincent Chen</a>
      </footer>
    </div>
  )
}
