import { z } from 'zod';

export const adSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  package_id: z.string()
});