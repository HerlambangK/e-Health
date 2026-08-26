import type { H3Event } from 'h3';
import { getHeader } from 'h3';
import IdempotencyKey from '../models/IdempotencyKey';

export function getIdempotencyKey(event: H3Event): string | undefined {
  return getHeader(event, 'X-Idempotency-Key');
}

export async function findCachedResponse(key: string, userId: string) {
  return await IdempotencyKey.findOne({ key, userId }).exec();
}

export async function cacheResponse(
  key: string,
  userId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  body: any
) {
  try {
    const newKey = new IdempotencyKey({
      key,
      userId,
      endpoint,
      method,
      statusCode,
      responseBody: body,
    });
    await newKey.save();
  } catch (error) {
    console.error('Failed to cache idempotency key:', error);
  }
}
