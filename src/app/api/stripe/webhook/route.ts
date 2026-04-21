import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendProUpgradeEmail } from '@/lib/resend'
import { NextResponse } from 'next/server'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key, { apiVersion: '2026-02-25.clover', typescript: true })
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (!userId) break

      // Get subscription details
      const subscription = await getStripe().subscriptions.retrieve(session.subscription as string)
      const customerId = session.customer as string

      // current_period_end lives on the subscription item in this API version
      const periodEnd = subscription.items.data[0]?.current_period_end

      await supabaseAdmin
        .from('users')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          subscription_plan: 'pro',
          subscription_status: subscription.status,
          subscription_ends_at: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
        })
        .eq('id', userId)

      // Send upgrade email
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single()

      if (user?.email) {
        await sendProUpgradeEmail({ to: user.email, name: user.full_name ?? 'Étudiant' }).catch(console.error)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const periodEnd = subscription.items.data[0]?.current_period_end

      await supabaseAdmin
        .from('users')
        .update({
          subscription_status: subscription.status,
          subscription_ends_at: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
        })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await supabaseAdmin
        .from('users')
        .update({
          subscription_plan: 'starter',
          subscription_status: 'canceled',
          stripe_subscription_id: null,
        })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      // In this Stripe API version, subscription lives at invoice.parent.subscription_details.subscription
      const subscriptionId =
        invoice.parent?.type === 'subscription_details'
          ? (invoice.parent.subscription_details?.subscription as string | undefined)
          : undefined

      if (subscriptionId) {
        await supabaseAdmin
          .from('users')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_subscription_id', subscriptionId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
