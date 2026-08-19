import { CheckCircle2, CircleAlert, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import AppointmentCard from "../components/AppointmentCard"
import AppShell from "../components/AppShell"
import { useAuth } from "../context/authContext"
import { deleteAppointment, getAppointments, setAppointmentCompletion } from "../services/appointmentService"
import {
  deleteGuestAppointment,
  getGuestAppointments,
  initializeGuestAppointments,
  setGuestAppointmentCompletion,
} from "../services/guestAppointmentService"

function CompletedTasks() {
  const { user, isGuest } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [sortOrder, setSortOrder] = useState("latest")

  useEffect(() => {
    let isCurrent = true

    async function loadAppointments() {
      setLoading(true)
      try {
        const saved = isGuest ? getGuestAppointments() : await getAppointments(user.id)
        if (isCurrent) setAppointments(saved)
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
    if (!window.confirm("Permanently delete this completed appointment?")) return

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

  async function handleRestoreAppointment(appointmentId) {
    try {
      if (isGuest) {
        setAppointments(setGuestAppointmentCompletion(appointmentId, false))
      } else {
        const restored = await setAppointmentCompletion(appointmentId, false, user.id)
        setAppointments((current) => current.map((item) => item.id === appointmentId ? restored : item))
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
    }
  }

  const completedAppointments = appointments.filter(({ isCompleted }) => isCompleted)
  const visibleAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return completedAppointments
      .filter((appointment) => {
        const matchesSearch = appointment.clientName.toLowerCase().includes(normalizedSearch) || (appointment.notes || "").toLowerCase().includes(normalizedSearch)
        const matchesPriority = priorityFilter === "All" || appointment.priority === priorityFilter
        return matchesSearch && matchesPriority
      })
      .sort((first, second) => {
        const firstDate = new Date(`${first.date}T${first.time}`)
        const secondDate = new Date(`${second.date}T${second.time}`)
        return sortOrder === "soonest" ? firstDate - secondDate : secondDate - firstDate
      })
  }, [completedAppointments, priorityFilter, searchTerm, sortOrder])

  return (
    <AppShell onResetDemo={isGuest ? handleResetDemo : undefined}>
      <header className="page-header compact-header">
        <div><p className="eyebrow">Appointment history</p><h1>Completed appointments.</h1><p>Review finished work or restore an item to your active schedule.</p></div>
      </header>

      {errorMessage && <p className="message message-error"><CircleAlert size={18} />{errorMessage}</p>}

      <section className="workspace-panel">
        <div className="panel-heading">
          <div><p className="eyebrow eyebrow-dark">History</p><h2>{completedAppointments.length} completed</h2></div>
          <div className="dashboard-controls">
            <label className="search-control"><span className="sr-only">Search completed appointments</span><Search size={18} /><input type="search" placeholder="Search completed" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label>
            <label><span className="sr-only">Filter by priority</span><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option value="All">All priorities</option><option value="High">High priority</option><option value="Medium">Medium priority</option><option value="Low">Low priority</option></select></label>
            <label><span className="sr-only">Sort completed appointments</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="latest">Latest first</option><option value="soonest">Oldest first</option></select></label>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><span className="loading-spinner" />Loading history…</div>
        ) : completedAppointments.length === 0 ? (
          <div className="empty-state"><CheckCircle2 size={32} /><h3>No completed appointments yet</h3><p>Completed items will be kept here for easy reference.</p></div>
        ) : visibleAppointments.length === 0 ? (
          <div className="empty-state"><Search size={28} /><h3>No matches found</h3><p>Try a different search term or priority.</p></div>
        ) : (
          <div className="appointments-grid">
            {visibleAppointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} onDelete={handleDeleteAppointment} onToggleCompletion={handleRestoreAppointment} />)}
          </div>
        )}
      </section>
    </AppShell>
  )
}

export default CompletedTasks
