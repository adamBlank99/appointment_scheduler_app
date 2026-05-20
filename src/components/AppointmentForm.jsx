import { useState } from "react"

const emptyForm = {
  clientName: "",
  date: "",
  time: "",
  status: "Scheduled",
  notes: "",
}

function AppointmentForm({
  initialValues = emptyForm,
  buttonText = "Save Appointment",
  onSubmit,
}) {
  const [formData, setFormData] = useState(initialValues)

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!formData.clientName || !formData.date || !formData.time) {
      alert("Please fill out the required fields.")
      return
    }

    onSubmit(formData)
  }

  return (
    <form className="appointment-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input
          type="text"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          placeholder="Enter client name"
        />
      </label>

      <label>
        Date
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
      </label>

      <label>
        Time
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
        />
      </label>

      <label>
        Status
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option>Scheduled</option>
          <option>Pending</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
      </label>

      <label>
        Notes
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add appointment notes"
        ></textarea>
      </label>

      <button className="primary-button" type="submit">
        {buttonText}
      </button>
    </form>
  )
}

export default AppointmentForm 