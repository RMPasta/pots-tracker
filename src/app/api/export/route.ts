import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { parseCalendarDateUTC } from '@/lib/dates';
import { runExport } from '@/lib/export/exportService';
import { handleError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const MAX_RANGE_DAYS = 365;

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

    if (
      !fromParam ||
      !toParam ||
      !/^\d{4}-\d{2}-\d{2}$/.test(fromParam) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(toParam)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Missing or invalid from/to (YYYY-MM-DD)' },
        },
        { status: 400 }
      );
    }

    const from = parseCalendarDateUTC(fromParam);
    const to = parseCalendarDateUTC(toParam);

    if (from.getTime() > to.getTime()) {
      return NextResponse.json(
        { success: false, error: { message: 'from must be on or before to' } },
        { status: 400 }
      );
    }

    const rangeDays =
      Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    if (rangeDays > MAX_RANGE_DAYS) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Date range must be ${MAX_RANGE_DAYS} days or less`,
          },
        },
        { status: 400 }
      );
    }

    const { csv } = await runExport(session.user.id, from, to);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pots-export-${fromParam}-${toParam}.csv"`,
      },
    });
  } catch (error) {
    const errorInfo = handleError(error);
    logger.error('GET /api/export failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { route: 'api/export' },
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
