import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"
import { getAppointments, deleteAppointment } from "../services/appointmentService"
import { useAuth } from "../context/AuthContext"

function CompletedTasks() {
  const navigate = useNavigate()
  const { user, isGuest, endGuestSession } = useAuth()

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [sortOrder, setSortOrder] = useState("soonest")

  useEffect(() => {
    async function loadAppointments() {
      try {
        if (isGuest) {
          const guestAppointments =
            JSON.parse(sessionStorage.getItem("guestAppointments")) || []

          setAppointments(guestAppointments)
          return
        }

        if (!user) {
          return
        }

        const savedAppointments = await getAppointments(user.id)
        setAppointments(savedAppointments)
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [user, isGuest])

  async function handleDeleteAppointment(appointmentId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this completed task?"
    )

    if (!confirmDelete) {
      return
    }

    try {
      if (isGuest) {
        const guestAppointments =
          JSON.parse(sessionStorage.getItem("guestAppointments")) || []

        const updatedGuestAppointments = guestAppointments.filter(
          (appointment) => appointment.id !== appointmentId
        )

        sessionStorage.setItem(
          "guestAppointments",
          JSON.stringify(updatedGuestAppointments)
        )

        setAppointments(updatedGuestAppointments)
        return
      }

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
    if (isGuest) {
      sessionStorage.removeItem("guestAppointments")
      endGuestSession()
      navigate("/login")
      return
    }

    await supabase.auth.signOut()
    navigate("/login")
  }

  const completedAppointments = appointments.filter(
    (appointment) => appointment.isCompleted
  )

  const completedHighCount = completedAppointments.filter(
    (appointment) => appointment.priority === "High"
  ).length

  const completedMediumCount = completedAppointments.filter(
    (appointment) => appointment.priority === "Medium"
  ).length

  const completedLowCount = completedAppointments.filter(
    (appointment) => appointment.priority === "Low"
  ).length

  const visibleCompletedAppointments = completedAppointments
    .filter((appointment) => {
      const searchText = searchTerm.toLowerCase()

      const matchesSearch =
        appointment.clientName.toLowerCase().includes(searchText) ||
        (appointment.notes || "").toLowerCase().includes(searchText)

      const matchesPriority =
        priorityFilter === "All" || appointment.priority === priorityFilter

      return matchesSearch && matchesPriority
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
        <h2>Task Manager</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/completed">Completed Tasks</Link>
          <Link to="/new">New Task</Link>

          <button className="sidebar-logout" onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
        <div className="dashboard-title-group">
          <p className="eyebrow">Task Management</p>
          <h1 className="page-title-bubble">Completed Tasks</h1>
          <p className="dashboard-subtitle">
            View and manage completed tasks.
          </p>
        </div>

        <section className="sidebar-completed">
        <h3 className="sidebar-completed-title">Completed Tasks</h3>

        <div className="completed-count-box">
          <span className="completed-count-circle">
            {completedAppointments.length}
          </span>
        </div>
      </section>
        </header>


        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <section className="stats-grid">
          <div className="stat-card">
            <p>Completed Tasks</p>
            <h2>{completedAppointments.length}</h2>
          </div>

          <div className="stat-card">
            <p>High</p>
            <h2>{completedHighCount}</h2>
          </div>

          <div className="stat-card">
            <p>Medium</p>
            <h2>{completedMediumCount}</h2>
          </div>

          <div className="stat-card">
            <p>Low</p>
            <h2>{completedLowCount}</h2>
          </div>
        </section>

        <section className="appointments-section">
          <div className="section-header">
            <h2>Completed Tasks</h2>

            <div className="dashboard-controls">
              <input
                type="text"
                placeholder="Search by name or notes"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
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
          <p className="completed-empty-message">Loading completed tasks...</p>
        ) : completedAppointments.length === 0 ? (
          <p className="completed-empty-message">No completed tasks yet.</p>
        ) : visibleCompletedAppointments.length === 0 ? (
          <p className="completed-empty-message completed-empty-message-filter">
            No completed tasks match your search or filter.
          </p>
        ) : (
          <div className="appointments-grid">
            {visibleCompletedAppointments.map((appointment) => {
              const priority = appointment.priority || "Medium"

                return (
                  <article className="appointment-card" key={appointment.id}>
                    <div className="appointment-card-header">
                      <div>
                        <h3>{appointment.clientName}</h3>
                      </div>

                      <span
                        className={`priority-badge ${priority.toLowerCase()}`}
                      >
                        {priority}
                      </span>
                    </div>

                    <div className="appointment-details">
                      <p>
                        <strong>Date:</strong> {appointment.date}
                      </p>
                      <p>
                        <strong>Time:</strong> {appointment.time}
                      </p>
                      <p>
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    </div>

                    <div className="appointment-actions">
                      <button
                        className="danger-button"
                        type="button"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default CompletedTasks