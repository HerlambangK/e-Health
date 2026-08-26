import { getHeader, setHeader } from 'h3';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const req = event.node.req;
  const method = req.method;
  const url = req.url;

  if (!method || !['POST', 'PUT'].includes(method)) return;
  if (!url || !url.startsWith('/api/') || url.startsWith('/api/auth/')) return;

  const idempotencyKey = getHeader(event, 'X-Idempotency-Key');
  if (!idempotencyKey) return;

  const session = await getServerSession(event);
  const userId = session?.user?.id || session?.user?.email || 'anonymous';

  const cached = await findCachedResponse(idempotencyKey, userId);
  if (cached) {
    setHeader(event, 'X-Idempotency-Replayed', 'true');
    event.node.res.statusCode = cached.statusCode;
    // We send back the cached response directly
    return cached.responseBody;
  }

  const originalEnd = event.node.res.end;
  const originalWrite = event.node.res.write;

  let bodyBuffer = Buffer.alloc(0);

  event.node.res.write = function (chunk: any, encoding: any, callback: any) {
    if (chunk) {
      bodyBuffer = Buffer.concat([bodyBuffer, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)]);
    }
    return originalWrite.call(event.node.res, chunk, encoding, callback);
  } as any;

  event.node.res.end = function (chunk: any, encoding: any, callback: any) {
    if (chunk) {
      bodyBuffer = Buffer.concat([bodyBuffer, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)]);
    }

    const statusCode = event.node.res.statusCode;
    let responseBody: any = undefined;
    if (bodyBuffer.length > 0) {
      try {
        responseBody = JSON.parse(bodyBuffer.toString());
      } catch (e) {
        responseBody = bodyBuffer.toString();
      }
    }

    cacheResponse(idempotencyKey, userId, url, method, statusCode, responseBody)
      .catch((err) => console.error('Error caching idempotency response', err));

    return originalEnd.call(event.node.res, chunk, encoding, callback);
  } as any;
});
