import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AppointmentForm from "../components/AppointmentForm"
import { createAppointment } from "../services/appointmentService"
import { useAuth } from "../context/AuthContext"

function NewAppointment() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCreateAppointment(formData) {
    setErrorMessage("")
    setLoading(true)

    try {
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

        <p className="eyebrow">New Appointment</p>
        <h1>Create Appointment</h1>

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