import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validate } from '@/lib/validation';
import { contactFormSchema } from '@/lib/schemas/contact';
import { handleError } from '@/lib/errors';
import { ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') ?? null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const contactSubmission = prisma.contactSubmission;
    if (!contactSubmission || typeof contactSubmission.count !== 'function') {
      logger.error('POST /api/contact: Prisma client missing contactSubmission delegate', {
        metadata: { route: 'api/contact' },
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Service temporarily unavailable. Please try again in a moment.',
            code: 'SERVICE_UNAVAILABLE',
          },
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const data = validate(contactFormSchema, body);

    const ip = getClientIp(request);
    if (ip) {
      const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
      const count = await contactSubmission.count({
        where: {
          ip,
          createdAt: { gt: since },
        },
      });
      if (count >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Too many submissions from this address. Please try again later.',
              code: 'RATE_LIMIT_EXCEEDED',
            },
          },
          { status: 429 }
        );
      }
    }

    await contactSubmission.create({
      data: {
        name: data.name?.trim() || null,
        email: data.email?.trim() || null,
        message: data.message.trim(),
        ip,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            fields: error.fields,
          },
        },
        { status: 400 }
      );
    }
    const errorInfo = handleError(error);
    logger.error('POST /api/contact failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { route: 'api/contact' },
    });
    const message =
      errorInfo.statusCode >= 500 ? 'Something went wrong. Please try again.' : errorInfo.message;
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code: errorInfo.code,
        },
      },
      { status: errorInfo.statusCode }
    );
  }
}
