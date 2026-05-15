export const normalizeClientEmail = (email?: string): string => {
  return email?.trim().toLowerCase() ?? ''
}

export const parseAuthorizedClientEmails = (source?: string): Set<string> => {
  const emails = source
    ?.split(',')
    .map((email) => normalizeClientEmail(email))
    .filter(Boolean)

  return new Set(emails ?? [])
}

export const isAuthorizedClientEmail = (email: string | undefined, source?: string): boolean => {
  const normalizedEmail = normalizeClientEmail(email)
  if (!normalizedEmail) return false

  return parseAuthorizedClientEmails(source).has(normalizedEmail)
}
