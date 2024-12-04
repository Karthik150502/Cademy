
import { PrismaClient } from '@prisma/client'
import { PROD } from './config';

const prismaClientSingleton = () => {
    return new PrismaClient()
}

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (!PROD) globalThis.prismaGlobal = prisma