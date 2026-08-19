import { BriefcaseBusiness, CheckCircle2, CircleAlert, Plus, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import AppointmentCard from "../components/AppointmentCard"
import AppShell from "../components/AppShell"
import { useAuth } from "../context/authContext"
import {
  deleteAppointment,
  getAppointments,
  setAppointmentCompletion,
} from "../services/appointmentService"
import {
  deleteGuestAppointment,
  getGuestAppointments,
  initializeGuestAppointments,
  setGuestAppointmentCompletion,
} from "../services/guestAppointmentService"

function Dashboard() {
  const { user, isGuest } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [sortOrder, setSortOrder] = useState("soonest")

  useEffect(() => {
    let isCurrent = true

    async function loadAppointments() {
      setLoading(true)
      setErrorMessage("")

      try {
        const savedAppointments = isGuest
          ? getGuestAppointments()
          : await getAppointments(user.id)
        if (isCurrent) setAppointments(savedAppointments)
      } catch (error) {
        if (isCurrent) setErrorMessage(error.message)
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadAppointments()
    return () => { isCurrent = false }
  }, [user, isGuest])

  async function handleDeleteAppointment(appointmentId) {
    if (!window.confirm("Delete this appointment? This action cannot be undone.")) return

    try {
      if (isGuest) {
        setAppointments(deleteGuestAppointment(appointmentId))
      } else {
        await deleteAppointment(appointmentId, user.id)
        setAppointments((current) => current.filter(({ id }) => id !== appointmentId))
      }
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function handleCompleteAppointment(appointmentId) {
    try {
      if (isGuest) {
        setAppointments(setGuestAppointmentCompletion(appointmentId, true))
      } else {
        const completed = await setAppointmentCompletion(appointmentId, true, user.id)
        setAppointments((current) => current.map((item) => item.id === appointmentId ? completed : item))
      }
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  function handleResetDemo() {
    if (window.confirm("Reset the guest workspace to its original sample appointments?")) {
      setAppointments(initializeGuestAppointments())
      setSearchTerm("")
      setPriorityFilter("All")
      setSortOrder("soonest")
    }
  }

  const activeAppointments = appointments.filter(({ isCompleted }) => !isCompleted)
  const completedCount = appointments.filter(({ isCompleted }) => isCompleted).length

  const visibleAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return activeAppointments
      .filter((appointment) => {
        const matchesSearch =
          appointment.clientName.toLowerCase().includes(normalizedSearch) ||
          (appointment.notes || "").toLowerCase().includes(normalizedSearch)
        const matchesPriority = priorityFilter === "All" || appointment.priority === priorityFilter
        return matchesSearch && matchesPriority
      })
      .sort((first, second) => {
        const firstDate = new Date(`${first.date}T${first.time}`)
        const secondDate = new Date(`${second.date}T${second.time}`)
        return sortOrder === "soonest" ? firstDate - secondDate : secondDate - firstDate
      })
  }, [activeAppointments, priorityFilter, searchTerm, sortOrder])

  const highCount = activeAppointments.filter(({ priority }) => priority === "High").length
  const mediumCount = activeAppointments.filter(({ priority }) => priority === "Medium").length

  return (
    <AppShell onResetDemo={isGuest ? handleResetDemo : undefined}>
      <header className="page-header">
        <div>
          <p className="eyebrow">Appointment workspace</p>
          <h1>Stay ahead of every commitment.</h1>
          <p>Manage upcoming meetings and deadlines from one focused dashboard.</p>
        </div>
        <Link className="button button-primary" to="/new"><Plus size={18} />New appointment</Link>
      </header>

      {isGuest && (
        <section className="demo-banner" aria-label="Guest demo information">
          <BriefcaseBusiness size={21} />
          <div><strong>You’re exploring the live recruiter demo.</strong><span>Try every workflow—changes stay in this browser tab and never touch Supabase.</span></div>
        </section>
      )}

      {errorMessage && <p className="message message-error"><CircleAlert size={18} />{errorMessage}</p>}

      <section className="stats-grid" aria-label="Appointment summary">
        <article className="stat-card"><span>Upcoming</span><strong>{activeAppointments.length}</strong><small>Active appointments</small></article>
        <article className="stat-card stat-high"><span>High priority</span><strong>{highCount}</strong><small>Needs attention</small></article>
        <article className="stat-card stat-medium"><span>Medium priority</span><strong>{mediumCount}</strong><small>Plan ahead</small></article>
        <article className="stat-card stat-complete"><span>Completed</span><strong>{completedCount}</strong><small><CheckCircle2 size={14} /> In history</small></article>
      </section>

      <section className="workspace-panel">
        <div className="panel-heading">
          <div><p className="eyebrow eyebrow-dark">Schedule</p><h2>Upcoming appointments</h2></div>
          <div className="dashboard-controls">
            <label className="search-control"><span className="sr-only">Search appointments</span><Search size={18} /><input type="search" placeholder="Search name or notes" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label>
            <label><span className="sr-only">Filter by priority</span><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option value="All">All priorities</option><option value="High">High priority</option><option value="Medium">Medium priority</option><option value="Low">Low priority</option></select></label>
            <label><span className="sr-only">Sort appointments</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="soonest">Soonest first</option><option value="latest">Latest first</option></select></label>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><span className="loading-spinner" />Loading appointments…</div>
        ) : activeAppointments.length === 0 ? (
          <div className="empty-state"><CalendarEmptyIcon /><h3>Your schedule is clear</h3><p>Create an appointment to start planning.</p><Link className="button button-primary" to="/new">Create appointment</Link></div>
        ) : visibleAppointments.length === 0 ? (
          <div className="empty-state"><Search size={28} /><h3>No matches found</h3><p>Try a different search term or priority.</p></div>
        ) : (
          <div className="appointments-grid">
            {visibleAppointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} onDelete={handleDeleteAppointment} onToggleCompletion={handleCompleteAppointment} />)}
          </div>
        )}
      </section>
    </AppShell>
  )
}

function CalendarEmptyIcon() {
  return <BriefcaseBusiness size={30} aria-hidden="true" />
}

export default Dashboard
