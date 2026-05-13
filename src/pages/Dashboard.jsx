import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"
import { getAppointments } from "../services/appointmentService"
import { useAuth } from "../context/AuthContext"
import AppointmentCard from "../components/AppointmentCard"

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadAppointments() {
      try {
        const savedAppointments = await getAppointments(user.id)
        setAppointments(savedAppointments)
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [user.id])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate("/login")
  }

  const scheduledCount = appointments.filter(
    (appointment) => appointment.status === "Scheduled"
  ).length

  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "Pending"
  ).length

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "Completed"
  ).length

  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <h2>Scheduler</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/new">New Appointment</Link>

          <button className="sidebar-logout" onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Appointment Management</p>
            <h1>Dashboard</h1>
            <p className="dashboard-subtitle">
              View and manage upcoming client appointments.
            </p>
          </div>

          <Link className="primary-button" to="/new">
            + New Appointment
          </Link>
        </header>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <section className="stats-grid">
          <div className="stat-card">
            <p>Total Appointments</p>
            <h2>{appointments.length}</h2>
          </div>

          <div className="stat-card">
            <p>Scheduled</p>
            <h2>{scheduledCount}</h2>
          </div>

          <div className="stat-card">
            <p>Pending</p>
            <h2>{pendingCount}</h2>
          </div>

          <div className="stat-card">
            <p>Completed</p>
            <h2>{completedCount}</h2>
          </div>
        </section>

        <section className="appointments-section">
          <div className="section-header">
            <h2>Appointments</h2>
            <input type="text" placeholder="Search appointments..." />
          </div>

          {loading ? (
            <p>Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <p>No appointments yet. Create your first appointment to get started.</p>
          ) : (
            <div className="appointments-grid">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default Dashboard