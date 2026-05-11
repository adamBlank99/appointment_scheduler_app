import { Link } from "react-router-dom"

function Signup() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Create Account</p>
        <h1>Sign Up</h1>
        <p className="auth-text">
          Create an account to start managing appointments.
        </p>

        <form className="auth-form">
          <label>
            Name
            <input type="text" placeholder="Your name" />
          </label>

          <label>
            Email
            <input type="email" placeholder="you@example.com" />
          </label>

          <label>
            Password
            <input type="password" placeholder="Create a password" />
          </label>

          <button className="primary-button" type="submit">
            Sign Up
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