export function allow(user: { role: string } | null, roles: string[]): void {
  if (!user || !roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
}