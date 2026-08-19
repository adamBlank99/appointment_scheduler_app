const GUEST_APPOINTMENTS_KEY = "guestAppointments"
const MAX_GUEST_APPOINTMENTS = 100

function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function dateFromToday(daysFromToday) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + daysFromToday)
  return formatLocalDate(date)
}

function createDemoAppointments() {
  return [
    {
      id: "demo-roadmap-review",
      clientName: "Product roadmap review",
      date: dateFromToday(2),
      time: "10:00",
      priority: "High",
      notes: "Prepare Q3 milestones and open engineering decisions for the product team.",
      isCompleted: false,
    },
    {
      id: "demo-portfolio-feedback",
      clientName: "Portfolio feedback with Maya Chen",
      date: dateFromToday(5),
      time: "13:30",
      priority: "Medium",
      notes: "Review the case study narrative and collect final feedback before publishing.",
      isCompleted: false,
    },
    {
      id: "demo-accessibility-audit",
      clientName: "Submit accessibility audit",
      date: dateFromToday(8),
      time: "16:00",
      priority: "High",
      notes: "Deadline: send the WCAG findings and remediation plan to the client.",
      isCompleted: false,
    },
    {
      id: "demo-retrospective",
      clientName: "Engineering sprint retrospective",
      date: dateFromToday(-2),
      time: "15:00",
      priority: "Low",
      notes: "Captured action items for handoffs, estimates, and release communication.",
      isCompleted: true,
    },
    {
      id: "demo-launch-brief",
      clientName: "Send launch brief to design",
      date: dateFromToday(-7),
      time: "09:15",
      priority: "Medium",
      notes: "Shared final copy, asset requirements, and launch-day ownership.",
      isCompleted: true,
    },
  ]
}

export function getGuestAppointments() {
  const storedAppointments = sessionStorage.getItem(GUEST_APPOINTMENTS_KEY)

  if (storedAppointments === null) {
    return initializeGuestAppointments()
  }

  try {
    const appointments = JSON.parse(storedAppointments)
    return Array.isArray(appointments) ? appointments : initializeGuestAppointments()
  } catch {
    return initializeGuestAppointments()
  }
}

export function saveGuestAppointments(appointments) {
  const boundedAppointments = appointments.slice(0, MAX_GUEST_APPOINTMENTS)
  sessionStorage.setItem(GUEST_APPOINTMENTS_KEY, JSON.stringify(boundedAppointments))
  return boundedAppointments
}

export function initializeGuestAppointments() {
  return saveGuestAppointments(createDemoAppointments())
}

export function ensureGuestAppointments() {
  if (sessionStorage.getItem(GUEST_APPOINTMENTS_KEY) === null) {
    return initializeGuestAppointments()
  }
  return getGuestAppointments()
}

export function createGuestAppointment(formData) {
  const appointments = getGuestAppointments()
  if (appointments.length >= MAX_GUEST_APPOINTMENTS) {
    throw new Error(`Guest Demo is limited to ${MAX_GUEST_APPOINTMENTS} appointments. Reset the demo to continue.`)
  }

  const appointment = {
    id: crypto.randomUUID(),
    ...formData,
    isCompleted: false,
  }
  return saveGuestAppointments([...appointments, appointment])
}

export function updateGuestAppointment(appointmentId, formData) {
  const appointments = getGuestAppointments().map((appointment) =>
    appointment.id === appointmentId
      ? { ...appointment, ...formData, id: appointmentId }
      : appointment,
  )
  return saveGuestAppointments(appointments)
}

export function deleteGuestAppointment(appointmentId) {
  return saveGuestAppointments(
    getGuestAppointments().filter((appointment) => appointment.id !== appointmentId),
  )
}

export function setGuestAppointmentCompletion(appointmentId, isCompleted) {
  const appointments = getGuestAppointments().map((appointment) =>
    appointment.id === appointmentId
      ? { ...appointment, isCompleted }
      : appointment,
  )
  return saveGuestAppointments(appointments)
}
