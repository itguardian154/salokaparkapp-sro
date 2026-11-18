
import { z } from "zod";

export const segmentSubDetailSchema = z.object({
  id: z.number().optional(),
  name: z.string().nullable(),
  is_active: z.boolean().nullable(),
  options: z.array(
    z.object({
      id: z.number().optional(),
      name: z.string().trim().min(1, "Nama option wajib diisi"),
      is_active: z.boolean(),
    }),
  ),
});

export const segmentDetailSchema = z.object({
  id: z.number().optional(),
  name: z.string().nullable(),
  is_active: z.boolean(),
  sub_details: z.array(segmentSubDetailSchema),
});

export const segmentSchema = z.object({
  name: z.string().min(1, "Nama segment wajib diisi"),
  is_active: z.boolean(),
  details: z.array(segmentDetailSchema),
});

export type SegmentFormValues = z.infer<typeof segmentSchema>;
