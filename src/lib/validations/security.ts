import { z } from "zod";

export const enableMfaSchema = z.object({
  code: z.string().length(6, "El codigo debe tener 6 digitos"),
});

export const verifyMfaSchema = z.object({
  code: z.string().min(6).max(20),
});

export const disableMfaSchema = z.object({
  password: z.string().min(1),
  code: z.string().length(6),
});
