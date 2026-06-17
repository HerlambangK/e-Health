import { Schema, model } from "mongoose";

interface IJob {
  type: string;
  payload: Record<string, any>;
  priority: number;
  status: "pending" | "processing" | "done" | "failed";
  runAt: Date;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  createdAt: Date;
}

const JobSchema = new Schema<IJob>({
  type: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
  priority: { type: Number, default: 5 },
  status: {
    type: String,
    enum: ["pending", "processing", "done", "failed"],
    default: "pending",
  },
  runAt: { type: Date, default: Date.now },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 5 },
  lastError: String,
  createdAt: { type: Date, default: Date.now },
});

const JobModel = model<IJob>("Job", JobSchema);
export { IJob, JobModel };

const handlers: Record<string, (payload: any) => Promise<void>> = {};

export function registerHandler(type: string, handler: (payload: any) => Promise<void>) {
  handlers[type] = handler;
}

export async function enqueue(
  type: string,
  payload: any,
  options: { priority?: number; delay?: number } = {}
): Promise<void> {
  await JobModel.create({
    type,
    payload,
    priority: options.priority ?? 5,
    status: "pending",
    runAt: new Date(Date.now() + (options.delay ?? 0)),
    attempts: 0,
    maxAttempts: 5,
  });
}

export async function processQueue(): Promise<IJob | null> {
  const job = await JobModel.findOneAndUpdate(
    { status: "pending", runAt: { $lte: new Date() } },
    { status: "processing", $inc: { attempts: 1 } },
    { sort: { priority: 1, createdAt: 1 }, new: true }
  );

  if (!job) return null;

  try {
    if (handlers[job.type]) {
      await handlers[job.type](job.payload);
    }
    await JobModel.findByIdAndUpdate(job._id, { status: "done" });
  } catch (error: any) {
    const failed = job.attempts >= job.maxAttempts;
    await JobModel.findByIdAndUpdate(job._id, {
      status: failed ? "failed" : "pending",
      lastError: error.message,
      runAt: new Date(Date.now() + Math.pow(2, job.attempts) * 30_000),
    });
  }

  return job;
}
