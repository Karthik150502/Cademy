import { z } from 'zod';
export const SignUpSchema = z.object({
    name: z.string().min(1, "Name too short").max(50, "Name too long."),
    email: z.string().email("Enter a valid email").min(1, "Enter the email"),
    password: z.string().max(16, "Password is too long.").min(8, "Password too short."),
})

export type signUpSchemaType = z.infer<typeof SignUpSchema>; 