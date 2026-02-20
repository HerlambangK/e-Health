import Dokter from "~/server/models/Dokter";
import Pasien from "~/server/models/Pasien";
import RekamMedis from "~/server/models/RekamMedis";
import Appointment from "~/server/models/Appointment";
import Billing from "~/server/models/Billing";
import { sendError, sendSuccess } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  try {
    const [totalDoctors, totalPatients, totalAppointments, totalBilling] = await Promise.all([
      Dokter.countDocuments(),
      Pasien.countDocuments(),
      Appointment.countDocuments(),
      Billing.countDocuments(),
    ]);

    const completedPatients = await Pasien.countDocuments({ completedStatus: true });
    const pendingPatients = await Pasien.countDocuments({ completedStatus: false });

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

    const trendCounts = await Promise.all(
      trendDays.map((day) =>
        RekamMedis.countDocuments({
          createdAt: {
            $gte: startOfDay(day),
            $lt: startOfDay(addDays(day, 1)),
          },
        })
      )
    );

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
    return sendError(event, 500, "server_error", "Internal Server Error");
  }
});
