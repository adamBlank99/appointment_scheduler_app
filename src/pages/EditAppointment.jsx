import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import AppointmentForm from "../components/AppointmentForm"
import {
  getAppointmentById,
  updateAppointment,
} from "../services/appointmentService"
import { useAuth } from "../context/AuthContext"

function EditAppointment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isGuest } = useAuth()

  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadAppointment() {
      try {
        if (isGuest) {
          const guestAppointments =
            JSON.parse(sessionStorage.getItem("guestAppointments")) || []

          const guestAppointment = guestAppointments.find(
            (appointment) => appointment.id === id
          )

          setAppointment(guestAppointment || null)
          return
        }

        if (!user) {
          return
        }

        const savedAppointment = await getAppointmentById(id, user.id)
        setAppointment(savedAppointment)
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadAppointment()
  }, [id, user, isGuest])

  async function handleUpdateAppointment(formData) {
    setErrorMessage("")
    setSaving(true)

    try {
      if (isGuest) {
        const guestAppointments =
          JSON.parse(sessionStorage.getItem("guestAppointments")) || []

        const updatedGuestAppointments = guestAppointments.map((appointment) => {
          if (appointment.id === id) {
            return {
              id: id,
              ...formData,
            }
          }

          return appointment
        })

        sessionStorage.setItem(
          "guestAppointments",
          JSON.stringify(updatedGuestAppointments)
        )

        navigate("/dashboard")
        return
      }

      await updateAppointment(id, formData, user.id)
      navigate("/dashboard")
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="form-page">
        <section className="form-card">
          <p>Loading appointment...</p>
        </section>
      </main>
    )
  }

  if (!appointment) {
    return (
      <main className="form-page">
        <section className="form-card">
          <Link className="back-link" to="/dashboard">
            ← Back to Dashboard
          </Link>

          <h1>Appointment Not Found</h1>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </section>
      </main>
    )
  }

  return (
    <main className="form-page">
      <section className="form-card">
        <Link className="back-link" to="/dashboard">
          ← Back to Dashboard
        </Link>

        <p className="eyebrow">Edit Appointment</p>
        <h1>Edit Appointment</h1>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <AppointmentForm
          initialValues={appointment}
          buttonText={saving ? "Updating..." : "Update Appointment"}
          onSubmit={handleUpdateAppointment}
        />
      </section>
    </main>
  )
}

export default EditAppointment