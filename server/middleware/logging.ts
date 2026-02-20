import { getRequestURL } from "h3";

export default defineEventHandler((event) => {
  const start = Date.now();
  const { method } = event.node.req;
  const { pathname } = getRequestURL(event);

  event.node.res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = event.node.res.statusCode;
    console.log(`[${method}] ${pathname} -> ${statusCode} (${duration}ms)`);
  });
});
