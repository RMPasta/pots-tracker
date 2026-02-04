import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { canUseAIInsights } from '@/lib/subscription';
import { prisma } from '@/lib/prisma';
import { todayStartUTC } from '@/lib/dates';

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized' } },
      { status: 401 }
    );
  }

  if (!canUseAIInsights(session)) {
    return NextResponse.json({ success: true, data: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      lastAnalysisAt: true,
      lastAnalysisFrom: true,
      lastAnalysisTo: true,
      lastAnalysisResult: true,
    },
  });

  if (
    !user?.lastAnalysisAt ||
    !user.lastAnalysisFrom ||
    !user.lastAnalysisTo ||
    user.lastAnalysisResult == null
  ) {
    return NextResponse.json({ success: true, data: null });
  }

  const startOfTodayUtc = todayStartUTC();
  const startOfTomorrowUtc = new Date(startOfTodayUtc);
  startOfTomorrowUtc.setUTCDate(startOfTomorrowUtc.getUTCDate() + 1);

  const at = user.lastAnalysisAt.getTime();
  if (at < startOfTodayUtc.getTime() || at >= startOfTomorrowUtc.getTime()) {
    return NextResponse.json({ success: true, data: null });
  }

  const data = user.lastAnalysisResult as {
    summary?: string;
    trends?: string[];
    insights?: string[];
    suggestions?: string[];
    weeklyHighlight?: string;
  };

  return NextResponse.json({
    success: true,
    data: {
      summary: typeof data?.summary === 'string' ? data.summary : '',
      trends: Array.isArray(data?.trends) ? data.trends : [],
      insights: Array.isArray(data?.insights) ? data.insights : [],
      suggestions: Array.isArray(data?.suggestions) ? data.suggestions : [],
      weeklyHighlight: typeof data?.weeklyHighlight === 'string' ? data.weeklyHighlight : undefined,
    },
    from: user.lastAnalysisFrom,
    to: user.lastAnalysisTo,
  });
}
