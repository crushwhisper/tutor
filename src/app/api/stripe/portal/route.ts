import { createClient } from '@/lib/supabase/server'
import { createPortalSession } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No Stripe customer' }, { status: 400 })
  }

  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL!

  const session = await createPortalSession({
    customerId: profile.stripe_customer_id,
    returnUrl: `${origin}/app/settings?tab=subscription`,
  })

  return NextResponse.json({ url: session.url })
}
