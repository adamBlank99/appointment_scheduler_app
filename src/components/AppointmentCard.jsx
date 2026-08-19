import { CalendarDays, Check, Clock3, Pencil, RotateCcw, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
    .format(new Date(`${date}T00:00:00`))
}

function formatTime(time) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" })
    .format(new Date(`2000-01-01T${time}`))
}

function AppointmentCard({ appointment, onDelete, onToggleCompletion }) {
  const priority = appointment.priority || "Medium"
  const isCompleted = Boolean(appointment.isCompleted)

  return (
    <article className="appointment-card">
      <div className="appointment-card-header">
        <div>
          <p className="card-kicker">{isCompleted ? "Completed appointment" : "Upcoming appointment"}</p>
          <h3>{appointment.clientName}</h3>
        </div>
        <span className={`priority-badge ${priority.toLowerCase()}`}>{priority}</span>
      </div>

      <div className="appointment-meta">
        <span><CalendarDays size={17} /> {formatDate(appointment.date)}</span>
        <span><Clock3 size={17} /> {formatTime(appointment.time)}</span>
      </div>

      <p className="appointment-notes">
        {appointment.notes || "No notes were added for this appointment."}
      </p>

      <div className="appointment-actions">
        <button className="button button-complete" type="button" onClick={() => onToggleCompletion(appointment.id)}>
          {isCompleted ? <RotateCcw size={17} /> : <Check size={17} strokeWidth={3} />}
          {isCompleted ? "Restore" : "Complete"}
        </button>

        {!isCompleted && (
          <Link className="button button-secondary" to={`/edit/${appointment.id}`}>
            <Pencil size={16} /> Edit
          </Link>
        )}

        <button className="button button-danger" type="button" onClick={() => onDelete(appointment.id)}>
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </article>
  )
}

export default AppointmentCard
