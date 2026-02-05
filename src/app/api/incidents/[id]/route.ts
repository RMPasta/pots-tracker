import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validate } from '@/lib/validation';
import { incidentCreateSchema } from '@/lib/schemas/reports';
import { compileDayReport } from '@/lib/compileDayReport';
import { handleError } from '@/lib/errors';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

function startOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

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

    const incident = await prisma.incident.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!incident) {
      throw new NotFoundError('Incident', id);
    }

    return NextResponse.json({ success: true, data: incident });
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
    logger.error('GET /api/incidents/[id] failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { route: 'api/incidents/[id]' },
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

export async function PATCH(
  request: NextRequest,
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

    const incident = await prisma.incident.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!incident) {
      throw new NotFoundError('Incident', id);
    }

    const body = await request.json();
    const data = validate(incidentCreateSchema, body);

    const oldDate = startOfDay(incident.date);
    const newDate = data.date;

    const updated = await prisma.incident.update({
      where: { id },
      data: {
        date: newDate,
        time: data.time ?? null,
        symptoms: data.symptoms ?? null,
        notes: data.notes ?? null,
        rating: data.rating ?? null,
      },
    });

    await compileDayReport(session.user.id, newDate);
    const sameDay =
      oldDate.getTime() ===
      new Date(
        Date.UTC(newDate.getUTCFullYear(), newDate.getUTCMonth(), newDate.getUTCDate())
      ).getTime();
    if (!sameDay) {
      await compileDayReport(session.user.id, oldDate);
    }

    return NextResponse.json({ success: true, data: updated });
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
    logger.error('PATCH /api/incidents/[id] failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { route: 'api/incidents/[id]' },
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
