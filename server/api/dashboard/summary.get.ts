import Dokter from "~/server/models/Dokter";
import Pasien from "~/server/models/Pasien";
import RekamMedis from "~/server/models/RekamMedis";
import Appointment from "~/server/models/Appointment";
import Billing from "~/server/models/Billing";
import { sendApiError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const [totalDoctors, totalPatients, totalAppointments, totalBilling, completedPatients, pendingPatients] = await Promise.all([
      Dokter.countDocuments(),
      Pasien.countDocuments(),
      Appointment.countDocuments(),
      Billing.countDocuments(),
      Pasien.countDocuments({ completedStatus: true }),
      Pasien.countDocuments({ completedStatus: false }),
    ]);

    const patientDistribution = [
      { label: "Rawat inap", value: 0 },
      { label: "ICU / Urgent", value: 0 },
      { label: "UGD / Rawat jalan", value: 0 },
      { label: "Dalam antrian", value: pendingPatients },
      { label: "Telah ditangani", value: completedPatients },
    ];

    const startOfDay = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const addDays = (date: Date, days: number) => {
      const d = new Date(date);
      d.setDate(d.getDate() + days);
      return d;
    };

    const trendDays = Array.from({ length: 7 }, (_, idx) => addDays(new Date(), idx - 6));
    const trendLabels = trendDays.map((day) =>
      day.toLocaleDateString("id-ID", { weekday: "short" })
    );

    const sevenDaysAgo = startOfDay(trendDays[0]);
    const tomorrow = startOfDay(addDays(trendDays[6], 1));
    const trendAgg = await RekamMedis.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo, $lt: tomorrow } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]);
    const trendMap = new Map(trendAgg.map((t: any) => [t._id, t.count]));
    const trendCounts = trendDays.map(day => {
      const key = day.toISOString().slice(0, 10);
      return trendMap.get(key) || 0;
    });

    const summary = {
      totals: {
        doctors: totalDoctors,
        patients: totalPatients,
        appointments: totalAppointments,
        billings: totalBilling,
      },
      patientDistribution,
      visitTrend: {
        labels: trendLabels,
        values: trendCounts,
      },
    };

    return sendSuccess(event, summary);
  } catch (error) {
    console.error(error);
    return sendApiError(event, 500, "server_error", "Internal Server Error");
  }
});
