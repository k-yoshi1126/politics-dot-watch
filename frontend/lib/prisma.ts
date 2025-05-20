import { PrismaClient } from '@prisma/client';

// PrismaClientのグローバルインスタンスを宣言
const prismaGlobal = global as typeof global & {
  prisma?: PrismaClient;
};

// 開発環境では再接続を避けるためにPrismaClientのインスタンスを再利用
const prisma = prismaGlobal.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  prismaGlobal.prisma = prisma;
}

export default prisma;