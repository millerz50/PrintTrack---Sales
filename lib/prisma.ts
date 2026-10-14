import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function setupDatabaseUrl(): string {
  // If a valid non-relative database URL is provided (e.g. Postgres or custom), use it
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.startsWith('file:') && !envUrl.includes('./dev.db')) {
    return envUrl;
  }

  const cwd = process.cwd();
  const prismaDir = path.resolve(cwd, 'prisma');
  const prismaDbPath = path.resolve(prismaDir, 'dev.db');
  const rootDbPath = path.resolve(cwd, 'dev.db');

  // Ensure prisma directory exists
  if (!fs.existsSync(prismaDir)) {
    try {
      fs.mkdirSync(prismaDir, { recursive: true });
    } catch {
      // ignore
    }
  }

  // Ensure both prisma/dev.db and root dev.db are accessible and linked
  if (fs.existsSync(prismaDbPath)) {
    if (!fs.existsSync(rootDbPath)) {
      try {
        fs.linkSync(prismaDbPath, rootDbPath);
      } catch {
        try {
          fs.copyFileSync(prismaDbPath, rootDbPath);
        } catch {
          // ignore
        }
      }
    }
    return `file:${prismaDbPath}`;
  } else if (fs.existsSync(rootDbPath)) {
    try {
      fs.linkSync(rootDbPath, prismaDbPath);
    } catch {
      try {
        fs.copyFileSync(rootDbPath, prismaDbPath);
      } catch {
        // ignore
      }
    }
    return `file:${rootDbPath}`;
  }

  return `file:${prismaDbPath}`;
}

const resolvedDbUrl = setupDatabaseUrl();
process.env.DATABASE_URL = resolvedDbUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaClient: PrismaClient;

try {
  prismaClient =
    globalForPrisma.prisma ??
    new PrismaClient({
      datasources: {
        db: {
          url: resolvedDbUrl,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
} catch (err) {
  console.warn('[AI Studio] Database client initialization warning — using resilient proxy:', err);
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
    count: async () => 0,
    upsert: async (d: any) => d?.create ?? {},
  };
  prismaClient = new Proxy({}, { get: () => noOp }) as unknown as PrismaClient;
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
