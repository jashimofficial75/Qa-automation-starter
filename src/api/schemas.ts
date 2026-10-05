import { z } from 'zod';

/**
 * Response contracts. Validating shape (not just status) catches silent
 * breaking changes: renamed fields, wrong types, missing pagination.
 * Replace these with your API's real contracts.
 */
export const LoginResponseSchema = z.object({
  accessToken: z.string().regex(/^[\w-]+\.[\w-]+\.[\w-]+$/, 'must be a JWT'),
  refreshToken: z.string().min(1),
  id: z.number().int().positive(),
  username: z.string(),
  email: z.email(),
});

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  price: z.number().nonnegative(),
});

export const ProductListSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
});

export const ErrorSchema = z.object({
  message: z.string().min(1),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type Product = z.infer<typeof ProductSchema>;
