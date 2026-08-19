import { CalendarDays, CheckCircle2, LayoutDashboard, LogOut, Plus, RotateCcw, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/authContext"
import { supabase } from "../services/supabaseClient"

const navigation = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/completed", label: "Completed", icon: CheckCircle2 },
  { to: "/new", label: "New appointment", icon: Plus },
]

function AppShell({ children, onResetDemo }) {
  const navigate = useNavigate()
  const { user, isGuest, endGuestSession } = useAuth()
  const [accountError, setAccountError] = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)

  async function handleLogout() {
    if (isGuest) {
      endGuestSession()
      navigate("/login")
      return
    }
    await supabase.auth.signOut()
    navigate("/login")
  }

  async function handleDeleteAccount() {
    const confirmation = window.prompt(
      "This permanently deletes your account and appointments. Type DELETE to continue.",
    )

    if (confirmation !== "DELETE") return

    setAccountError("")
    setDeletingAccount(true)

    try {
      const { error } = await supabase.functions.invoke("delete-account", {
        method: "POST",
      })
      if (error) throw error
      await supabase.auth.signOut({ scope: "local" })
      endGuestSession()
      navigate("/login", { replace: true })
    } catch {
      setAccountError("Account deletion could not be completed. Please try again later.")
    } finally {
      setDeletingAccount(false)
    }
  }

  const displayName = isGuest
    ? "Guest recruiter demo"
    : user?.email || "Signed-in user"

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand" to="/dashboard" aria-label="Appointment Scheduler home">
          <span className="brand-mark"><CalendarDays size={24} /></span>
          <span><strong>Appointment</strong><small>Scheduler</small></span>
        </NavLink>

        <nav aria-label="Primary navigation">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-summary">
            <span className="profile-avatar" aria-hidden="true">
              {isGuest ? "G" : displayName.charAt(0).toUpperCase()}
            </span>
            <span>
              <strong>{displayName}</strong>
              {!isGuest && <small>Private workspace</small>}
            </span>
          </div>

          {isGuest && onResetDemo && (
            <button className="sidebar-action" type="button" onClick={onResetDemo}>
              <RotateCcw size={17} aria-hidden="true" />Reset demo data
            </button>
          )}

          {!isGuest && (
            <button className="sidebar-action sidebar-action-danger" type="button" onClick={handleDeleteAccount} disabled={deletingAccount}>
              <Trash2 size={17} aria-hidden="true" />{deletingAccount ? "Deleting…" : "Delete account"}
            </button>
          )}

          <button className="sidebar-action" type="button" onClick={handleLogout}>
            <LogOut size={17} aria-hidden="true" />{isGuest ? "Exit demo" : "Log out"}
          </button>
          <Link className="sidebar-privacy-link" to="/privacy">Privacy</Link>
          {accountError && <p className="sidebar-error" role="alert">{accountError}</p>}
        </div>
      </aside>

      <section className="app-content">{children}</section>
    </main>
  )
}

export default AppShell
