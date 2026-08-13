import { Link } from "react-router-dom";

export default function Verify() {
  return (
    <div className="flex-1 flex justify-center items-center px-4">
      <div className="p-8 sm:p-10 w-full max-w-sm rounded-xl border border-line bg-surface flex flex-col items-stretch gap-3">
        <p className="text-center text-[#9a8fb8]">A verification link has sent to your email address. Please click the link to verify.</p>
        <Link className="text-center text-sm" to="/login">Ready to log in</Link>
      </div>
    </div>
  )
}
