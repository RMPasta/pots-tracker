import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validate } from '@/lib/validation';
import { userProfileUpdateSchema } from '@/lib/schemas/user';
import { handleError } from '@/lib/errors';
import { ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = validate(userProfileUpdateSchema, body);

    const name = data.name === undefined ? undefined : (data.name?.trim() || null);

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: name === undefined ? {} : { name },
    });

    return NextResponse.json({
      success: true,
      data: { name: updated.name },
    });
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
    logger.error('PATCH /api/user failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { route: 'api/user' },
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
