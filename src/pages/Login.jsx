import { Link } from "react-router-dom"

function Login() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Welcome Back</p>
        <h1>Log In</h1>
        <p className="auth-text">
          Log in to view and manage your appointments.
        </p>

        <form className="auth-form">
          <label>
            Email
            <input type="email" placeholder="you@example.com" />
          </label>

          <label>
            Password
            <input type="password" placeholder="Enter your password" />
          </label>

          <button className="primary-button" type="submit">
            Log In
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </section>
    </main>
  )
}

export default Login