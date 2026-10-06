import { z } from 'zod';

export const selectStudentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  agreedAmountINR: z.number().int().min(100, 'Agreed amount must be at least ₹100').optional(),
  paymentMethodNote: z.string().max(500).optional(),
});

export const confirmAgreementSchema = z.object({
  confirmed: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm the agreement terms' }),
  }),
});
