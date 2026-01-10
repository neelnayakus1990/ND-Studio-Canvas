const parseAdminEmails = () => {
  const raw = process.env.ADMIN_EMAILS ?? "";

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

export const isAdminEmail = (email?: string | null) => {
  if (!email) {
    return false;
  }

  const adminEmails = parseAdminEmails();
  return adminEmails.includes(email.toLowerCase());
};
