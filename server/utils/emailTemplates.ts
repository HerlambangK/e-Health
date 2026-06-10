import { promises as fs } from "fs";
import { join } from "path";
import EmailTemplateModel from "~/server/models/EmailTemplate";

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
];

function toEmailTemplate(doc: any): EmailTemplate {
  return {
    id: doc.templateId,
    name: doc.name,
    subject: doc.subject,
    body: doc.body,
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
