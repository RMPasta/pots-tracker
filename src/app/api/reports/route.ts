import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validate } from '@/lib/validation';
import { reportCreateSchema } from '@/lib/schemas/reports';
import { parseCalendarDateUTC } from '@/lib/dates';
import { todayStartUTC } from '@/lib/dates';
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
    const dateParam = searchParams.get('date');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    if (dateParam) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return NextResponse.json(
          { success: false, error: { message: 'Invalid date parameter' } },
          { status: 400 }
        );
      }
      const startOfDay = parseCalendarDateUTC(dateParam);
      const report = await prisma.dailyReport.findUnique({
        where: {
          userId_date: { userId: session.user.id, date: startOfDay },
        },
      });
      return NextResponse.json({ success: true, data: report });
    }

    const now = new Date();
    const end =
      toParam && /^\d{4}-\d{2}-\d{2}$/.test(toParam)
        ? parseCalendarDateUTC(toParam)
        : todayStartUTC();
    let start: Date;
    if (fromParam && /^\d{4}-\d{2}-\d{2}$/.test(fromParam)) {
      start = parseCalendarDateUTC(fromParam);
    } else {
      const from = new Date(now);
      from.setDate(from.getDate() - DEFAULT_DAYS);
      start = new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate()));
    }

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
        diet: data.diet ?? null,
        exercise: data.exercise ?? null,
        medicine: data.medicine ?? null,
        waterIntake: data.waterIntake ?? null,
        sodiumIntake: data.sodiumIntake ?? null,
        feelingMorning: data.feelingMorning ?? null,
        feelingAfternoon: data.feelingAfternoon ?? null,
        feelingNight: data.feelingNight ?? null,
        overallRating: data.overallRating ?? null,
      },
      update: {
        source: 'full_log',
        diet: data.diet ?? null,
        exercise: data.exercise ?? null,
        medicine: data.medicine ?? null,
        waterIntake: data.waterIntake ?? null,
        sodiumIntake: data.sodiumIntake ?? null,
        feelingMorning: data.feelingMorning ?? null,
        feelingAfternoon: data.feelingAfternoon ?? null,
        feelingNight: data.feelingNight ?? null,
        overallRating: data.overallRating ?? null,
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
