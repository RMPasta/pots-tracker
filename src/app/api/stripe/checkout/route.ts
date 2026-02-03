import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { handleError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(): Promise<NextResponse> {
  try {
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!stripe || !priceId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Payments are not configured.' },
        },
        { status: 503 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const email = session.user.email ?? undefined;
    if (!email) {
      return NextResponse.json(
        { success: false, error: { message: 'Email required for checkout.' } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found.' } },
        { status: 404 }
      );
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const baseUrl =
      process.env.AUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?subscription=success`,
      cancel_url: `${baseUrl}/pricing?canceled=1`,
      client_reference_id: session.user.id,
    });

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
    });
  } catch (error) {
    const errorInfo = handleError(error);
    logger.error('POST /api/stripe/checkout failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { route: 'api/stripe/checkout' },
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          message: errorInfo.message,
          code: errorInfo.code,
        },
      },
      { status: errorInfo.statusCode }
    );
  }
}
