import { Link, useParams } from "react-router-dom"

function EditAppointment() {
  const { id } = useParams()

  return (
    <main className="form-page">
      <section className="form-card">
        <Link className="back-link" to="/dashboard">
          ← Back to Dashboard
        </Link>

        <p className="eyebrow">Edit Appointment</p>
        <h1>Edit Appointment #{id}</h1>

        <form className="appointment-form">
          <label>
            Client Name
            <input type="text" placeholder="Enter client name" />
          </label>

          <label>
            Service
            <input type="text" placeholder="Enter service type" />
          </label>

          <label>
            Date
            <input type="date" />
          </label>

          <label>
            Time
            <input type="time" />
          </label>

          <label>
            Status
            <select>
              <option>Scheduled</option>
              <option>Pending</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </label>

          <label>
            Notes
            <textarea placeholder="Update appointment notes"></textarea>
          </label>

          <button className="primary-button" type="submit">
            Update Appointment
          </button>
        </form>
      </section>
    </main>
  )
}

export default EditAppointment