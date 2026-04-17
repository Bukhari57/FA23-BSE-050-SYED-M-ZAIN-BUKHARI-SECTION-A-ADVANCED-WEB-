import { z } from "zod";

export const paymentSubmitSchema = z.object({
  adId: z.uuid(),
  amountPkr: z.number().positive(),
  transactionRef: z.string().min(6).max(120),
  screenshotUrl: z.url(),
  notes: z.string().max(500).optional(),
});

export const paymentVerifySchema = z.object({
  paymentId: z.uuid(),
  approved: z.boolean(),
  adminNotes: z.string().max(500).optional(),
});

