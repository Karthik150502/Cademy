import { z } from 'zod';
export const JoinRoomSchema = z.object({
    roomId: z.string().min(1, "Enter the Meeting Id."),
})

export type JoinRoomSchemaType = z.infer<typeof JoinRoomSchema>; 