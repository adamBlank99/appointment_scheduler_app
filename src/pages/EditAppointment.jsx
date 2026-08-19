import { ArrowLeft, CircleAlert, Pencil } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import AppointmentForm from "../components/AppointmentForm"
import AppShell from "../components/AppShell"
import { useAuth } from "../context/authContext"
import { getAppointmentById, updateAppointment } from "../services/appointmentService"
import { getGuestAppointments, updateGuestAppointment } from "../services/guestAppointmentService"

function EditAppointment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isGuest } = useAuth()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isCurrent = true

    async function loadAppointment() {
      try {
        const saved = isGuest
          ? getGuestAppointments().find(({ id: appointmentId }) => appointmentId === id) || null
          : await getAppointmentById(id, user.id)
        if (isCurrent) setAppointment(saved)
      } catch (error) {
        if (isCurrent) setErrorMessage(error.message)
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadAppointment()
    return () => { isCurrent = false }
  }, [id, user, isGuest])

  async function handleUpdateAppointment(formData) {
    setErrorMessage("")
    setSaving(true)

    try {
      if (isGuest) updateGuestAppointment(id, formData)
      else await updateAppointment(id, formData, user.id)
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
          {loading ? (
            <div className="empty-state"><span className="loading-spinner" />Loading appointment…</div>
          ) : !appointment ? (
            <div className="empty-state"><CircleAlert size={32} /><h1>Appointment not found</h1><p>It may have been deleted or may not belong to your account.</p>{errorMessage && <p className="message message-error">{errorMessage}</p>}</div>
          ) : (
            <>
              <div className="form-card-heading">
                <span className="form-icon"><Pencil size={23} /></span>
                <div><p className="eyebrow eyebrow-dark">Update details</p><h1>Edit appointment</h1><p>Keep timing, priority, and context accurate.</p></div>
              </div>
              {errorMessage && <p className="message message-error"><CircleAlert size={18} />{errorMessage}</p>}
              <AppointmentForm initialValues={appointment} buttonText={saving ? "Updating…" : "Update appointment"} onSubmit={handleUpdateAppointment} submitting={saving} />
            </>
          )}
        </section>
      </div>
    </AppShell>
  )
}

export default EditAppointment
