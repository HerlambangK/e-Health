import { promises as fs } from "fs";
import { join } from "path";

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  updatedAt: string;
};

const DATA_DIR = join(process.cwd(), "server", "data");
const TEMPLATE_PATH = join(DATA_DIR, "email-templates.json");

const defaultTemplates: EmailTemplate[] = [
  {
    id: "invitation-default",
    name: "Undangan Tes Online",
    subject: "Undangan Tes Online - [lowongan]",
    body:
      "Halo [nama-kandidat],\n\nKami mengundang Anda untuk mengikuti tes online untuk posisi [lowongan].\n\nTerima kasih.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "invitation-gelombang3",
    name: "Undangan Tes Online Gelombang 3",
    subject: "Undangan Tes Online Gelombang 3",
    body:
      "Yth. Peserta Seleksi,\n\nSelamat sore.\n\nTerima kasih atas partisipasi Anda dalam rangkaian proses rekrutmen di PT Sejahtera Sehat Karyautama.\n\nMelalui email ini, kami mengundang Anda untuk mengikuti Tes Online Gelombang 3 yang masih membuka kesempatan bagi peserta yang belum mengikuti tes sebelumnya, dengan detail sebagai berikut:\n\nHari/Tanggal : Minggu, 22 Februari 2026\nWaktu        : 09.00 – 12.00 WIB\nMedia        : Zoom Meeting\n\nTautan Zoom akan dikirimkan setelah peserta melakukan konfirmasi kehadiran.\n\nSehubungan dengan hal tersebut, peserta WAJIB melakukan konfirmasi kehadiran dan kesediaan mengikuti tes melalui WhatsApp ke:\n\nRecruitment Sejahtera Sehat Karyautama\n+62 811-9989-6331\n\nDengan format konfirmasi sebagai berikut:\n[nama-kandidat] - Gelombang 3 / 09.00 WIB\n\nKonfirmasi kehadiran paling lambat Jumat, 20 Februari 2026 pukul 12.00 WIB.\n\nPeserta diwajibkan sudah standby di ruang Zoom paling lambat 30 menit sebelum tes dimulai untuk keperluan registrasi dan pengecekan teknis.\n\nPerlu kami informasikan bahwa pelaksanaan ini merupakan kesempatan terakhir. Peserta yang tidak melakukan konfirmasi atau tidak hadir sesuai jadwal yang telah ditentukan akan dianggap mengundurkan diri dari proses seleksi.\n\nMohon memastikan perangkat, koneksi internet, kamera, dan audio dalam kondisi baik sebelum pelaksanaan tes.\n\nDemikian kami sampaikan. Atas perhatian dan kerja sama Anda, kami ucapkan terima kasih.\n\nHormat kami,\n\nTim Rekrutmen\nPT Sejahtera Sehat Karyautama",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "account-default",
    name: "Akun Tes Online",
    subject: "Akun Tes Online - [lowongan]",
    body:
      "Halo [nama-kandidat],\n\nBerikut akun tes online untuk posisi [lowongan]:\nUsername: [username]\nPassword: [password]\n\nTerima kasih.",
    updatedAt: new Date().toISOString(),
  },
];

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function loadTemplates(): Promise<EmailTemplate[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(TEMPLATE_PATH, "utf-8");
    const parsed = JSON.parse(data) as EmailTemplate[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      await saveTemplates(defaultTemplates);
      return defaultTemplates;
    }
    const existingIds = new Set(parsed.map((item) => item.id));
    const merged = [...parsed];
    for (const tpl of defaultTemplates) {
      if (!existingIds.has(tpl.id)) {
        merged.push(tpl);
      }
    }
    let updated = merged;
    const gelombangIndex = updated.findIndex((item) => item.id === "invitation-gelombang3");
    if (gelombangIndex >= 0) {
      const current = updated[gelombangIndex];
      const fixedBody = current.body.replace(
        "[nama-kandidat] - [Gelombang 3 / 09.00 WIB]",
        "[nama-kandidat] - Gelombang 3 / 09.00 WIB"
      );
      if (fixedBody !== current.body) {
        updated = [...updated];
        updated[gelombangIndex] = { ...current, body: fixedBody };
      }
    }

    if (updated.length !== parsed.length || updated !== merged) {
      await saveTemplates(updated);
    }
    return updated;
  } catch {
    await saveTemplates(defaultTemplates);
    return defaultTemplates;
  }
}

export async function saveTemplates(templates: EmailTemplate[]) {
  await ensureDataDir();
  await fs.writeFile(TEMPLATE_PATH, JSON.stringify(templates, null, 2));
}

export async function findTemplate(id: string) {
  const templates = await loadTemplates();
  return templates.find((item) => item.id === id);
}

export async function upsertTemplate(template: EmailTemplate) {
  const templates = await loadTemplates();
  const index = templates.findIndex((item) => item.id === template.id);
  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.push(template);
  }
  await saveTemplates(templates);
  return templates;
}

export async function deleteTemplate(id: string) {
  const templates = await loadTemplates();
  const filtered = templates.filter((item) => item.id !== id);
  await saveTemplates(filtered);
  return filtered;
}
