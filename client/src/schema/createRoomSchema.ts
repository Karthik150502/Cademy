import { z } from 'zod';
export const CreateRoomSchema = z.object({
    title: z.string().min(1, "Enter the meeting title."),
    name: z.string().min(1, "Enter the name."),
})

export type CreateRoomSchemaType = z.infer<typeof CreateRoomSchema>;

export const CreateStreamSchema = z.object({
    roomId: z.string().min(1, "Enter the room id."),
    name: z.string().min(1, "Enter the name."),
})

export type CreateStreamSchemaType = z.infer<typeof CreateStreamSchema>; 