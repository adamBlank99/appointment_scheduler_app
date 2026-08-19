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
  buttonText = "Save appointment",
  onSubmit,
  submitting = false,
}) {
  const [formData, setFormData] = useState({ ...emptyForm, ...initialValues })
  const [validationMessage, setValidationMessage] = useState("")

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setValidationMessage("")

    if (!formData.clientName.trim() || !formData.date || !formData.time) {
      setValidationMessage("Add a name, date, and time before saving.")
      return
    }

    onSubmit({
      ...formData,
      clientName: formData.clientName.trim(),
      notes: formData.notes.trim(),
    })
  }

  return (
    <form className="appointment-form" onSubmit={handleSubmit}>
      {validationMessage && <p className="message message-error">{validationMessage}</p>}

      <label className="form-field form-field-wide">
        <span>Appointment name</span>
        <input
          type="text"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          placeholder="e.g. Product roadmap review"
          maxLength={100}
          required
        />
      </label>

      <label className="form-field">
        <span>Date</span>
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
      </label>

      <label className="form-field">
        <span>Time</span>
        <input type="time" name="time" value={formData.time} onChange={handleChange} required />
      </label>

      <label className="form-field form-field-wide">
        <span>Priority</span>
        <select name="priority" value={formData.priority} onChange={handleChange}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </label>

      <label className="form-field form-field-wide">
        <span>Notes <small>Optional</small></span>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add context, a location, or preparation details"
          maxLength={500}
        />
        <small className="field-help">Do not enter passwords, financial information, health information, or other sensitive personal data.</small>
      </label>

      <button className="button button-primary form-submit" type="submit" disabled={submitting}>
        {buttonText}
      </button>
    </form>
  )
}

export default AppointmentForm
