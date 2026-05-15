import { Link } from "react-router-dom"

function AppointmentCard({ appointment, onDelete }) {
  return (
    <article className="appointment-card">
      <div className="appointment-card-header">
        <div>
          <h3>{appointment.clientName}</h3>
          <p>{appointment.service}</p>
        </div>

        <span className={`status-badge ${appointment.status.toLowerCase()}`}>
          {appointment.status}
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
        <Link className="secondary-button" to={`/edit/${appointment.id}`}>
          Edit
        </Link>

        <button
          className="danger-button"
          type="button"
          onClick={() => onDelete(appointment.id)}
        >
          Delete
        </button>
      </div>
    </article>
  )
}

export default AppointmentCard