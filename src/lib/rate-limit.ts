import { prisma } from './prisma';
import { logger } from './logger';
import { RateLimitError } from './errors';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  ai_on_open_message: {
    windowMs: 60 * 1000,
    maxRequests: 5,
  },
  ai_analyze: {
    windowMs: 60 * 1000,
    maxRequests: 5,
  },
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(
  userId: string,
  key: keyof typeof RATE_LIMITS
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[key];
  const windowStart = new Date(Date.now() - config.windowMs);

  try {
    const count = await prisma.aiRateLimit.count({
      where: {
        userId,
        rateLimitKey: key,
        createdAt: {
          gt: windowStart,
        },
      },
    });

    const remaining = Math.max(0, config.maxRequests - count);
    const resetAt = new Date(Date.now() + config.windowMs);

    if (count >= config.maxRequests) {
      throw new RateLimitError('Rate limit exceeded', resetAt);
    }

    await prisma.aiRateLimit.create({
      data: {
        userId,
        rateLimitKey: key,
      },
    });

    return {
      allowed: true,
      remaining: remaining - 1,
      resetAt,
    };
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error;
    }
    logger.error('Rate limit check failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: { userId, rateLimitKey: key },
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: new Date(Date.now() + config.windowMs),
    };
  }
}
