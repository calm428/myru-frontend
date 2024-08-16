import { NextRequest, NextResponse } from 'next/server';
import authOptions from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import cookie from 'cookie';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Получение сессии пользователя
  const session = await getServerSession(authOptions);

  // Получение токена доступа
  let accessToken = session?.accessToken;
  if (!accessToken) {
    const cookies = headers().get('cookie') || '';
    const parsedCookies = cookie.parse(cookies);
    accessToken = parsedCookies.access_token;
  }

  // Проверка авторизации
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Получение ID поста из параметров URL
    const postId = params.id;
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Парсинг тела запроса
    const body = await req.json();

    // Отправка запроса на ваш основной API для добавления комментария
    const res = await fetch(`${process.env.API_URL}/api/post/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error('Failed to add comment');
    }

    // Получение данных ответа
    const data = await res.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    // Получение сессии пользователя
    const session = await getServerSession(authOptions);
  
    // Получение токена доступа
    let accessToken = session?.accessToken;
    if (!accessToken) {
      const cookies = headers().get('cookie') || '';
      const parsedCookies = cookie.parse(cookies);
      accessToken = parsedCookies.access_token;
    }
  
    // Проверка авторизации
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      // Получение ID поста из параметров URL
      const postId = params.id;
      if (!postId) {
        return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
      }
  
      // Отправка GET-запроса на ваш основной API для получения комментариев
      const res = await fetch(`${process.env.API_URL}/api/post/${postId}/comments`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (!res.ok) {
        throw new Error('Failed to fetch comments');
      }
  
      // Получение данных ответа
      const data = await res.json();
  
      return NextResponse.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }
  }