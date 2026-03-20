import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const employeeSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  employeeCode: z.string().optional(),
  position: z.string().optional(),
  dailySalary: z.coerce.number().min(0, "Daily salary must be 0 or higher"),
  lateDeduction: z.coerce
    .number()
    .min(0, "Late deduction must be 0 or higher"),
  isActive: z.enum(["true", "false"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;