"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const config_1 = require("./config");
const prismaClientSingleton = () => {
    return new client_1.PrismaClient();
};
const prisma = (_a = globalThis.prismaGlobal) !== null && _a !== void 0 ? _a : prismaClientSingleton();
exports.default = prisma;
if (config_1.ENVIRONMENT !== "production")
    globalThis.prismaGlobal = prisma;
