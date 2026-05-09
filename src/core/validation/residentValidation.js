import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Reusable patterns
// ─────────────────────────────────────────────────────────────
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿĀ-žÑñ\s'\-.]+$/;
const PH_MOBILE_REGEX = /^09\d{9}$/;
const ALLOWED_ID_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_SIG_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

// ─────────────────────────────────────────────────────────────
// Personal Information Schema
// ─────────────────────────────────────────────────────────────
export const personalSchema = z.object({
  lastName: z
    .string({ required_error: 'Last name is required' })
    .trim()
    .min(1, 'Last name is required')
    .max(60, 'Last name must be 60 characters or fewer')
    .regex(NAME_REGEX, 'Contains invalid characters'),

  firstName: z
    .string({ required_error: 'First name is required' })
    .trim()
    .min(1, 'First name is required')
    .max(60, 'First name must be 60 characters or fewer')
    .regex(NAME_REGEX, 'Contains invalid characters'),

  middleName: z
    .string()
    .trim()
    .max(60, 'Middle name must be 60 characters or fewer')
    .regex(NAME_REGEX, 'Contains invalid characters')
    .optional()
    .or(z.literal('')),

  suffix: z
    .string()
    .trim()
    .max(10, 'Suffix must be 10 characters or fewer')
    .optional()
    .or(z.literal('')),

  birthdate: z
    .string({ required_error: 'Birthdate is required' })
    .min(1, 'Birthdate is required')
    .refine(
      (val) => {
        const d = new Date(val);
        return !isNaN(d.getTime()) && d < new Date();
      },
      { message: 'Must be a valid date in the past' }
    ),

  gender: z
    .string({ required_error: 'Sex is required' })
    .min(1, 'Sex is required'),

  contactNumber: z
    .string()
    .trim()
    .refine(
      (val) => !val || PH_MOBILE_REGEX.test(val),
      { message: 'Must be a valid PH mobile number (09XXXXXXXXX)' }
    )
    .optional()
    .or(z.literal('')),

  email: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: 'Must be a valid email address' }
    )
    .optional()
    .or(z.literal('')),

  civilStatus: z.string().optional().or(z.literal('')),
  placeOfBirth: z
    .string({ required_error: 'Place of birth is required' })
    .trim()
    .min(1, 'Place of birth is required')
    .max(100, 'Place of birth must be 100 characters or fewer'),

  nationality: z
    .string({ required_error: 'Nationality is required' })
    .min(1, 'Nationality is required'),

  religion: z.string().trim().max(60).optional().or(z.literal('')),
  occupation: z.string().trim().max(80).optional().or(z.literal('')),
  voterStatus: z.boolean().optional(),
  bloodType: z.string().optional().or(z.literal('')),
});

// ─────────────────────────────────────────────────────────────
// Address Information Schema
// ─────────────────────────────────────────────────────────────
export const addressSchema = z.object({
  houseNo: z
    .string({ required_error: 'House no. is required' })
    .trim()
    .min(1, 'House no. is required')
    .max(100, 'Must be 100 characters or fewer'),

  street: z
    .string({ required_error: 'Street is required' })
    .trim()
    .min(1, 'Street is required')
    .max(100, 'Must be 100 characters or fewer'),

  purokId: z.any(),

  purok: z.string().optional().or(z.literal('')),
  barangay: z.string().optional().or(z.literal('')),
});

// ─────────────────────────────────────────────────────────────
// Valid ID Schema
// ─────────────────────────────────────────────────────────────
const fileSchema = z
  .any()
  .optional()
  .refine(
    (file) => {
      if (!file || !(file instanceof File)) return true;
      return file.size <= MAX_FILE_SIZE;
    },
    { message: 'File must be 2 MB or smaller' }
  );

export const validIdSchema = z.object({
  validIdType: z.string().optional().or(z.literal('')),
  validIdNumber: z.string().trim().max(30, 'ID number must be 30 characters or fewer').optional().or(z.literal('')),

  validIdFile: fileSchema.refine(
    (file) => {
      if (!file || !(file instanceof File)) return true;
      return ALLOWED_ID_MIME.includes(file.type);
    },
    { message: 'Only JPEG, PNG, WebP, or PDF files are allowed' }
  ),

  signatureFile: z
    .any()
    .optional()
    .refine(
      (file) => {
        if (!file || !(file instanceof File)) return true;
        return ALLOWED_SIG_MIME.includes(file.type);
      },
      { message: 'Only image files (JPEG, PNG, WebP) are allowed' }
    ),
});

// ─────────────────────────────────────────────────────────────
// Combined schema for the full form
// ─────────────────────────────────────────────────────────────
export const residentFormSchema = z.object({
  personal: personalSchema,
  address: addressSchema,
  validId: validIdSchema,
  // sectoral and identification have no validation constraints
});

/**
 * Validate the entire resident form data.
 * Returns { success: true, data } or { success: false, errors }.
 * `errors` is a flat object keyed as "section.field" → message.
 */
export function validateResidentForm(formData) {
  const result = residentFormSchema.safeParse(formData);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = {};
  for (const issue of result.error.issues) {
    // path e.g. ['personal', 'lastName'] → 'personal.lastName'
    const key = issue.path.join('.');
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return { success: false, errors };
}
