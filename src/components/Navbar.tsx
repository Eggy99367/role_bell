export default function Navbar() {
  return (
    <nav className="mx-4 px-4 py-2 border-b flex justify-between items-center">
      <h4>RoleBell</h4>
      <a className="self-stretch -my-2 px-4 flex items-center bg-[#6b52a6] text-white hover:bg-[#5b2bca] cursor-pointer"
        href="/login"
      >
        Login / Register
      </a>
    </nav>
  )
}