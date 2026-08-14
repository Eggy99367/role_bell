import RequireAuth from '@/components/RequireAuth';
import TrendingList from '@/components/TrendingList';

export default function Trending() {
  return (
    <RequireAuth>
      <div className='flex flex-col gap-10'>
        <h1 className='text-[#f1eefa]'>Trending</h1>
        <section className='flex flex-col gap-4'>
          <h3 className='text-[#f1eefa]'>Top 50 Public Bells</h3>
          <TrendingList />
        </section>
      </div>
    </RequireAuth>
  )
}
