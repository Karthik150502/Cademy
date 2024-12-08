import { PrismaClient } from '@prisma/client'
import { ENVIRONMENT } from './config';

const prismaClientSingleton = () => {
    return new PrismaClient()
}

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (ENVIRONMENT !== "production") globalThis.prismaGlobal = prisma