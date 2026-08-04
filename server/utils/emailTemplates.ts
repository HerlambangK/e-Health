import { promises as fs } from "fs";
import { join } from "path";
import EmailTemplateModel from "~/server/models/EmailTemplate";

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  fields?: Record<string, string>;
  updatedAt: string;
};

const DATA_DIR = join(process.cwd(), "server", "data");
const TEMPLATE_PATH = join(DATA_DIR, "email-templates.json");

const defaultTemplates: EmailTemplate[] = [
  {
    id: "invitation-default",
    name: "Undangan Tes Online",
    subject: "Undangan Tes Online - [lowongan]",
    body: "Halo [nama-kandidat],\n\nKami mengundang Anda untuk mengikuti tes online untuk posisi [lowongan].\n\nTerima kasih.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "invitation-gelombang3",
    name: "Undangan Tes Online Gelombang 3",
    subject: "Undangan Tes Online Gelombang 3",
    body: "Yth. Peserta Seleksi,\n\nSelamat sore.\n\nTerima kasih atas partisipasi Anda dalam rangkaian proses rekrutmen di PT Sejahtera Sehat Karyautama.\n\nMelalui email ini, kami mengundang Anda untuk mengikuti Tes Online Gelombang 3 yang masih membuka kesempatan bagi peserta yang belum mengikuti tes sebelumnya, dengan detail sebagai berikut:\n\nHari/Tanggal : Minggu, 22 Februari 2026\nWaktu        : 09:00 – 12.00 WIB\nMedia        : Zoom Meeting\n\nTautan Zoom akan dikirimkan setelah peserta melakukan konfirmasi kehadiran.\n\nSehubungan dengan hal tersebut, peserta WAJIB melakukan konfirmasi kehadiran dan kesediaan mengikuti tes melalui WhatsApp ke:\n\nRecruitment Sejahtera Sehat Karyautama\n+62 811-9989-6331\n\nDengan format konfirmasi sebagai berikut:\n[nama-kandidat] - Gelombang 3 / 09.00 WIB\n\nKonfirmasi kehadiran paling lambat Jumat, 20 Februari 2026 pukul 12.00 WIB.\n\nPeserta diwajibkan sudah standby di ruang Zoom paling lambat 30 menit sebelum tes dimulai untuk keperluan registrasi dan pengecekan teknis.\n\nPerlu kami informasikan bahwa pelaksanaan ini merupakan kesempatan terakhir. Peserta yang tidak melakukan konfirmasi atau tidak hadir sesuai jadwal yang telah ditentukan akan dianggap mengundurkan diri dari proses seleksi.\n\nMohon memastikan perangkat, koneksi internet, kamera, dan audio dalam kondisi baik sebelum pelaksanaan tes.\n\nDemikian kami sampaikan. Atas perhatian dan kerja sama Anda, kami ucapkan terima kasih.\n\nHormat kami,\n\nTim Rekrutmen\nPT Sejahtera Sehat Karyautama",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "account-default",
    name: "Akun Tes Online",
    subject: "Akun Tes Online - [lowongan]",
    body: "Halo [nama-kandidat],\n\nBerikut akun tes online untuk posisi [lowongan]:\nUsername: [username]\nPassword: [password]\n\nTerima kasih.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "konfirmasi-resume",
    name: "Konfirmasi & Perbarui Resume",
    subject: "Konfirmasi Lamaran [lowongan] - PT SSK",
    body: "Halo, [nama-kandidat]\n\nKami dari PT Sejahtera Sehat Karyautama (PT SSK)\n\nTerima kasih atas lamaran Anda pada lowongan [lowongan] di [tanggal-melamar].\n\nKami memerlukan konfirmasi Anda apakah masih bersedia untuk melanjutkan proses rekrutmen.\n\nApabila bersedia, mohon untuk mengkonfirmasi dan memperbarui resume Anda pada link berikut:\n\n[link-konfirmasi]\n\nTerima kasih.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-html-undangan-tes",
    name: "Undangan Tes Online (HTML)",
    subject: "Undangan Tes Online - [lowongan]",
    body: `<div style="background-color:#f1f5f9; padding:28px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px; margin:0 auto; font-family:Arial, Helvetica, sans-serif; background-color:#ffffff; border-radius:14px; overflow:hidden;">
    <tr>
      <td style="background-color:{headerBg}; padding:30px 32px; text-align:center;">
        <div style="font-size:11px; letter-spacing:3px; color:rgba(255,255,255,0.8);">PT SEJAHTERA SEHAT KARYAUTAMA</div>
        <div style="font-size:22px; font-weight:bold; color:#ffffff; margin-top:6px;">Undangan Tes Online</div>
        <div style="width:48px; height:3px; background-color:{accent}; margin:12px auto 0;"></div>
      </td>
    </tr>
    <tr>
      <td style="padding:34px 34px;">
        <div style="font-size:13px; color:{textMuted};">Kepada Yth.</div>
        <div style="font-size:18px; font-weight:bold; color:#1e293b; margin-top:2px;">[nama-kandidat]</div>
        <p style="font-size:14px; line-height:1.8; color:#334155; margin:18px 0 0;">Terima kasih atas partisipasi Anda dalam proses rekrutmen <strong>PT Sejahtera Sehat Karyautama</strong> untuk posisi <strong>[lowongan]</strong>.</p>
        <p style="font-size:14px; line-height:1.8; color:#334155; margin:14px 0 0;">Melalui email ini, kami mengundang Anda untuk mengikuti <strong>Tes Online</strong> dengan detail berikut:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px; background-color:{bgSoft}; border:1px solid {border}; border-radius:10px;">
          <tr>
            <td style="padding:14px 18px; border-bottom:1px solid {border};">
              <div style="font-size:11px; color:{textMuted};">HARI / TANGGAL</div>
              <div style="font-size:14px; font-weight:bold; color:#1e293b; margin-top:2px;">[tanggal-tes]</div>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 18px; border-bottom:1px solid {border};">
              <div style="font-size:11px; color:{textMuted};">WAKTU</div>
              <div style="font-size:14px; font-weight:bold; color:#1e293b; margin-top:2px;">[waktu-tes]</div>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 18px;">
              <div style="font-size:11px; color:{textMuted};">MEDIA</div>
              <div style="font-size:14px; font-weight:bold; color:#1e293b; margin-top:2px;">[media-tes]</div>
            </td>
          </tr>
        </table>
        <div style="text-align:center; margin-top:30px;">
          <a href="[link-konfirmasi]" style="display:inline-block; background-color:{primary}; color:{buttonText}; padding:13px 34px; border-radius:8px; font-size:14px; font-weight:bold; text-decoration:none;">Konfirmasi Kehadiran</a>
        </div>
        <p style="font-size:13px; line-height:1.7; color:{textMuted}; margin:24px 0 0;">Mohon lakukan konfirmasi kehadiran sebelum batas waktu yang ditentukan. Tautan Zoom dan akun ujian akan kami kirimkan setelah Anda mengonfirmasi.</p>
      </td>
    </tr>
    <tr>
      <td style="background-color:{footerBg}; border-top:1px solid {border}; padding:22px 34px; text-align:center;">
        <div style="font-size:12px; color:{textMuted};">Hormat kami,</div>
        <div style="font-size:13px; font-weight:bold; color:#334155; margin-top:2px;">Tim Rekrutmen PT Sejahtera Sehat Karyautama</div>
        <div style="font-size:12px; color:{textMuted}; margin-top:6px;">+62 811-9989-6331 &nbsp;&bull;&nbsp; recruitment@sejahterasehatkaryautama.co.id</div>
      </td>
    </tr>
  </table>
</div>`,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-html-undangan-zoom",
    name: "Undangan Zoom Ujian (HTML)",
    subject: "Tautan Zoom Ujian Seleksi - [lowongan]",
    body: `<div style="background-color:#f1f5f9; padding:28px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px; margin:0 auto; font-family:Arial, Helvetica, sans-serif; background-color:#ffffff; border-radius:14px; overflow:hidden;">
    <tr>
      <td style="background-color:{headerBg}; padding:30px 32px; text-align:center;">
        <div style="font-size:11px; letter-spacing:3px; color:rgba(255,255,255,0.8);">PT SEJAHTERA SEHAT KARYAUTAMA</div>
        <div style="font-size:22px; font-weight:bold; color:#ffffff; margin-top:6px;">Tautan Zoom Ujian Seleksi</div>
        <div style="width:48px; height:3px; background-color:{accent}; margin:12px auto 0;"></div>
      </td>
    </tr>
    <tr>
      <td style="padding:34px 34px;">
        <div style="font-size:13px; color:{textMuted};">Yth. Peserta Seleksi,</div>
        <div style="font-size:18px; font-weight:bold; color:#1e293b; margin-top:2px;">[nama-kandidat]</div>
        <p style="font-size:14px; line-height:1.8; color:#334155; margin:18px 0 0;">Selamat sore. Terima kasih atas konfirmasi Anda untuk mengikuti ujian seleksi calon pegawai di <strong>PT Sejahtera Sehat Karyautama</strong> untuk posisi <strong>[lowongan]</strong>.</p>
        <p style="font-size:14px; line-height:1.8; color:#334155; margin:14px 0 0;">Berikut detail akses rapat Zoom:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px; background-color:{bgSoft}; border:1px solid {border}; border-radius:10px;">
          <tr>
            <td style="padding:14px 18px; border-bottom:1px solid {border};">
              <div style="font-size:11px; color:{textMuted};">WAKTU</div>
              <div style="font-size:14px; font-weight:bold; color:#1e293b; margin-top:2px;">[waktu-tes]</div>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 18px; border-bottom:1px solid {border};">
              <div style="font-size:11px; color:{textMuted};">ID RAPAT</div>
              <div style="font-size:14px; font-weight:bold; color:#1e293b; margin-top:2px;">[id-zoom]</div>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 18px; border-bottom:1px solid {border};">
              <div style="font-size:11px; color:{textMuted};">KODE SANDI</div>
              <div style="font-size:14px; font-weight:bold; color:#1e293b; margin-top:2px;">[password-zoom]</div>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 18px;">
              <div style="font-size:11px; color:{textMuted};">TAUTAN ZOOM</div>
              <div style="font-size:13px; font-weight:bold; color:{primary}; margin-top:2px; word-break:break-all;">[link-zoom]</div>
            </td>
          </tr>
        </table>
        <div style="text-align:center; margin-top:30px;">
          <a href="[link-zoom]" style="display:inline-block; background-color:{primary}; color:{buttonText}; padding:13px 34px; border-radius:8px; font-size:14px; font-weight:bold; text-decoration:none;">Masuk Zoom Meeting</a>
        </div>
        <p style="font-size:13px; line-height:1.7; color:{textMuted}; margin:24px 0 0;">Mohon bergabung tepat waktu serta pastikan perangkat, koneksi internet, kamera, dan audio dalam kondisi baik sebelum ujian dimulai.</p>
      </td>
    </tr>
    <tr>
      <td style="background-color:{footerBg}; border-top:1px solid {border}; padding:22px 34px; text-align:center;">
        <div style="font-size:12px; color:{textMuted};">Hormat kami,</div>
        <div style="font-size:13px; font-weight:bold; color:#334155; margin-top:2px;">Tim Rekrutmen PT Sejahtera Sehat Karyautama</div>
        <div style="font-size:12px; color:{textMuted}; margin-top:6px;">+62 811-9989-6331 &nbsp;&bull;&nbsp; recruitment@sejahterasehatkaryautama.co.id</div>
      </td>
    </tr>
  </table>
</div>`,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-html-akun-tes",
    name: "Informasi Akun Tes (HTML)",
    subject: "Akun Tes Online - [lowongan]",
    body: `<div style="background-color:#f1f5f9; padding:28px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px; margin:0 auto; font-family:Arial, Helvetica, sans-serif; background-color:#ffffff; border-radius:14px; overflow:hidden;">
    <tr>
      <td style="background-color:{headerBg}; padding:30px 32px; text-align:center;">
        <div style="font-size:11px; letter-spacing:3px; color:rgba(255,255,255,0.8);">PT SEJAHTERA SEHAT KARYAUTAMA</div>
        <div style="font-size:22px; font-weight:bold; color:#ffffff; margin-top:6px;">Informasi Akun Tes Online</div>
        <div style="width:48px; height:3px; background-color:{accent}; margin:12px auto 0;"></div>
      </td>
    </tr>
    <tr>
      <td style="padding:34px 34px;">
        <div style="font-size:13px; color:{textMuted};">Yth. Peserta Seleksi,</div>
        <div style="font-size:18px; font-weight:bold; color:#1e293b; margin-top:2px;">[nama-kandidat]</div>
        <p style="font-size:14px; line-height:1.8; color:#334155; margin:18px 0 0;">Berikut adalah detail akun tes online Anda untuk posisi <strong>[lowongan]</strong>. Gunakan akun ini untuk masuk ke platform ujian:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px; background-color:{bgSoft}; border:1px solid {border}; border-radius:10px;">
          <tr>
            <td style="padding:18px 20px; border-bottom:1px solid {border};">
              <div style="font-size:11px; color:{textMuted};">USERNAME</div>
              <div style="font-size:16px; font-weight:bold; color:#1e293b; margin-top:2px;">[username]</div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 20px;">
              <div style="font-size:11px; color:{textMuted};">PASSWORD</div>
              <div style="font-size:16px; font-weight:bold; color:{primary}; margin-top:2px;">[password]</div>
            </td>
          </tr>
        </table>
        <div style="text-align:center; margin-top:30px;">
          <a href="https://app.sejahterasehatkaryautama.co.id/" style="display:inline-block; background-color:{primary}; color:{buttonText}; padding:13px 34px; border-radius:8px; font-size:14px; font-weight:bold; text-decoration:none;">Masuk Platform Ujian</a>
        </div>
        <p style="font-size:13px; line-height:1.7; color:{textMuted}; margin:24px 0 0;">Mohon coba login dengan akun di atas untuk memastikan akun aktif, lalu lengkapi biodata pelamar sebelum batas waktu yang ditentukan.</p>
      </td>
    </tr>
    <tr>
      <td style="background-color:{footerBg}; border-top:1px solid {border}; padding:22px 34px; text-align:center;">
        <div style="font-size:12px; color:{textMuted};">Hormat kami,</div>
        <div style="font-size:13px; font-weight:bold; color:#334155; margin-top:2px;">Tim Rekrutmen PT Sejahtera Sehat Karyautama</div>
        <div style="font-size:12px; color:{textMuted}; margin-top:6px;">+62 811-9989-6331 &nbsp;&bull;&nbsp; recruitment@sejahterasehatkaryautama.co.id</div>
      </td>
    </tr>
  </table>
</div>`,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-html-konfirmasi-resume",
    name: "Konfirmasi & Perbarui Resume (HTML)",
    subject: "Konfirmasi Lamaran [lowongan] - PT SSK",
    body: `<div style="background-color:#f1f5f9; padding:28px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px; margin:0 auto; font-family:Arial, Helvetica, sans-serif; background-color:#ffffff; border-radius:14px; overflow:hidden;">
    <tr>
      <td style="background-color:{headerBg}; padding:30px 32px; text-align:center;">
        <div style="font-size:11px; letter-spacing:3px; color:rgba(255,255,255,0.8);">PT SEJAHTERA SEHAT KARYAUTAMA</div>
        <div style="font-size:22px; font-weight:bold; color:#ffffff; margin-top:6px;">Konfirmasi & Perbarui Resume</div>
        <div style="width:48px; height:3px; background-color:{accent}; margin:12px auto 0;"></div>
      </td>
    </tr>
    <tr>
      <td style="padding:34px 34px;">
        <div style="font-size:13px; color:{textMuted};">Yth.</div>
        <div style="font-size:18px; font-weight:bold; color:#1e293b; margin-top:2px;">[nama-kandidat]</div>
        <p style="font-size:14px; line-height:1.8; color:#334155; margin:18px 0 0;">Terima kasih atas lamaran Anda pada posisi <strong>[lowongan]</strong> di <strong>PT Sejahtera Sehat Karyautama</strong>.</p>
        <p style="font-size:14px; line-height:1.8; color:#334155; margin:14px 0 0;">Kami memerlukan konfirmasi Anda apakah masih bersedia untuk melanjutkan proses rekrutmen. Apabila bersedia, mohon untuk mengonfirmasi dan memperbarui resume Anda melalui tombol berikut:</p>
        <div style="text-align:center; margin-top:30px;">
          <a href="[link-konfirmasi]" style="display:inline-block; background-color:{primary}; color:{buttonText}; padding:13px 34px; border-radius:8px; font-size:14px; font-weight:bold; text-decoration:none;">Konfirmasi & Perbarui Resume</a>
        </div>
        <p style="font-size:13px; line-height:1.7; color:{textMuted}; margin:24px 0 0;">Apabila menemui kendala, silakan hubungi tim rekrutmen kami melalui WhatsApp <strong>+62 811-9989-6331</strong>.</p>
      </td>
    </tr>
    <tr>
      <td style="background-color:{footerBg}; border-top:1px solid {border}; padding:22px 34px; text-align:center;">
        <div style="font-size:12px; color:{textMuted};">Hormat kami,</div>
        <div style="font-size:13px; font-weight:bold; color:#334155; margin-top:2px;">Tim Rekrutmen PT Sejahtera Sehat Karyautama</div>
        <div style="font-size:12px; color:{textMuted}; margin-top:6px;">+62 811-9989-6331 &nbsp;&bull;&nbsp; recruitment@sejahterasehatkaryautama.co.id</div>
      </td>
    </tr>
  </table>
</div>`,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-html-pengumuman",
    name: "Pengumuman Umum (HTML)",
    subject: "Pengumuman Penting - [lowongan]",
    body: `<div style="background-color:#f1f5f9; padding:28px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px; margin:0 auto; font-family:Arial, Helvetica, sans-serif; background-color:#ffffff; border-radius:14px; overflow:hidden;">
    <tr>
      <td style="background-color:{headerBg}; padding:30px 32px; text-align:center;">
        <div style="font-size:11px; letter-spacing:3px; color:rgba(255,255,255,0.8);">PT SEJAHTERA SEHAT KARYAUTAMA</div>
        <div style="font-size:22px; font-weight:bold; color:#ffffff; margin-top:6px;">Pengumuman Resmi</div>
        <div style="width:48px; height:3px; background-color:{accent}; margin:12px auto 0;"></div>
      </td>
    </tr>
    <tr>
      <td style="padding:34px 34px;">
        <div style="font-size:13px; color:{textMuted};">Yth.</div>
        <div style="font-size:18px; font-weight:bold; color:#1e293b; margin-top:2px;">[nama-kandidat]</div>
        <p style="font-size:14px; line-height:1.8; color:#334155; margin:18px 0 0;">Kami sampaikan informasi terbaru sehubungan dengan proses rekrutmen Anda di <strong>PT Sejahtera Sehat Karyautama</strong> untuk posisi <strong>[lowongan]</strong>.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px; background-color:{bgSoft}; border:1px solid {border}; border-radius:10px;">
          <tr>
            <td style="padding:20px 22px; font-size:14px; line-height:1.8; color:#334155;">[isi-pengumuman]</td>
          </tr>
        </table>
        <div style="text-align:center; margin-top:30px;">
          <a href="[link-konfirmasi]" style="display:inline-block; background-color:{primary}; color:{buttonText}; padding:13px 34px; border-radius:8px; font-size:14px; font-weight:bold; text-decoration:none;">Lihat Detail</a>
        </div>
        <p style="font-size:13px; line-height:1.7; color:{textMuted}; margin:24px 0 0;">Demikian kami sampaikan. Atas perhatian dan kerja sama Anda, kami ucapkan terima kasih.</p>
      </td>
    </tr>
    <tr>
      <td style="background-color:{footerBg}; border-top:1px solid {border}; padding:22px 34px; text-align:center;">
        <div style="font-size:12px; color:{textMuted};">Hormat kami,</div>
        <div style="font-size:13px; font-weight:bold; color:#334155; margin-top:2px;">Tim Rekrutmen PT Sejahtera Sehat Karyautama</div>
        <div style="font-size:12px; color:{textMuted}; margin-top:6px;">+62 811-9989-6331 &nbsp;&bull;&nbsp; recruitment@sejahterasehatkaryautama.co.id</div>
      </td>
    </tr>
  </table>
</div>`,
    updatedAt: new Date().toISOString(),
  },
];

