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
    <div className="flex-1 flex justify-center items-center">
      <div className="p-10 w-fit border flex flex-col items-cente gap-3">
        <h3 className="mb-3">Login</h3>
        <div>
          <p>Email:</p>
          <input
            type="email" 
            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" 
            name="email"
            placeholder="enter email"
            onChange={handleChange}
          />
        </div>
        <div>
          <p>Password:</p>
          <input
            type="password"
            name="password"
            placeholder="enter password"
            onChange={handleChange}
          />
        </div>
        <Link className="text-center" to="/register">Create an account</Link>
        <button onClick={handleLogin}>Log In</button>
        <p className="text-red-600 text-center">{err}</p>
      </div>
    </div>
  )
}
