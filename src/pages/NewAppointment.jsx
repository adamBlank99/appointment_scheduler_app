import { Link, useNavigate } from "react-router-dom"
import AppointmentForm from "../components/AppointmentForm"

function NewAppointment() {
  const navigate = useNavigate()

  function handleCreateAppointment(formData) {
    console.log("New appointment:", formData)
    alert("Appointment created successfully!")
    navigate("/dashboard")
  }

  return (
    <main className="form-page">
      <section className="form-card">
        <Link className="back-link" to="/dashboard">
          ← Back to Dashboard
        </Link>

        <p className="eyebrow">New Appointment</p>
        <h1>Create Appointment</h1>

        <AppointmentForm
          buttonText="Save Appointment"
          onSubmit={handleCreateAppointment}
        />
      </section>
    </main>
  )
}

export default NewAppointment