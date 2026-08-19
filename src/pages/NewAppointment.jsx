import { ArrowLeft, CalendarPlus, CircleAlert } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AppointmentForm from "../components/AppointmentForm"
import AppShell from "../components/AppShell"
import { useAuth } from "../context/authContext"
import { createAppointment } from "../services/appointmentService"
import { createGuestAppointment } from "../services/guestAppointmentService"

function NewAppointment() {
  const navigate = useNavigate()
  const { user, isGuest } = useAuth()
  const [errorMessage, setErrorMessage] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleCreateAppointment(formData) {
    setErrorMessage("")
    setSaving(true)

    try {
      if (isGuest) createGuestAppointment(formData)
      else await createAppointment(formData, user.id)
      navigate("/dashboard")
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <div className="form-workspace">
        <Link className="back-link" to="/dashboard"><ArrowLeft size={17} />Back to dashboard</Link>
        <section className="form-card">
          <div className="form-card-heading">
            <span className="form-icon"><CalendarPlus size={25} /></span>
            <div><p className="eyebrow eyebrow-dark">Add to schedule</p><h1>New appointment</h1><p>Capture the key details now so nothing slips later.</p></div>
          </div>

          {errorMessage && <p className="message message-error"><CircleAlert size={18} />{errorMessage}</p>}

          <AppointmentForm
            buttonText={saving ? "Saving…" : "Save appointment"}
            onSubmit={handleCreateAppointment}
            submitting={saving}
          />
        </section>
      </div>
    </AppShell>
  )
}

export default NewAppointment
