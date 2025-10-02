import { z } from "zod";

/* ──────────────────────────────────────────────────────────────────────────
   Basic app types
-------------------------------------------------------------------------- */
export type Stats = {
  activeCases: number;
  pendingQuotes: number;
  incidents: number;
};

export type casePoint = { name: string; value: number };

export type Props = {
  title?: string;
  data: casePoint[];
  max?: number;
};

export type activeCases = {
  caseNo: string;
  customer: string;
  service: string;
  status: string;
  pic: string;
  driver: string;
  pickupDate: string; // YYYY/MM/DD
};

export type pendingQuotes = {
  caseNo: string;
  customer: string;
  service: string;
  pic: string;
  driver: string;
  pickupDate: string;
};

export type unpaidInvoices = {
  caseNo: string;
  customer: string;
  totalAmount: string;
  dateDue: string; // YYYY-MM-DD
};

/* ──────────────────────────────────────────────────────────────────────────
   Tax
-------------------------------------------------------------------------- */
export type Tax = {
  id: string;
  name_en: string;
  name_jp: string;
  rate: number;
};

export const TaxCreateSchema = z.object({
  name_en: z
    .string()
    .trim()
    .min(2, "Tax name (EN) must be at least 2 characters"),

  name_jp: z
    .string()
    .optional()
    .transform((v) => (v && v.trim().length ? v : undefined)),

  rate: z
    .coerce.number()
    .refine((v) => !Number.isNaN(v), { message: "Tax rate must be a number" })
    .min(0, { message: "Tax Rate must be at least 0" })
    .max(100, { message: "Rate cannot be more than 100" }),
});

export type TaxCreateInput = z.infer<typeof TaxCreateSchema>;

/* ──────────────────────────────────────────────────────────────────────────
   Incident
-------------------------------------------------------------------------- */
export type IncidentStatus = "Pending Approval" | "Active" | "Resolved";

export interface Incident {
  id: string;
  case: string;
  issueType: string;
  status: IncidentStatus;
  pic: string;
  // Optional fields (your data.ts may not always include them)
  description?: string;
  capa?: string;
  attachments?: string[]; // persisted file URLs or filenames
}

/* ---- File validation (images + pdf + doc/docx) ------------------------ */
const ALLOWED_MIME = new Set<string>([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]);

const ALLOWED_EXT = /\.(png|jpe?g|webp|gif|pdf|docx?)$/i;
const MAX_FILES = 5; 

const fileIsAllowed = (f: File) =>
  ALLOWED_MIME.has(f.type) || ALLOWED_EXT.test(f.name);

/** Convenience string you can pass to <input accept="...">  */
export const FILE_ACCEPT = "image/*,.pdf,.doc,.docx";

/** Shared attachments schema used by both create & edit forms */
const attachmentsSchema = z
  .array(z.instanceof(File))
  .min(1, "Please attach at least 1 file")
  .max(MAX_FILES, `Attach up to ${MAX_FILES} files`)
  .refine((arr) => arr.every(fileIsAllowed), {
    message:
      "Only images (PNG/JPG/WEBP/GIF), PDF, or DOC/DOCX files are allowed",
  });

/* ---- Create / Edit schemas ------------------------------------------- */
export const IncidentCreateSchema = z.object({
  caseNo: z
    .string()
    .trim()
    .min(1, "Case Number is required")
    .max(30, "Case Number is too long"),

  incidentType: z.string().trim().min(1, "Incident Type is required"),

  description: z.string().trim().min(10, "Please write at least 10 characters"),

  capa: z.string().trim().min(5, "Please provide at least 5 characters"),

  attachments: attachmentsSchema, // images + pdf + doc/docx

  status: z.enum(["Pending Approval", "Active", "Resolved"]),
});
export type IncidentCreateInput = z.infer<typeof IncidentCreateSchema>;

export const IncidentEditSchema = z.object({
  id: z.string().min(1, "Invalid ID"),

  caseNo: z
    .string()
    .trim()
    .min(1, "Case Number is required")
    .max(30, "Case Number is too long"),

  incidentType: z.string().trim().min(1, "Incident Type is required"),

  description: z.string().trim().min(10, "Please write at least 10 characters"),

  capa: z.string().trim().min(5, "Please provide at least 5 characters"),

  attachments: attachmentsSchema, // keep required; change to optional() if you don't want it required on edit

  status: z.enum(["Pending Approval", "Active", "Resolved"]),
});
export type IncidentEditInput = z.infer<typeof IncidentEditSchema>;
