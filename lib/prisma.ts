import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function setupDatabaseUrl(): string {
  const customUrl = process.env.DATABASE_URL;
  if (customUrl && !customUrl.includes('./dev.db') && !customUrl.startsWith('file:./') && !customUrl.includes('prisma/dev.db')) {
    return customUrl;
  }

  const cwd = process.cwd();
  const prismaDir = path.resolve(cwd, 'prisma');
  const sourceDbPath = path.resolve(prismaDir, 'dev.db');
  const writableDbPath = '/tmp/mibs_dev.db';

  try {
    // If writableDbPath doesn't exist yet, copy from existing sourceDbPath
    if (!fs.existsSync(writableDbPath)) {
      if (fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, writableDbPath);
      }
    }

    if (fs.existsSync(writableDbPath)) {
      fs.chmodSync(writableDbPath, 0o666);
      return `file:${writableDbPath}`;
    }
  } catch (err) {
    console.warn('[Prisma] Could not initialize /tmp/mibs_dev.db, using source path:', err);
  }

  // Ensure sourceDbPath is chmod 666 if accessible
  try {
    if (fs.existsSync(sourceDbPath)) {
      fs.chmodSync(sourceDbPath, 0o666);
    }
  } catch {
    // ignore
  }

  return `file:${sourceDbPath}`;
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

  // Configure SQLite for high concurrency and avoid locks
  prismaClient.$queryRawUnsafe('PRAGMA busy_timeout = 10000;').catch(() => {});
  prismaClient.$queryRawUnsafe('PRAGMA journal_mode = WAL;').catch(() => {});
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
    $queryRawUnsafe: async () => [],
  };
  prismaClient = new Proxy({}, { get: () => noOp }) as unknown as PrismaClient;
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
