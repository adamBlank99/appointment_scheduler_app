import { Navigate } from "react-router-dom"
import { useAuth } from "../context/authContext"

function ProtectedRoute({ children }) {
  const { user, isGuest, loadingAuth } = useAuth()

  if (loadingAuth) {
    return <main className="route-loading"><span className="loading-spinner" />Loading your workspace…</main>
  }

  if (!user && !isGuest) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
