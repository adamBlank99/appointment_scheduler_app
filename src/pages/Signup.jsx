import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

function Signup() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSignup(event) {
    event.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")
    setLoading(true)
  
    const signupResponse = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
        },
      },
    })
  
    const signupError = signupResponse.error
  
    setLoading(false)
  
    if (signupError) {
      setErrorMessage(signupError.message)
      return
    }
  
    setSuccessMessage("Account created successfully. You can now log in.")
  
    setTimeout(() => {
      navigate("/login")
    }, 1200)
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Create Account</p>
        <h1>Sign Up</h1>
        <p className="auth-text">
          Create an account to start managing appointments.
        </p>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form className="auth-form" onSubmit={handleSignup}>
          <label>
            Name
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength="6"
            />
          </label>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  )
}

export default Signup