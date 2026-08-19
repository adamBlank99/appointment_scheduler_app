import { ArrowLeft, CalendarCheck2, MailCheck } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { isSupabaseConfigured, supabase } from "../services/supabaseClient"

function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignup(event) {
    event.preventDefault()
    setErrorMessage("")
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
        },
      })

      if (error) throw error

      if (data.session) navigate("/dashboard")
      else setConfirmationSent(true)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="signup-page">
      <Link className="auth-brand signup-brand" to="/login"><CalendarCheck2 size={27} /><span>Appointment Scheduler</span></Link>
      <section className="auth-card signup-card">
        <Link className="back-link" to="/login"><ArrowLeft size={17} />Back to sign in</Link>

        {confirmationSent ? (
          <div className="confirmation-state">
            <span className="confirmation-icon"><MailCheck size={31} /></span>
            <p className="eyebrow eyebrow-dark">One more step</p>
            <h1>Check your inbox</h1>
            <p>We sent a confirmation link to <strong>{email}</strong>. Open it to verify your account, then sign in.</p>
            <Link className="button button-primary" to="/login">Return to sign in</Link>
          </div>
        ) : (
          <>
            <p className="eyebrow eyebrow-dark">Create account</p>
            <h1>Build your private workspace</h1>
            <p className="auth-text">Your appointments are tied to your authenticated account.</p>
            {errorMessage && <p className="message message-error">{errorMessage}</p>}
            {!isSupabaseConfigured && <p className="message message-warning">Signup needs Supabase environment variables. Return to sign in to try Guest Demo.</p>}

            <form className="auth-form" onSubmit={handleSignup}>
              <label><span>Full name</span><input type="text" autoComplete="name" placeholder="Alex Morgan" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required /></label>
              <label><span>Email address</span><input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
              <label><span>Password</span><input type="password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /><small>Use 8 or more characters.</small></label>
              <button className="button button-primary auth-submit" type="submit" disabled={loading || !isSupabaseConfigured}>{loading ? "Creating account…" : "Create account"}</button>
            </form>

            <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
          </>
        )}
      </section>
    </main>
  )
}

export default Signup
