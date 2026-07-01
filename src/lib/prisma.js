"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
// src/lib/prisma.ts
var prisma_1 = require("../generated/prisma");
var prismaClientSingleton = function () {
    return new prisma_1.PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
};
var prisma = (_a = globalThis.prisma) !== null && _a !== void 0 ? _a : prismaClientSingleton();
exports.default = prisma;
if (process.env.NODE_ENV !== "production")
    globalThis.prisma = prisma;
