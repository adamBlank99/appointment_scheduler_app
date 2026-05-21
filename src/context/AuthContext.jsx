import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../services/supabaseClient"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    async function getUserSession() {
      const guestMode = sessionStorage.getItem("guestMode") === "true"

      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)      
      setIsGuest(guestMode)
      setLoadingAuth(false)
    }

    getUserSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoadingAuth(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  function startGuestSession() {
    sessionStorage.setItem("guestMode", "true")
    setIsGuest(true)
    setUser(null)
  }

  function endGuestSession() {
    sessionStorage.removeItem("guestMode")
    setIsGuest(false)
  }

  return (
    <AuthContext.Provider
    value={{
      user,
      isGuest,
      loadingAuth,
      startGuestSession,
      endGuestSession,
    }}
  >
    {children}
  </AuthContext.Provider>
)
}

export function useAuth() {
  return useContext(AuthContext)
}