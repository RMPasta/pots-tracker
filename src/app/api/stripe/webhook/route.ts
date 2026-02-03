import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    logger.error('Stripe webhook: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET', {
      metadata: { route: 'api/stripe/webhook' },
    });
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    logger.warn('Stripe webhook signature verification failed', {
      metadata: { route: 'api/stripe/webhook', message },
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (
    event.type !== 'customer.subscription.created' &&
    event.type !== 'customer.subscription.updated' &&
    event.type !== 'customer.subscription.deleted'
  ) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const existing = await prisma.stripeWebhookEvent.findUnique({
    where: { id: event.id },
  });
  if (existing) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const subscription = event.data.object as Stripe.Subscription;
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

  if (!customerId) {
    logger.warn('Stripe webhook: subscription has no customer', {
      metadata: { eventId: event.id, route: 'api/stripe/webhook' },
    });
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  if (!user) {
    logger.warn('Stripe webhook: no user for customer', {
      metadata: { customerId, eventId: event.id, route: 'api/stripe/webhook' },
    });
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated'
    ) {
      const periodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          subscriptionCurrentPeriodEnd: periodEnd,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'canceled',
          stripeSubscriptionId: subscription.id,
          subscriptionCurrentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null,
        },
      });
    }
  } catch (error) {
    logger.error('Stripe webhook: failed to update user', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { eventId: event.id, userId: user.id, route: 'api/stripe/webhook' },
    });
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  try {
    await prisma.stripeWebhookEvent.create({
      data: { id: event.id },
    });
  } catch {
    // Duplicate from race: already processed, return 200 so Stripe does not retry
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
