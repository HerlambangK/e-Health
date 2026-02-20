type MailTemplate = {
  subject: string;
  html: string;
  text: string;
};

type TemplatePayload = {
  nama: string;
  lowongan: string;
  username?: string;
  password?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getSmtpConfig() {
  const config = useRuntimeConfig();
  return config.smtp as {
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    pass?: string;
    from?: string;
  };
}

let cachedNodemailer: any;

async function loadNodemailer() {
  if (cachedNodemailer) return cachedNodemailer;
  try {
    cachedNodemailer = await import("nodemailer");
    return cachedNodemailer;
  } catch (error) {
    throw new Error("Module nodemailer belum terpasang. Jalankan `npm install`.");
  }
}

export async function createTransporter() {
  const smtp = getSmtpConfig();

  if (!smtp?.host || !smtp?.user || !smtp?.pass) {
    throw new Error("SMTP config incomplete. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env");
  }

  const nodemailer = await loadNodemailer();

  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port ?? 587,
    secure: smtp.secure ?? false,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });
}

export function getSenderAddress() {
  const smtp = getSmtpConfig();
  return smtp?.from || smtp?.user || "no-reply@example.com";
}

export function renderEmailTemplate(
  template: "invitation" | "account",
  payload: TemplatePayload,
  subjectOverride?: string
): MailTemplate {
  const nama = escapeHtml(payload.nama || "Kandidat");
  const lowongan = escapeHtml(payload.lowongan || "Posisi");
  const username = escapeHtml(payload.username || "");
  const password = escapeHtml(payload.password || "");

  if (template === "account") {
    const subject = subjectOverride || `Akun Tes Online - ${lowongan}`;
    const html = `
      <p>Halo ${nama},</p>
      <p>Berikut adalah detail akun tes online untuk posisi <strong>${lowongan}</strong>:</p>
      <ul>
        <li><strong>Username:</strong> ${username}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Silakan gunakan akun di atas untuk mengikuti tes.</p>
      <p>Terima kasih.</p>
    `;
    const text = `Halo ${payload.nama},\n\nBerikut detail akun tes online untuk posisi ${payload.lowongan}:\nUsername: ${payload.username}\nPassword: ${payload.password}\n\nSilakan gunakan akun di atas untuk mengikuti tes.\nTerima kasih.`;
    return { subject, html, text };
  }

  const subject = subjectOverride || `Undangan Tes Online - ${lowongan}`;
  const html = `
    <p>Halo ${nama},</p>
    <p>Kami mengundang Anda untuk mengikuti tes online untuk posisi <strong>${lowongan}</strong>.</p>
    <p>Silakan ikuti instruksi yang akan dikirimkan selanjutnya.</p>
    <p>Terima kasih.</p>
  `;
  const text = `Halo ${payload.nama},\n\nKami mengundang Anda untuk mengikuti tes online untuk posisi ${payload.lowongan}.\nSilakan ikuti instruksi selanjutnya.\n\nTerima kasih.`;
  return { subject, html, text };
}
