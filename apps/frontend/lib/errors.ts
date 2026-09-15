/**
 * Extracts a human-readable message from anything thrown by `api()`,
 * `fetch`, or a mutation. NestJS validation errors arrive as string arrays.
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (Array.isArray(message)) return message.filter((m) => typeof m === "string").join(" ") || fallback;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}
