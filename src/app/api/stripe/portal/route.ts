import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { handleError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(): Promise<NextResponse> {
  try {
    if (!stripe) {
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'No subscription to manage.' },
        },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.AUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/dashboard/settings`,
    });

    return NextResponse.json({
      success: true,
      url: portalSession.url,
    });
  } catch (error) {
    const errorInfo = handleError(error);
    logger.error('POST /api/stripe/portal failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { route: 'api/stripe/portal' },
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
