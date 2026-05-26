import { z } from "zod";

export const leadSchema = z.object({
  company: z.string().min(1),
  founder: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  summary: z.string().min(1),
  outreachAngle: z.string().nullable().optional(),
  leadScore: z.number().min(0).max(100).nullable().optional(),
  sources: z.array(z.string()).min(1),
});

export const leadsResponseSchema = z.object({
  leads: z.array(leadSchema).min(1).max(10),
});

export type Lead = z.infer<typeof leadSchema>;
export type LeadsResponse = z.infer<typeof leadsResponseSchema>;

export const leadJsonSchema = {
  type: "object",
  properties: {
    leads: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string" },
          founder: { type: ["string", "null"] },
          website: { type: ["string", "null"] },
          email: { type: ["string", "null"] },
          linkedin: { type: ["string", "null"] },
          industry: { type: ["string", "null"] },
          location: { type: ["string", "null"] },
          summary: { type: "string" },
          outreachAngle: { type: ["string", "null"] },
          sources: { type: "array", items: { type: "string" } },
        },
        required: ["company", "summary", "sources"],
        additionalProperties: false,
      },
    },
  },
  required: ["leads"],
  additionalProperties: false,
} as const;
