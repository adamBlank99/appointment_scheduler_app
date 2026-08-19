import { ArrowLeft, CalendarCheck2, MailCheck } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import TurnstileWidget from "../components/TurnstileWidget"
import { getAuthErrorMessage } from "../services/authErrorMessage"
import {
  isSupabaseConfigured,
  isTurnstileConfigured,
  supabase,
  turnstileSiteKey,
} from "../services/supabaseClient"

function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptedPolicies, setAcceptedPolicies] = useState(false)
  const [captchaToken, setCaptchaToken] = useState("")
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const signupReady = isSupabaseConfigured && isTurnstileConfigured

  async function handleSignup(event) {
    event.preventDefault()
    setErrorMessage("")
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
          captchaToken,
        },
      })

      if (error) throw error

      if (data.session) navigate("/dashboard")
      else setConfirmationSent(true)
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setCaptchaToken("")
      setCaptchaResetSignal((current) => current + 1)
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
            {isSupabaseConfigured && !isTurnstileConfigured && <p className="message message-warning">Signup is disabled until bot protection is configured. Return to sign in to try Guest Demo.</p>}

            <form className="auth-form" onSubmit={handleSignup}>
              <label><span>Email address</span><input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
              <label><span>Password</span><input type="password" autoComplete="new-password" placeholder="At least 12 characters" value={password} onChange={(event) => setPassword(event.target.value)} minLength={12} maxLength={72} required /><small>Use at least 12 characters and a unique password.</small></label>
              <label className="policy-consent">
                <input type="checkbox" checked={acceptedPolicies} onChange={(event) => setAcceptedPolicies(event.target.checked)} required />
                <span>I agree to the <Link to="/privacy">privacy and acceptable-use notice</Link>.</span>
              </label>
              {isTurnstileConfigured && (
                <TurnstileWidget
                  siteKey={turnstileSiteKey}
                  action="signup"
                  onVerify={setCaptchaToken}
                  onExpire={() => setCaptchaToken("")}
                  resetSignal={captchaResetSignal}
                />
              )}
              <button className="button button-primary auth-submit" type="submit" disabled={loading || !signupReady || !acceptedPolicies || !captchaToken}>{loading ? "Creating account…" : "Create account"}</button>
            </form>

            <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
          </>
        )}
      </section>
    </main>
  )
}

export default Signup
