import authOptions from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import cookie from 'cookie';

export async function GET(req: NextRequest) {
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

  try {
    const url = new URL(`${process.env.API_URL}/api/post/get`);
    
    // Получение параметров пагинации из запроса
    const limit = req.nextUrl.searchParams.get('limit') || '10';
    const skip = req.nextUrl.searchParams.get('skip') || '0';

    // Добавление параметров в URL
    url.searchParams.append('limit', limit);
    url.searchParams.append('skip', skip);

    // Отправка запроса на сервер для получения записей
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch posts');
    }

    const data = await res.json();

    // Проверка, если больше нет постов для загрузки
    const hasMore = (parseInt(skip, 10) + parseInt(limit, 10)) < data.meta.total;

    return NextResponse.json({ 
      success: true, 
      data: data.data, 
      meta: {
        total: data.meta.total,
        skip: parseInt(skip, 10),
        limit: parseInt(limit, 10),
        hasMore,
      } 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
