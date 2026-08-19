import { ArrowRight, CalendarCheck2, ShieldCheck, Sparkles } from "lucide-react"
import { useState } from "react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import TurnstileWidget from "../components/TurnstileWidget"
import { useAuth } from "../context/authContext"
import { getAuthErrorMessage } from "../services/authErrorMessage"
import {
  isSupabaseConfigured,
  isTurnstileConfigured,
  supabase,
  turnstileSiteKey,
} from "../services/supabaseClient"

function Login() {
  const { user, startGuestSession, endGuestSession } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState("")
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0)

  const accountLoginReady = isSupabaseConfigured && isTurnstileConfigured

  if (user) return <Navigate to="/dashboard" replace />

  function handleGuestAccess() {
    startGuestSession()
    navigate("/dashboard")
  }

  async function handleLogin(event) {
    event.preventDefault()
    setErrorMessage("")
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken },
      })
      if (error) throw error
      endGuestSession()
      navigate("/dashboard")
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setCaptchaToken("")
      setCaptchaResetSignal((current) => current + 1)
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <Link className="auth-brand" to="/login"><CalendarCheck2 size={28} /><span>Appointment Scheduler</span></Link>
        <div className="auth-copy">
          <p className="eyebrow"><Sparkles size={15} />Simple appointment management</p>
          <h1>Your schedule,<br />organized.</h1>
          <p>Create, prioritize, and track appointments.</p>
        </div>
        <p className="auth-security"><ShieldCheck size={17} />Guest activity is stored only in this browser tab.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow eyebrow-dark">Welcome</p>
          <h2>Sign in to your schedule</h2>
          <p className="auth-text">Use your account, or open the live demo with no signup required.</p>

          {searchParams.get("confirmed") === "true" && <p className="message message-success">Email confirmed. You can sign in now.</p>}
          {errorMessage && <p className="message message-error">{errorMessage}</p>}
          {!isSupabaseConfigured && <p className="message message-warning">Account login needs Supabase environment variables. Guest Demo is fully available.</p>}
          {isSupabaseConfigured && !isTurnstileConfigured && <p className="message message-warning">Account login is disabled until bot protection is configured. Guest Demo is fully available.</p>}

          <button className="button demo-button" type="button" onClick={handleGuestAccess}>
            <span><Sparkles size={19} /><strong>Try Live Demo</strong><small>No account needed</small></span>
            <ArrowRight size={20} />
          </button>

          <div className="auth-divider"><span>or sign in</span></div>

          <form className="auth-form" onSubmit={handleLogin}>
            <label><span>Email address</span><input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label><span>Password</span><input type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {isTurnstileConfigured && (
              <TurnstileWidget
                siteKey={turnstileSiteKey}
                action="login"
                onVerify={setCaptchaToken}
                onExpire={() => setCaptchaToken("")}
                resetSignal={captchaResetSignal}
              />
            )}
            <button className="button button-primary auth-submit" type="submit" disabled={loading || !accountLoginReady || !captchaToken}>{loading ? "Signing in…" : "Sign in"}</button>
          </form>

          <p className="auth-footer">New to Appointment Scheduler? <Link to="/signup">Create an account</Link></p>
          <p className="auth-legal"><Link to="/privacy">Privacy &amp; acceptable use</Link></p>
        </div>
      </section>
    </main>
  )
}

export default Login
