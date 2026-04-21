import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Users, Crown, BookOpen, ClipboardText } from '@phosphor-icons/react/dist/ssr'
import QcmExtractor from './QcmExtractor'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabaseAdmin
    .from('users').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/app')

  const [
    { count: totalUsers },
    { count: proUsers },
    { count: totalCourses },
    { count: totalQCM },
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('subscription_plan', 'pro'),
    supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('qcm_questions').select('*', { count: 'exact', head: true }),
  ])

  const { data: recentUsers } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, subscription_plan, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  const surface = {
    background: 'var(--app-surface)',
    border: '1px solid var(--app-border)',
    borderRadius: '16px',
    padding: '24px 28px',
  }

  const stats = [
    { label: 'Utilisateurs', value: totalUsers ?? 0, icon: <Users size={20} />, color: 'var(--accent)', bg: 'var(--accent-soft)' },
    { label: 'Abonnés Pro', value: proUsers ?? 0, icon: <Crown size={20} />, color: 'var(--warning)', bg: 'var(--warning-soft)' },
    { label: 'Cours', value: totalCourses ?? 0, icon: <BookOpen size={20} />, color: 'var(--success)', bg: 'var(--success-soft)' },
    { label: 'QCM', value: totalQCM ?? 0, icon: <ClipboardText size={20} />, color: 'var(--accent)', bg: 'var(--accent-soft)' },
  ]

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '4px' }}>
            Panneau Admin
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--app-text-muted)' }}>
            Vue d&apos;ensemble de la plateforme.
          </p>
        </div>
        <span style={{
          fontSize: '11px', fontWeight: 600, letterSpacing: '1px',
          padding: '4px 12px', borderRadius: '999px',
          background: 'var(--warning-soft)', color: 'var(--warning)',
          textTransform: 'uppercase',
        }}>
          Admin
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {stats.map((stat) => (
          <div key={stat.label} style={surface}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: stat.bg, color: stat.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '14px',
            }}>
              {stat.icon}
            </div>
            <div style={{
              fontSize: '28px', fontWeight: 700, color: stat.color,
              fontFamily: 'var(--font-geist-mono), monospace',
              marginBottom: '4px',
            }}>
              {stat.value}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* QCM Extractor */}
      <QcmExtractor />

      {/* Recent users */}
      <div style={{ ...surface, marginTop: '20px' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '20px' }}>
          Derniers inscrits
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--app-border)' }}>
                {['Nom', 'Email', 'Plan', 'Date'].map((h) => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px 12px 0',
                    fontSize: '11px', fontWeight: 600, letterSpacing: '1px',
                    textTransform: 'uppercase', color: 'var(--app-text-ghost)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentUsers ?? []).map((u) => (
                <tr
                  key={u.id}
                  style={{ borderBottom: '1px solid var(--app-border)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--app-surface-hover)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                >
                  <td style={{ padding: '14px 12px 14px 0', color: 'var(--app-text)', fontWeight: 500 }}>
                    {u.full_name ?? '—'}
                  </td>
                  <td style={{ padding: '14px 12px 14px 0', color: 'var(--app-text-muted)' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '14px 12px 14px 0' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '3px 10px',
                      borderRadius: '999px',
                      background: u.subscription_plan === 'pro' ? 'var(--warning-soft)' : 'var(--app-bg)',
                      color: u.subscription_plan === 'pro' ? 'var(--warning)' : 'var(--app-text-ghost)',
                      border: `1px solid ${u.subscription_plan === 'pro' ? 'rgba(245,158,11,0.3)' : 'var(--app-border)'}`,
                    }}>
                      {u.subscription_plan}
                    </span>
                  </td>
                  <td style={{ padding: '14px 0', color: 'var(--app-text-muted)', fontSize: '13px', fontFamily: 'var(--font-geist-mono), monospace' }}>
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
