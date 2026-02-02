import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleError } from '@/lib/errors';
import { NotFoundError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const report = await prisma.dailyReport.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!report) {
      throw new NotFoundError('Report', id);
    }

    let incidents: Awaited<ReturnType<typeof prisma.incident.findMany>> | undefined;

    if (report.source === 'compiled') {
      const startOfDay = new Date(
        Date.UTC(
          report.date.getUTCFullYear(),
          report.date.getUTCMonth(),
          report.date.getUTCDate()
        )
      );
      incidents = await prisma.incident.findMany({
        where: {
          userId: session.user.id,
          date: startOfDay,
        },
        orderBy: [{ time: 'asc' }, { createdAt: 'asc' }],
      });
    }

    return NextResponse.json({
      success: true,
      data: { ...report, incidents: incidents ?? [] },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        },
        { status: 404 }
      );
    }
    const errorInfo = handleError(error);
    logger.error('GET /api/reports/[id] failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { route: 'api/reports/[id]' },
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
