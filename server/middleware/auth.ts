import { getServerSession } from "#auth";
import { getRequestURL } from "h3";
import { hasPermission, normalizeRole, type Action, type Resource } from "~/utils/permissions";
import { sendError } from "~/server/utils/response";

function mapResource(pathname: string): Resource | null {
  if (pathname.startsWith("/api/pasien")) return "pasien";
  if (pathname.startsWith("/api/dokter")) return "dokter";
  if (pathname.startsWith("/api/rekamedis")) return "rekamedis";
  if (pathname.startsWith("/api/appointment")) return "appointment";
  if (pathname.startsWith("/api/billing")) return "billing";
  if (pathname.startsWith("/api/dashboard")) return "dashboard";
  if (pathname.startsWith("/api/obat")) return "obat";
  if (pathname.startsWith("/api/penyakit")) return "penyakit";
  if (pathname.startsWith("/api/routes")) return "routes";
  if (pathname.startsWith("/api/admin")) return "admin";
  return null;
}

function mapAction(method?: string): Action {
  switch ((method || "GET").toUpperCase()) {
    case "POST":
      return "create";
    case "PUT":
    case "PATCH":
      return "update";
    case "DELETE":
      return "delete";
    default:
      return "read";
  }
}

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname;

  if (!pathname.startsWith("/api")) return;
  if (pathname.startsWith("/api/auth")) return;

  const session = await getServerSession(event);
  if (!session) {
    return sendError(event, 401, "unauthorized", "Unauthorized");
  }

  const role = normalizeRole(session.user?.role);
  const isActive = session.user?.isActive !== false;

  if (!isActive) {
    return sendError(event, 403, "inactive_account", "Account is inactive");
  }

  const resource = mapResource(pathname);
  if (!resource) {
    return;
  }

  const action = mapAction(event.method);

  if (!hasPermission(role, resource, action)) {
    return sendError(event, 403, "forbidden", "You do not have access to this resource");
  }

  event.context.user = session?.user;
});
