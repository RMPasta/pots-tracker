import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validate } from '@/lib/validation';
import { incidentCreateSchema } from '@/lib/schemas/reports';
import { parseCalendarDateUTC } from '@/lib/dates';
import { compileDayReport } from '@/lib/compileDayReport';
import { handleError } from '@/lib/errors';
import { ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

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
    const data = validate(incidentCreateSchema, body);

    const incident = await prisma.incident.create({
      data: {
        userId: session.user.id,
        date: data.date,
        time: data.time ?? null,
        symptoms: data.symptoms ?? null,
        notes: data.notes ?? null,
        rating: data.rating ?? null,
      },
    });

    await compileDayReport(session.user.id, data.date);

    return NextResponse.json({ success: true, data: incident }, { status: 201 });
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
    logger.error('POST /api/incidents failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { route: 'api/incidents' },
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
    const dateParam = searchParams.get('date');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const where: { userId: string; date?: { gte?: Date; lte?: Date } } = {
      userId: session.user.id,
    };

    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      const start = parseCalendarDateUTC(dateParam);
      where.date = { gte: start, lte: start };
    } else if (fromParam || toParam) {
      const gte = fromParam
        ? new Date(
            Date.UTC(
              new Date(fromParam).getUTCFullYear(),
              new Date(fromParam).getUTCMonth(),
              new Date(fromParam).getUTCDate()
            )
          )
        : undefined;
      const toDate = toParam ? new Date(toParam) : new Date();
      const lte = new Date(
        Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate())
      );
      where.date = { ...(gte && { gte }), lte };
    }

    const incidents = await prisma.incident.findMany({
      where,
      orderBy: [{ date: 'desc' }, { time: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({ success: true, data: incidents });
  } catch (error) {
    const errorInfo = handleError(error);
    logger.error('GET /api/incidents failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { route: 'api/incidents' },
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
