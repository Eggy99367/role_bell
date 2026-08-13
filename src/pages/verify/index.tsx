import { Link } from "react-router-dom";

export default function Verify() {
  return (
    <div className="flex-1 flex justify-center items-center">
      <div className="p-10 w-fit border flex flex-col items-cente gap-3">
        <p>A verification link has sent to your email address. Please click the link to verify.</p>
        <Link className="text-center" to="/login">Ready to log in</Link>
      </div>
    </div>
  )
}
