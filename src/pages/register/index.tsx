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
    <div className="flex-1 flex justify-center items-center">
      <div className="p-10 w-fit border flex flex-col items-cente gap-3">
        <h3 className="mb-3">Register</h3>
        <div>
          <p>Email:</p>
          <input
            type="email" 
            name="email"
            placeholder="enter email"
            onChange={handleChange}
          />
        </div>
        <div>
          <p>Create Password:</p>
          <input
            type="password"
            name="password"
            placeholder="enter password"
            onChange={handleChange}
          />
        </div>
        <div>
          <p>Re-enter Password:</p>
          <input
            type="password"
            name="retype"
            placeholder="re-enter password"
            onChange={handleChange}
          />
        </div>
        <Link className="text-center" to="/login">Already have an account? Log In</Link>
        <button onClick={handleRegister}>Register</button>
        <p className="text-red-600 text-center">{err}</p>
      </div>
    </div>
  )
}
