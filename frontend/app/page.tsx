import prisma from '../lib/prisma';
import { Suspense } from 'react';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

type Post = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  author: {
    name: string;
    email: string;
  } | null;
};

async function getPosts(): Promise<Post[]> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return [];
  }
}

// 投稿一覧を表示するコンポーネント
async function PostList() {
  const posts = await getPosts();

  if (posts.length === 0) {
    return <p className="text-gray-500">投稿がまだありません。</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {posts.map((post) => (
        <div key={post.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
          <p className="text-gray-600 mb-4">{post.content}</p>
          <div className="flex items-center text-sm text-gray-500">
            <span>投稿者: {post.author?.name || '不明'}</span>
            <span className="mx-2">•</span>
            <span>{post.author?.email || ''}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ローディング表示用のコンポーネント
function Loading() {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">ブログ投稿一覧</h1>
      <Suspense fallback={<Loading />}>
        <PostList />
      </Suspense>
    </div>
  );
}