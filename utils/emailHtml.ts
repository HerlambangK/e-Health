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
    swatch: "#3b82f6",
    colors: {
      primary: "#3b82f6",
      primaryDark: "#2563eb",
      accent: "#60a5fa",
      bgSoft: "#eff6ff",
      border: "#dbeafe",
      textMuted: "#64748b",
      buttonText: "#ffffff",
      headerBg: "#2563eb",
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
  if (isHexColor(id)) return buildPaletteFromHex(id as string);
  return EMAIL_PALETTES.find((p) => p.id === id) || EMAIL_PALETTES[0];
}

function hexToRgb(hex: string): [number, number, number] {
  let h = String(hex || "").trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return [59, 130, 246];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(rgb: [number, number, number]): string {
  return (
    "#" +
    rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")
  );
}

function mix(color: string, target: [number, number, number], t: number): string {
  const c = hexToRgb(color);
  const out = c.map((v, i) => v + (target[i] - v) * t) as [number, number, number];
  return rgbToHex(out);
}

function luminance(color: string): number {
  const [r, g, b] = hexToRgb(color);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(value || "").trim());
}

export function buildPaletteFromHex(hex: string): EmailPalette {
  const base = String(hex || "").trim();
  const primary = isHexColor(base) ? base : "#3b82f6";
  const WHITE: [number, number, number] = [255, 255, 255];
  const BLACK: [number, number, number] = [15, 23, 42];
  return {
    id: primary.toLowerCase(),
    label: "Custom",
    swatch: primary,
    colors: {
      primary,
      primaryDark: mix(primary, BLACK, 0.12),
      accent: mix(primary, WHITE, 0.15),
      bgSoft: mix(primary, WHITE, 0.92),
      border: mix(primary, WHITE, 0.78),
      textMuted: "#64748b",
      buttonText: luminance(primary) > 0.6 ? "#0f172a" : "#ffffff",
      headerBg: mix(primary, BLACK, 0.12),
      footerBg: "#f8fafc",
    },
  };
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
