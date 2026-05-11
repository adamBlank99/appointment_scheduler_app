import { Link } from "react-router-dom"

function NewAppointment() {
  return (
    <main className="form-page">
      <section className="form-card">
        <Link className="back-link" to="/dashboard">
          ← Back to Dashboard
        </Link>

        <p className="eyebrow">New Appointment</p>
        <h1>Create Appointment</h1>

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
            <textarea placeholder="Add appointment notes"></textarea>
          </label>

          <button className="primary-button" type="submit">
            Save Appointment
          </button>
        </form>
      </section>
    </main>
  )
}

export default NewAppointment