import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      <div className='mx-20 py-20 flex-1 flex flex-col'>
        <Outlet />
      </div>
    </div>
  )
}
