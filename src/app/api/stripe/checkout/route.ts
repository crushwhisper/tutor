import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, STRIPE_PRICES } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await request.json() // 'monthly' | '6months'

  const priceId = plan === '6months' ? STRIPE_PRICES.PRO_6MONTHS : STRIPE_PRICES.PRO_MONTHLY
  if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 500 })

  const { data: profile } = await supabase
    .from('users')
    .select('email')
    .eq('id', user.id)
    .single()

  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL!

  const session = await createCheckoutSession({
    userId: user.id,
    email: profile?.email ?? user.email!,
    priceId,
    successUrl: `${origin}/app/settings?tab=subscription&success=true`,
    cancelUrl: `${origin}/app/settings?tab=subscription`,
  })

  return NextResponse.json({ url: session.url })
}
