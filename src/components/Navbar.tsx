import { Link } from "react-router-dom";
import { useAuth } from "@/utils/AuthContext";
import { supabase } from "@/utils/supabase";

export default function Navbar() {
  const { session, loading } = useAuth();

  return (
    <nav className="mx-4 px-4 py-2 border-b flex justify-between items-center">
      <h4>RoleBell</h4>
      {loading ? null : session ? (
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-12">
            <Link to="/trending">Trending</Link>
            <Link to="/my_bells">My Bells</Link>
            <Link to="/create_bell">Create Bell</Link>
          </div>
          <div className="flex items-center gap-3">
            <span>{session.user.email}</span>
            <button
              className="self-stretch -my-2 px-4 bg-[#6b52a6] text-white hover:bg-[#5b2bca] cursor-pointer"
              onClick={() => supabase.auth.signOut()}
            >
              Log Out
            </button>
          </div>
        </div>
      ) : (
        <Link className="self-stretch -my-2 px-4 flex items-center bg-[#6b52a6] text-white hover:bg-[#5b2bca] cursor-pointer"
          to="/login"
        >
          Login / Register
        </Link>
      )}
    </nav>
  )
}