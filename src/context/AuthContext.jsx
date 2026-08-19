import { useEffect, useState } from "react"
import { ensureGuestAppointments } from "../services/guestAppointmentService"
import { isSupabaseConfigured, supabase } from "../services/supabaseClient"
import { AuthContext } from "./authContext"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isGuest, setIsGuest] = useState(
    () => sessionStorage.getItem("guestMode") === "true",
  )
  const [loadingAuth, setLoadingAuth] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined
    }

    async function getUserSession() {
      const guestMode = sessionStorage.getItem("guestMode") === "true"

      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)
      setIsGuest(session ? false : guestMode)
      setLoadingAuth(false)
    }

    getUserSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session) {
        sessionStorage.removeItem("guestMode")
        setIsGuest(false)
      }
      setLoadingAuth(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  function startGuestSession() {
    ensureGuestAppointments()
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