function toEmailTemplate(doc: any): EmailTemplate {
  return {
    id: doc.templateId,
    name: doc.name,
    subject: doc.subject,
    body: doc.body,
    fields: doc.fields || {},
    updatedAt: doc.updatedAt?.toISOString?.() || new Date().toISOString(),
  };
}

function getBodyFixed(body: string) {
  return body.replace(
    "[nama-kandidat] - [Gelombang 3 / 09.00 WIB]",
    "[nama-kandidat] - Gelombang 3 / 09.00 WIB"
  );
}

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function readLocalTemplates(): Promise<EmailTemplate[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(TEMPLATE_PATH, "utf-8");
    const parsed = JSON.parse(data) as EmailTemplate[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return defaultTemplates;
    }
    return parsed.map((tpl) => ({
      ...tpl,
      body: tpl.id === "invitation-gelombang3" ? getBodyFixed(tpl.body) : tpl.body,
    }));
  } catch {
    return defaultTemplates;
  }
}

async function syncToLocal(templates: EmailTemplate[]) {
  try {
    await ensureDataDir();
    await fs.writeFile(TEMPLATE_PATH, JSON.stringify(templates, null, 2));
  } catch {}
}

function mergeDefaults(templates: EmailTemplate[]): EmailTemplate[] {
  const existingIds = new Set(templates.map((t) => t.id));
  const merged = [...templates];
  for (const tpl of defaultTemplates) {
    if (!existingIds.has(tpl.id)) {
      merged.push({ ...tpl, updatedAt: new Date().toISOString() });
    }
  }
  return merged;
}

