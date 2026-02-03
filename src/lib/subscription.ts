import type { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';

export type SubscriptionStatus = {
  active: boolean;
  status: string | null;
  currentPeriodEnd: Date | null;
};

export function hasActiveSubscription(session: Session | null): boolean {
  const status = session?.user?.subscriptionStatus ?? null;
  return status === 'active' || status === 'trialing';
}

export function canUseAIInsights(session: Session | null): boolean {
  return hasActiveSubscription(session);
}

export function canUsePDFExport(session: Session | null): boolean {
  return hasActiveSubscription(session);
}

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionCurrentPeriodEnd: true,
    },
  });

  if (!user) {
    return { active: false, status: null, currentPeriodEnd: null };
  }

  const status = user.subscriptionStatus ?? null;
  const active = status === 'active' || status === 'trialing';
  return {
    active,
    status,
    currentPeriodEnd: user.subscriptionCurrentPeriodEnd ?? null,
  };
}
