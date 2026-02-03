import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSubscriptionStatus } from '@/lib/subscription';

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized' } },
      { status: 401 }
    );
  }

  const status = await getSubscriptionStatus(session.user.id);
  return NextResponse.json({
    success: true,
    data: {
      active: status.active,
      status: status.status,
      currentPeriodEnd: status.currentPeriodEnd?.toISOString() ?? null,
    },
  });
}
