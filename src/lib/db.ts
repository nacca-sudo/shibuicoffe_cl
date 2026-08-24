import { PrismaClient } from "@prisma/client";

// Singleton: evita múltiples conexiones en desarrollo (hot-reload de Next)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
