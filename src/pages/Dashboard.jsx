import AppointmentCard from "../components/AppointmentCard"
import { sampleAppointments } from "../data/sampleAppointments"

function Dashboard() {
  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <h2>Scheduler</h2>

        <nav>
          <a href="#">Dashboard</a>
          <a href="#">Appointments</a>
          <a href="#">Clients</a>
          <a href="#">Settings</a>
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

          <button className="primary-button">+ New Appointment</button>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <p>Total Appointments</p>
            <h2>{sampleAppointments.length}</h2>
          </div>

          <div className="stat-card">
            <p>Scheduled</p>
            <h2>1</h2>
          </div>

          <div className="stat-card">
            <p>Pending</p>
            <h2>1</h2>
          </div>

          <div className="stat-card">
            <p>Completed</p>
            <h2>1</h2>
          </div>
        </section>

        <section className="appointments-section">
          <div className="section-header">
            <h2>Appointments</h2>
            <input type="text" placeholder="Search appointments..." />
          </div>

          <div className="appointments-grid">
            {sampleAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default Dashboard