export async function loadTemplates(): Promise<EmailTemplate[]> {
  try {
    let docs = await EmailTemplateModel.find().sort({ createdAt: 1 }).lean();

    if (docs.length === 0) {
      let seed: EmailTemplate[];

      try {
        const local = await readLocalTemplates();
        seed = local.length > 0 ? local : defaultTemplates;
      } catch {
        seed = defaultTemplates;
      }

      seed = mergeDefaults(seed);

      const upsertOps = seed.map((tpl) => ({
        templateId: tpl.id,
        name: tpl.name,
        subject: tpl.subject,
        body: tpl.id === "invitation-gelombang3" ? getBodyFixed(tpl.body) : tpl.body,
      }));

      await EmailTemplateModel.bulkWrite(
        upsertOps.map((doc) => ({
          updateOne: {
            filter: { templateId: doc.templateId },
            update: { $set: doc },
            upsert: true,
          },
        }))
      );

      await syncToLocal(seed);
      docs = await EmailTemplateModel.find().sort({ createdAt: 1 }).lean();
    } else {
      const current = docs.map(toEmailTemplate);
      const merged = mergeDefaults(current);
      const missing = merged.filter((m) => !current.some((c) => c.id === m.id));

      if (missing.length > 0) {
        await EmailTemplateModel.bulkWrite(
          missing.map((tpl) => ({
            updateOne: {
              filter: { templateId: tpl.id },
              update: {
                $set: {
                  templateId: tpl.id,
                  name: tpl.name,
                  subject: tpl.subject,
                  body: tpl.id === "invitation-gelombang3" ? getBodyFixed(tpl.body) : tpl.body,
                },
              },
              upsert: true,
            },
          }))
        );
        docs = await EmailTemplateModel.find().sort({ createdAt: 1 }).lean();
      }
    }

    return docs.map(toEmailTemplate);
  } catch (error) {
    console.warn("[EmailTemplates] MongoDB error, falling back to local JSON:", (error as any)?.message);
    try {
      return await readLocalTemplates();
    } catch {
      return defaultTemplates;
    }
  }
}

