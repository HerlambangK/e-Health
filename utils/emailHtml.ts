export type EmailPalette = {
  id: string;
  label: string;
  swatch: string;
  colors: Record<string, string>;
};

export const EMAIL_PALETTES: EmailPalette[] = [
  {
    id: "hijau",
    label: "Hijau",
    swatch: "#0d9488",
    colors: {
      primary: "#0d9488",
      primaryDark: "#0f766e",
      accent: "#14b8a6",
      bgSoft: "#f0fdfa",
      border: "#ccfbf1",
      textMuted: "#64748b",
      buttonText: "#ffffff",
      headerBg: "#0f766e",
      footerBg: "#f8fafc",
    },
  },
  {
    id: "biru",
    label: "Biru",
    swatch: "#2563eb",
    colors: {
      primary: "#2563eb",
      primaryDark: "#1d4ed8",
      accent: "#3b82f6",
      bgSoft: "#eff6ff",
      border: "#dbeafe",
      textMuted: "#64748b",
      buttonText: "#ffffff",
      headerBg: "#1d4ed8",
      footerBg: "#f8fafc",
    },
  },
  {
    id: "ungu",
    label: "Ungu",
    swatch: "#7c3aed",
    colors: {
      primary: "#7c3aed",
      primaryDark: "#6d28d9",
      accent: "#8b5cf6",
      bgSoft: "#f5f3ff",
      border: "#ede9fe",
      textMuted: "#64748b",
      buttonText: "#ffffff",
      headerBg: "#6d28d9",
      footerBg: "#f8fafc",
    },
  },
  {
    id: "merah",
    label: "Merah",
    swatch: "#e11d48",
    colors: {
      primary: "#e11d48",
      primaryDark: "#be123c",
      accent: "#f43f5e",
      bgSoft: "#fff1f2",
      border: "#ffe4e6",
      textMuted: "#64748b",
      buttonText: "#ffffff",
      headerBg: "#be123c",
      footerBg: "#f8fafc",
    },
  },
  {
    id: "navy",
    label: "Navy",
    swatch: "#1e293b",
    colors: {
      primary: "#1e293b",
      primaryDark: "#0f172a",
      accent: "#334155",
      bgSoft: "#f1f5f9",
      border: "#e2e8f0",
      textMuted: "#64748b",
      buttonText: "#ffffff",
      headerBg: "#0f172a",
      footerBg: "#f8fafc",
    },
  },
];

export function getPalette(id?: string): EmailPalette {
  return EMAIL_PALETTES.find((p) => p.id === id) || EMAIL_PALETTES[0];
}

export function escapeHtml(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function isHtmlBody(body: string): boolean {
  if (!body) return false;
  const trimmed = body.trim();
  if (/^<!doctype\s+html/i.test(trimmed) || /^<html/i.test(trimmed)) return true;
  const hasOpen = /<\/?[a-z][a-z0-9-]*(\s[^>]*)?>/i.test(trimmed);
  const hasClose = /<\/[a-z][a-z0-9-]*\s*>/i.test(trimmed);
  return hasOpen && hasClose;
}

export function applyPalette(body: string, paletteId?: string): string {
  const colors = getPalette(paletteId).colors;
  let output = body || "";
  for (const [key, val] of Object.entries(colors)) {
    output = output.replaceAll(`{${key}}`, val);
  }
  return output;
}

export function stripHtml(html: string): string {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
}

export function applyPlaceholders(
  value: string,
  payload: Record<string, string>,
  escape = false
): string {
  let output = value || "";
  for (const [key, val] of Object.entries(payload || {})) {
    const safe = escape ? escapeHtml(val ?? "") : val ?? "";
    output = output.replaceAll(`[${key}]`, safe);
  }
  return output;
}

export function buildMailParts(
  templateBody: string,
  payload: Record<string, string>,
  paletteId?: string
): { html: string; text: string } {
  if (isHtmlBody(templateBody)) {
    const html = applyPalette(applyPlaceholders(templateBody, payload, true), paletteId);
    return { html, text: stripHtml(html) };
  }
  const text = applyPlaceholders(templateBody, payload, false);
  return { html: escapeHtml(text).replace(/\n/g, "<br />"), text };
}
