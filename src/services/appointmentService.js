import { supabase } from "./supabaseClient"

function formatAppointment(row) {
  return {
    id: row.id,
    clientName: row.client_name,
    date: row.appointment_date,
    time: row.appointment_time?.slice(0, 5),
    status: row.status,
    notes: row.notes || "",
  }
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
    status: formData.status,
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
    status: formData.status,
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

  if (response.error) {
    throw response.error
  }

  return true
}

export async function getAppointmentById(appointmentId, userId) {
  const response = await supabase
    .from("appointments")
    .select("*")
    .eq("id", appointmentId)
    .eq("user_id", userId)
    .single()

  if (response.error) {
    throw response.error
  }

  return formatAppointment(response.data)
}