export async function saveTemplates(templates: EmailTemplate[]) {
  const fixed = templates.map((tpl) => ({
    ...tpl,
    body: tpl.id === "invitation-gelombang3" ? getBodyFixed(tpl.body) : tpl.body,
  }));

  await syncToLocal(fixed);

  try {
    const ids = fixed.map((t) => t.id);
    await EmailTemplateModel.deleteMany({ templateId: { $nin: ids } });

    const upsertOps = fixed.map((tpl) => ({
      templateId: tpl.id,
      name: tpl.name,
      subject: tpl.subject,
      body: tpl.body,
      fields: tpl.fields || {},
    }));

    await EmailTemplateModel.bulkWrite(
      upsertOps.map((doc) => ({
        updateOne: {
          filter: { templateId: doc.templateId },
          update: { $set: doc },
          upsert: true,
        },
      }))
    );
  } catch (error) {
    console.warn("[EmailTemplates] MongoDB error on save, templates only saved locally:", (error as any)?.message);
  }
}

export async function findTemplate(id: string): Promise<EmailTemplate | undefined> {
  try {
    const tpl = await EmailTemplateModel.findOne({ templateId: id }).lean();
    if (!tpl) return undefined;
    return toEmailTemplate(tpl);
  } catch {
    const local = await readLocalTemplates();
    return local.find((t) => t.id === id);
  }
}

export async function upsertTemplate(template: EmailTemplate): Promise<EmailTemplate[]> {
  try {
    await EmailTemplateModel.findOneAndUpdate(
      { templateId: template.id },
      {
        $set: {
          templateId: template.id,
          name: template.name,
          subject: template.subject,
          body: template.body,
          fields: template.fields || {},
        },
      },
      { upsert: true, new: true }
    );
    return await loadTemplates();
  } catch {
    const templates = await readLocalTemplates();
    const index = templates.findIndex((t) => t.id === template.id);
    if (index >= 0) {
      templates[index] = { ...template, updatedAt: new Date().toISOString() };
    } else {
      templates.push({ ...template, updatedAt: new Date().toISOString() });
    }
    await syncToLocal(templates);
    return templates;
  }
}

export async function deleteTemplate(id: string): Promise<EmailTemplate[]> {
  try {
    await EmailTemplateModel.deleteOne({ templateId: id });
    return await loadTemplates();
  } catch {
    const templates = await readLocalTemplates();
    const filtered = templates.filter((t) => t.id !== id);
    await syncToLocal(filtered);
    return filtered;
  }
}
