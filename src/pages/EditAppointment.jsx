import { Link, useNavigate, useParams } from "react-router-dom"
import AppointmentForm from "../components/AppointmentForm"
import { sampleAppointments } from "../data/sampleAppointments"

function EditAppointment() {
  const { id } = useParams()
  const navigate = useNavigate()

  const appointment = sampleAppointments.find(
    (item) => item.id === Number(id)
  )

  function handleUpdateAppointment(formData) {
    console.log("Updated appointment:", {
      id,
      ...formData,
    })

    alert("Appointment updated successfully!")
    navigate("/dashboard")
  }

  if (!appointment) {
    return (
      <main className="form-page">
        <section className="form-card">
          <Link className="back-link" to="/dashboard">
            ← Back to Dashboard
          </Link>

          <h1>Appointment Not Found</h1>
          <p>This appointment does not exist.</p>
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

        <AppointmentForm
          initialValues={appointment}
          buttonText="Update Appointment"
          onSubmit={handleUpdateAppointment}
        />
      </section>
    </main>
  )
}

export default EditAppointment