import { supabase } from "./supabaseClient"

function formatAppointment(row) {
  return {
    id: row.id,
    clientName: row.client_name,
    date: row.appointment_date,
    time: row.appointment_time?.slice(0, 5),
    isCompleted: row.is_completed ?? false,
    priority: row.priority || "Medium",
    notes: row.notes || "",
  }
}

export async function setAppointmentCompletion(appointmentId, isCompleted, userId) {
  const response = await supabase
    .from("appointments")
    .update({ is_completed: isCompleted })
    .eq("id", appointmentId)
    .eq("user_id", userId)
    .select()
    .single()

  if (response.error) {
    throw response.error
  }

  return formatAppointment(response.data)
}

export async function getAppointments(userId) {
  const response = await supabase
    .from("appointments")
    .select("*")
    .eq("user_id", userId)
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true })

  if (response.error) {
    throw response.error
  }

  return response.data.map(formatAppointment)
}

export async function createAppointment(formData, userId) {
  const newAppointment = {
    user_id: userId,
    client_name: formData.clientName,
    appointment_date: formData.date,
    appointment_time: formData.time,
    priority: formData.priority,
    is_completed: false,
    notes: formData.notes,
  }

  const response = await supabase
    .from("appointments")
    .insert(newAppointment)
    .select()
    .single()

  if (response.error) {
    throw response.error
  }

  return formatAppointment(response.data)
}


export async function updateAppointment(appointmentId, formData, userId) {
  const updatedAppointment = {
    client_name: formData.clientName,
    appointment_date: formData.date,
    appointment_time: formData.time,
    priority: formData.priority,
    notes: formData.notes,
  }

  const response = await supabase
    .from("appointments")
    .update(updatedAppointment)
    .eq("id", appointmentId)
    .eq("user_id", userId)
    .select()
    .single()

  if (response.error) {
    throw response.error
  }

  return formatAppointment(response.data)
}

export async function deleteAppointment(appointmentId, userId) {
  const response = await supabase
    .from("appointments")
    .delete()
    .eq("id", appointmentId)
    .eq("user_id", userId)
    .select("id")

  if (response.error) {
    throw response.error
  }

  return response.data.length > 0
}

export async function getAppointmentById(appointmentId, userId) {
  const response = await supabase
    .from("appointments")
    .select("*")
    .eq("id", appointmentId)
    .eq("user_id", userId)
    .maybeSingle()

  if (response.error) {
    throw response.error
  }

  return response.data ? formatAppointment(response.data) : null
}
