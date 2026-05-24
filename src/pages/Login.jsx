import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"
import { useAuth } from "../context/AuthContext"

function Login() {
  const { startGuestSession } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)

  function handleGuestAccess(){
    startGuestSession()
    navigate("/dashboard")
  }

  async function handleLogin(event) {
    event.preventDefault()
    setErrorMessage("")
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    navigate("/dashboard")
  }

  return (
    <main className="auth-page">
      <h1 className="auth-title">Easy Task Helper</h1>
      <section className="auth-card">
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form className="auth-form" onSubmit={handleLogin}>
          <label>
            email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            password
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>

        <button className="secondary-button" type = "button" onClick={handleGuestAccess}>
          <Link to="/dashboard">Continue as Guest</Link>
        </button>
      </section>
    </main>
  )
}

export default Login