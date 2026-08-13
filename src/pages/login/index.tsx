import { supabase } from "@/utils/supabase";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: ""})
  const [err, setErr] = useState("")
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  const handleLogin = async () => {
    setErr("");

    for (const [name, value] of Object.entries(formData)) {
      if (value === "") {
        setErr(`${name} can not be empty!`);
        return
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error == null) {
      navigate('/trending');
    }
    else {
      setErr(error.message);
    }
  }

  return (
    <div className="flex-1 flex justify-center items-center px-4">
      <div className="p-8 sm:p-10 w-full max-w-sm rounded-xl border border-line bg-surface flex flex-col items-stretch gap-3">
        <h3 className="mb-3 text-center text-[#f1eefa]">Login</h3>
        <div>
          <p className="text-sm text-[#9a8fb8]">Email:</p>
          <input
            type="email"
            name="email"
            placeholder="enter email"
            onChange={handleChange}
          />
        </div>
        <div>
          <p className="text-sm text-[#9a8fb8]">Password:</p>
          <input
            type="password"
            name="password"
            placeholder="enter password"
            onChange={handleChange}
          />
        </div>
        <Link className="text-center text-sm" to="/register">Create an account</Link>
        <button onClick={handleLogin}>Log In</button>
        <p className="text-red-400 text-center text-sm">{err}</p>
      </div>
    </div>
  )
}
