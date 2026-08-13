import { supabase } from "@/utils/supabase";
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({ email: "", password: "", retype: "" })
  const [err, setErr] = useState("")
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  const handleRegister = async () => {
    setErr("");

    for (const [name, value] of Object.entries(formData)) {
      if (value === "") {
        setErr(`${name} can not be empty!`);
        return
      }
    }
    if (formData.password !== formData.retype) {
      setErr("passwords do not match!")
      return
    }

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: 'https://rolebell.yhchen.com/login',
      },
    })

    if (error == null) {
      navigate('/verify');
    }
    else {
      setErr(error.message);
    }
  }



  return (
    <div className="flex-1 flex justify-center items-center px-4">
      <div className="p-8 sm:p-10 w-full max-w-sm rounded-xl border border-line bg-surface flex flex-col items-stretch gap-3">
        <h3 className="mb-3 text-center text-[#f1eefa]">Register</h3>
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
          <p className="text-sm text-[#9a8fb8]">Create Password:</p>
          <input
            type="password"
            name="password"
            placeholder="enter password"
            onChange={handleChange}
          />
        </div>
        <div>
          <p className="text-sm text-[#9a8fb8]">Re-enter Password:</p>
          <input
            type="password"
            name="retype"
            placeholder="re-enter password"
            onChange={handleChange}
          />
        </div>
        <Link className="text-center text-sm" to="/login">Already have an account? Log In</Link>
        <button onClick={handleRegister}>Register</button>
        <p className="text-red-400 text-center text-sm">{err}</p>
      </div>
    </div>
  )
}
