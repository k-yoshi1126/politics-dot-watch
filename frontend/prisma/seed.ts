import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // 既存のデータを削除（オプション）
    try {
      await prisma.post.deleteMany();
      await prisma.user.deleteMany();
      console.log('既存のデータを削除しました');
    } catch (error) {
      console.log('既存のデータが存在しないか、テーブルが作成されていません');
    }

    // パスワードをハッシュ化
    const hashedPassword = await hash('password!23', 10);

    // ユーザーの作成
    const user1 = await prisma.user.create({
      data: {
        name: '山田太郎',
        email: 'yamada@example.com',
        password: hashedPassword,
        posts: {
          create: [
            {
              title: '初めての投稿',
              content: 'これは初めての投稿です。Next.jsとPrismaでアプリを作っています。',
              published: true,
            },
            {
              title: '二つ目の投稿',
              content: 'PostgreSQLとの連携もうまくいっています。',
              published: true,
            },
          ],
        },
      },
    });

    const user2 = await prisma.user.create({
      data: {
        name: '佐藤花子',
        email: 'sato@example.com',
        password: hashedPassword,
        posts: {
          create: [
            {
              title: 'Docker環境でのNext.js',
              content: 'Dockerを使った開発環境の構築について共有します。',
              published: true,
            },
          ],
        },
      },
    });

    console.log('サンプルデータの作成に成功しました');
    console.log({ user1, user2 });
  } catch (error) {
    console.error('サンプルデータの作成中にエラーが発生しました', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });