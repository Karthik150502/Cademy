import { z } from 'zod';
export const SignInSchema = z.object({
    email: z.string().email("Enter a valid email").min(1, "Enter the email"),
    password: z.string().max(16, "Password is too long.").min(8, "Password too short."),
})

export type signInSchemaType = z.infer<typeof SignInSchema>; 