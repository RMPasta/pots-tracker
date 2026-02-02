import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { callAI } from '@/lib/ai/client';
import { buildOnOpenMessagePrompt } from '@/lib/ai/prompts';
import { checkRateLimit } from '@/lib/rate-limit';
import { handleError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { RateLimitError } from '@/lib/errors';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    await checkRateLimit(session.user.id, 'ai_on_open_message');

    const prompt = buildOnOpenMessagePrompt();
    const { content } = await callAI(prompt, { maxTokens: 150 });
    const message = content.trim();

    return NextResponse.json({
      success: true,
      data: { message },
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: 'RATE_LIMIT_EXCEEDED',
          },
        },
        { status: 429 }
      );
    }
    const errorInfo = handleError(error);
    logger.error('On-open message failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { route: 'api/ai/on-open-message' },
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
