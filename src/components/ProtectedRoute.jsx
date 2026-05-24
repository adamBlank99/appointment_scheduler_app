import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function ProtectedRoute({ children }) {
  const { user, isGuest, loadingAuth } = useAuth()

  if (loadingAuth) {
    return <p className="loading-message">Loading...</p>
  }

  if (!user && !isGuest) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute