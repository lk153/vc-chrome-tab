import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export const emailSchema = z.object({
  email: z.string().email().max(254),
});

export const verifyTokenSchema = z.object({
  token: z.string().min(10).max(400),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10).max(400),
  password: z.string().min(8).max(200),
});
