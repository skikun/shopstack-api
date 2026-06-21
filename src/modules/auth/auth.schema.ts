import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .meta({ description: "Account email address", example: "ski@shopstack.dev" }),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(200, "Use less than 200 characters")
    .regex(/[a-z]/, "Add a lowercase letter")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/\d/, "Add a digit")
    .regex(/[^A-Za-z0-9]/, "Add a symbol")
    .refine((v) => !/\s/.test(v), "Password cannot contain spaces")
    .meta({
      description: "8+ chars with upper, lower, digit & symbol; no spaces",
      example: "Sup3rSecret!",
    }),
  name: z
    .string()
    .trim()
    .min(1)
    .meta({ description: "Optional display name", example: "Andrés Mora" })
    .optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .meta({ description: "Account email address", example: "ski@shopstack.dev" }),
  password: z.string().min(1).meta({ description: "Account password", example: "supersecret" }),
});
export type LoginInput = z.infer<typeof loginSchema>;
