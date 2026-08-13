import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/utils/AuthContext";
import { supabase } from "@/utils/supabase";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {open ? (
        <path d="M6 6 18 18 M6 18 18 6" />
      ) : (
        <path d="M4 7h16 M4 12h16 M4 17h16" />
      )}
    </svg>
  );
}

export default function Navbar() {
  const { session, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <Link to="/trending" onClick={() => setOpen(false)}>Trending</Link>
      <Link to="/my_bells" onClick={() => setOpen(false)}>My Bells</Link>
      <Link to="/create_bell" onClick={() => setOpen(false)}>Create Bell</Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-20 border-b border-line bg-void/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-10 py-3 flex justify-between items-center">
        <Link to="/" className="no-underline">
          <h4 className="m-0 text-[#f1eefa]">RoleBell</h4>
        </Link>

        {loading ? null : session ? (
          <>
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-6 text-sm text-[#c9c2e0]">{links}</div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#9a8fb8]">{session.user.email}</span>
                <button
                  className="border border-line bg-transparent text-[#f1eefa] hover:bg-surface2"
                  onClick={() => supabase.auth.signOut()}
                >
                  Log Out
                </button>
              </div>
            </div>
            <button
              className="md:hidden bg-transparent border-none p-1 text-[#f1eefa]"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <MenuIcon open={open} />
            </button>
          </>
        ) : (
          <Link to="/login" className="no-underline">
            <button className="px-4">Login / Register</button>
          </Link>
        )}
      </div>

      {loading || !session || !open ? null : (
        <div className="md:hidden border-t border-line px-4 py-4 flex flex-col gap-4 text-sm text-[#c9c2e0]">
          <div className="flex flex-col gap-3">{links}</div>
          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="text-[#9a8fb8] truncate">{session.user.email}</span>
            <button
              className="border border-line bg-transparent text-[#f1eefa] hover:bg-surface2 shrink-0"
              onClick={() => supabase.auth.signOut()}
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
