import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"
import { getAppointments, deleteAppointment } from "../services/appointmentService"
import { useAuth } from "../context/AuthContext"
import AppointmentCard from "../components/AppointmentCard"

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortOrder, setSortOrder] = useState("soonest")

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

  async function handleDeleteAppointment(appointmentId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?"
    )
  
    if (!confirmDelete) {
      return
    }
  
    try {
      await deleteAppointment(appointmentId, user.id)
  
      setAppointments((currentAppointments) =>
        currentAppointments.filter(
          (appointment) => appointment.id !== appointmentId
        )
      )
    } catch (error) {
      setErrorMessage(error.message)
    }
  }
  
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

  const filteredAppointments = appointments

  .filter((appointment) => {
    const searchText = searchTerm.toLowerCase()

    const matchesSearch =
      appointment.clientName.toLowerCase().includes(searchText)

    const matchesStatus =
      statusFilter === "All" || appointment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  .sort((firstAppointment, secondAppointment) => {
    const firstDate = new Date(
      `${firstAppointment.date}T${firstAppointment.time}`
    )

    const secondDate = new Date(
      `${secondAppointment.date}T${secondAppointment.time}`
    )

    if (sortOrder === "soonest") {
      return firstDate - secondDate
    }

    return secondDate - firstDate
  })
  
return (
  <main className="dashboard-page">
    <aside className="sidebar">
      <h2>Scheduler</h2>

      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/new">New Task</Link>

        <button className="sidebar-logout" onClick={handleLogout}>
          Log Out
        </button>
      </nav>
    </aside>

    <section className="dashboard-content">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Task Management</p>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            View and manage upcoming tasks.
          </p>
        </div>

        <Link className="primary-button" to="/new">
          + New Task
        </Link>
      </header>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <section className="stats-grid">
        <div className="stat-card">
          <p>Total Tasks</p>
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
        <h2>Tasks</h2>

        <div className="dashboard-controls">
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            <option value="soonest">Soonest First</option>
            <option value="latest">Latest First</option>
          </select>
        </div>
      </div>

        {loading ? (
          <p>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p>No tasks yet. Create your first task to get started.</p>
        ) : filteredAppointments.length === 0 ? (
          <p>No tasks match your search or filter.</p>
        ) : (
          <div className="appointments-grid">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onDelete={handleDeleteAppointment}
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