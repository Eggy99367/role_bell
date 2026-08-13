import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      <div className='mx-20 py-20 flex-1 flex flex-col'>
        <Outlet />
      </div>
      <footer className='text-center text-xs text-gray-400 py-4'>
        Made by <a href='https://github.com/Eggy99367' target='_blank' rel='noopener noreferrer' className='hover:underline'>Vincent Chen</a>
      </footer>
    </div>
  )
}
