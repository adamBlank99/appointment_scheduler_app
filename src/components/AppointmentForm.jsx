import { useState } from "react"

const emptyForm = {
  clientName: "",
  date: "",
  time: "",
  priority: "Medium",
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
          placeholder="Enter task name"
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
        Priority
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
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