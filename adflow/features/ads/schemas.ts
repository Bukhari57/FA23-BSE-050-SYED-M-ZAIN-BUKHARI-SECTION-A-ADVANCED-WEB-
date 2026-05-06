import { z } from "zod";

export const adCreateSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(5000),
  categoryId: z.uuid(),
  cityId: z.uuid(),
  packageId: z.uuid(),
  mediaUrls: z.array(z.url()).min(1).max(10),
  boostScore: z.number().min(0).max(100).default(0),
});

export const adUpdateSchema = adCreateSchema.partial();

export const adDecisionSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  notes: z.string().max(500).optional(),
});

export const adScheduleSchema = z.object({
  scheduledAt: z.iso.datetime(),
});

