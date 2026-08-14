import RequireAuth from '@/components/RequireAuth';
import TrendingList from '@/components/TrendingList';

export default function Trending() {
  return (
    <RequireAuth>
      <div className='flex flex-col gap-2'>
        <h1 className='text-[#f1eefa]'>Trending</h1>
        <TrendingList />
        {/* <section className='flex flex-col gap-4'>
          <h3 className='text-[#f1eefa]'>Top 50 Public Bells</h3>
        </section> */}
      </div>
    </RequireAuth>
  )
}
