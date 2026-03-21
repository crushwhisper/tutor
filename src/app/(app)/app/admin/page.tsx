import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/app')

  // Fetch platform stats
  const [
    { count: totalUsers, error: e1 },
    { count: proUsers, error: e2 },
    { count: totalCourses, error: e3 },
    { count: totalQCM, error: e4 },
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('subscription_plan', 'pro'),
    supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('qcm_questions').select('*', { count: 'exact', head: true }),
  ])

  if (e1 || e2 || e3 || e4) {
    console.error('Admin stats query errors:', { e1, e2, e3, e4 })
  }

  const { data: recentUsers } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, subscription_plan, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Panneau Admin</h1>
        <span className="section-tag">Admin</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Utilisateurs', value: totalUsers ?? 0, color: 'text-blue-400' },
          { label: 'Abonnés Pro', value: proUsers ?? 0, color: 'text-gold' },
          { label: 'Cours', value: totalCourses ?? 0, color: 'text-green-400' },
          { label: 'QCM', value: totalQCM ?? 0, color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
            <p className="text-muted text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent users */}
      <div className="glass-card p-6">
        <h2 className="text-white font-semibold mb-4">Derniers inscrits</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted border-b border-white/10">
                <th className="text-left py-2 pr-4">Nom</th>
                <th className="text-left py-2 pr-4">Email</th>
                <th className="text-left py-2 pr-4">Plan</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {(recentUsers ?? []).map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="py-3 pr-4 text-white">{u.full_name ?? '—'}</td>
                  <td className="py-3 pr-4 text-muted">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.subscription_plan === 'pro' ? 'bg-gold/20 text-gold' : 'bg-white/10 text-muted'
                    }`}>
                      {u.subscription_plan}
                    </span>
                  </td>
                  <td className="py-3 text-muted text-xs">
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
