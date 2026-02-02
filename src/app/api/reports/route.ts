import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validate } from '@/lib/validation';
import { reportCreateSchema } from '@/lib/schemas/reports';
import { handleError } from '@/lib/errors';
import { ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const DEFAULT_DAYS = 90;

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const now = new Date();
    const toDate = toParam ? new Date(toParam) : now;
    const fromDate = fromParam
      ? new Date(fromParam)
      : new Date(now.getTime() - DEFAULT_DAYS * 24 * 60 * 60 * 1000);

    const start = new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate()));
    const end = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate()));

    const reports = await prisma.dailyReport.findMany({
      where: {
        userId: session.user.id,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    const errorInfo = handleError(error);
    logger.error('GET /api/reports failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { route: 'api/reports' },
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = validate(reportCreateSchema, body);

    const report = await prisma.dailyReport.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: data.date,
        },
      },
      create: {
        userId: session.user.id,
        date: data.date,
        source: 'full_log',
        symptoms: data.symptoms ?? null,
        dietBehaviorNotes: data.dietBehaviorNotes ?? null,
        overallFeeling: data.overallFeeling ?? null,
      },
      update: {
        symptoms: data.symptoms ?? null,
        dietBehaviorNotes: data.dietBehaviorNotes ?? null,
        overallFeeling: data.overallFeeling ?? null,
      },
    });

    return NextResponse.json({ success: true, data: report }, { status: 201 });
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
    logger.error('POST /api/reports failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { route: 'api/reports' },
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
