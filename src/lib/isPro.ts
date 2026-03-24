/** Admin users always have full access. */
export function checkIsPro(profile: {
  role?: string | null
  subscription_plan?: string | null
  subscription_status?: string | null
} | null | undefined): boolean {
  if (!profile) return false
  if (profile.role === 'admin') return true
  return profile.subscription_plan === 'pro' && profile.subscription_status === 'active'
}
