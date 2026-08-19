export function getAuthErrorMessage(error) {
  const message = error?.message || "Authentication failed. Please try again."
  const normalizedMessage = message.toLowerCase()

  if (
    normalizedMessage.includes("failed to fetch") ||
    normalizedMessage.includes("networkerror") ||
    normalizedMessage.includes("network request failed")
  ) {
    return "Unable to reach the authentication service. Check that the Supabase project is active and the project URL is correct."
  }

  return message
}
