import { z } from 'zod';
export const CreateRoomSchema = z.object({
    title: z.string().min(1, "Enter the meeting title."),
})

export type CreateRoomSchemaType = z.infer<typeof CreateRoomSchema>; 