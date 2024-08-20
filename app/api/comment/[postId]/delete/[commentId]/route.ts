import authOptions from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import cookie from 'cookie';

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  let accessToken = session?.accessToken;
  if (!accessToken) {
    const cookies = headers().get('cookie') || '';
    const parsedCookies = cookie.parse(cookies);
    accessToken = parsedCookies.access_token;
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Извлечение идентификаторов поста и комментария из URL
  const urlParts = req.nextUrl.pathname.split('/');
  const postId = urlParts[urlParts.length - 3];
  const commentId = urlParts[urlParts.length - 1];

  if (!postId || !commentId) {
    return NextResponse.json({ error: 'Post ID and Comment ID are required' }, { status: 400 });
  }

  try {
    // Создание URL для удаления комментария
    const url = new URL(`${process.env.API_URL}/api/post/${postId}/comments/${commentId}`);

    // Отправка запроса на сервер для удаления комментария
    const res = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to delete comment');
    }

    return NextResponse.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
