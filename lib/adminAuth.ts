import "server-only";

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;

  const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((allowedEmail) => allowedEmail.trim().toLowerCase())
    .filter(Boolean);

  return allowedEmails.includes(email.trim().toLowerCase());
}
