import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { canUseAIInsights } from '@/lib/subscription';
import { prisma } from '@/lib/prisma';
import { callAI } from '@/lib/ai/client';
import { buildHistoryAnalysisPrompt } from '@/lib/ai/prompts';
import { buildAnalysisPayload, MAX_ANALYSIS_RANGE_DAYS } from '@/lib/ai/analysisData';
import { checkRateLimitCalendarDay } from '@/lib/rate-limit';
import { parseCalendarDateUTC, todayStartUTC } from '@/lib/dates';
import { handleError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { RateLimitError } from '@/lib/errors';

const DEFAULT_DAYS = 30;

const NO_DATA_RESPONSE = {
  success: true,
  data: {
    summary: 'No data in this range. Log some days or incidents to get personalized insights.',
    trends: [] as string[],
    insights: [] as string[],
    suggestions: [
      'Try logging a few days (diet, exercise, how you feel, incidents) to get personalized insights.',
    ],
    weeklyHighlight: '',
  },
};

function parseBody(body: unknown): { from: string; to: string } {
  if (!body || typeof body !== 'object') {
    const end = todayStartUTC();
    const from = new Date(end);
    from.setUTCDate(from.getUTCDate() - DEFAULT_DAYS);
    const fromStr = `${from.getUTCFullYear()}-${String(from.getUTCMonth() + 1).padStart(2, '0')}-${String(from.getUTCDate()).padStart(2, '0')}`;
    const toStr = `${end.getUTCFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, '0')}-${String(end.getUTCDate()).padStart(2, '0')}`;
    return { from: fromStr, to: toStr };
  }
  const b = body as Record<string, unknown>;
  const from = b.from;
  const to = b.to;
  const end = todayStartUTC();
  const fromStr =
    typeof from === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(from)
      ? from
      : (() => {
          const d = new Date(end);
          d.setUTCDate(d.getUTCDate() - DEFAULT_DAYS);
          return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
        })();
  const toStr =
    typeof to === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(to)
      ? to
      : `${end.getUTCFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, '0')}-${String(end.getUTCDate()).padStart(2, '0')}`;
  return { from: fromStr, to: toStr };
}

function validateAnalysisResponse(parsed: unknown): {
  summary: string;
  trends: string[];
  insights: string[];
  suggestions: string[];
  weeklyHighlight?: string;
} {
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid response shape');
  const p = parsed as Record<string, unknown>;
  const summary = typeof p.summary === 'string' ? p.summary : 'No summary available.';
  const trends = Array.isArray(p.trends)
    ? p.trends.filter((x): x is string => typeof x === 'string')
    : [];
  const insights = Array.isArray(p.insights)
    ? p.insights.filter((x): x is string => typeof x === 'string')
    : [];
  const suggestions = Array.isArray(p.suggestions)
    ? p.suggestions.filter((x): x is string => typeof x === 'string')
    : [];
  const weeklyHighlight = typeof p.weeklyHighlight === 'string' ? p.weeklyHighlight : undefined;
  return {
    summary,
    trends,
    insights,
    suggestions,
    weeklyHighlight,
  };
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

    if (!canUseAIInsights(session)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Active subscription required for AI insights.',
            code: 'SUBSCRIPTION_REQUIRED',
          },
        },
        { status: 402 }
      );
    }

    await checkRateLimitCalendarDay(session.user.id, 'ai_analyze');

    const body = await request.json().catch(() => ({}));
    const { from: fromStr, to: toStr } = parseBody(body);

    const from = parseCalendarDateUTC(fromStr);
    const to = parseCalendarDateUTC(toStr);

    if (from.getTime() > to.getTime()) {
      return NextResponse.json(
        { success: false, error: { message: 'from must be on or before to' } },
        { status: 400 }
      );
    }

    const rangeDays = Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    if (rangeDays > MAX_ANALYSIS_RANGE_DAYS) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Date range must be ${MAX_ANALYSIS_RANGE_DAYS} days or less`,
          },
        },
        { status: 400 }
      );
    }

    const payload = await buildAnalysisPayload(session.user.id, from, to);

    if (!payload.hasData) {
      return NextResponse.json(NO_DATA_RESPONSE);
    }

    const prompt = buildHistoryAnalysisPrompt(payload.dataSummary, payload.dateRangeLabel);
    const { content } = await callAI(prompt, {
      responseFormat: { type: 'json_object' },
      maxTokens: 1000,
    });

    const parsed = JSON.parse(content) as unknown;
    const result = validateAnalysisResponse(parsed);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        lastAnalysisAt: new Date(),
        lastAnalysisFrom: fromStr,
        lastAnalysisTo: toStr,
        lastAnalysisResult: result as object,
      },
    });

    return NextResponse.json({
      success: true,
      data: result,
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
    logger.error('POST /api/ai/analyze failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { route: 'api/ai/analyze' },
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
