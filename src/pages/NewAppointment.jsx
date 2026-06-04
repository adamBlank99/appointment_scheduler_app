import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AppointmentForm from "../components/AppointmentForm"
import { createAppointment } from "../services/appointmentService"
import { useAuth } from "../context/AuthContext"
import { Pencil } from "lucide-react"

function NewAppointment() {
  const navigate = useNavigate()
  const { user, isGuest} = useAuth()

  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCreateAppointment(formData) {
    setErrorMessage("")
    setLoading(true)

    try {
      if (isGuest) {
        const currentGuestAppointments =
          JSON.parse(sessionStorage.getItem("guestAppointments")) || []

        const newGuestAppointment = {
          id: crypto.randomUUID(),
          ...formData,
        }

        const updatedGuestAppointments = [
          ...currentGuestAppointments,
          newGuestAppointment,
        ]

        sessionStorage.setItem(
          "guestAppointments",
          JSON.stringify(updatedGuestAppointments)
        )

        navigate("/dashboard")
        return
      }
      await createAppointment(formData, user.id)
      navigate("/dashboard")
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }


  return (
    <main className="form-page">
      <section className="form-card">
        <Link className="back-link" to="/dashboard">
          ← Back to Dashboard
        </Link>

        <h1 className="form-page-h1">What's on the agenda
        <Pencil className="form-title-icon" size={33} strokeWidth={3} />
        ?
        </h1>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <AppointmentForm
          buttonText={loading ? "Saving..." : "Save Appointment"}
          onSubmit={handleCreateAppointment}
        />
      </section>
    </main>
  )
}

export default NewAppointment