import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import cookie from 'cookie';

export async function GET(request: Request) {
  try {
    // Получение сессии и accessToken
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

    // Отправка запроса на внешний API для получения продаж
    const res = await fetch(`${process.env.API_URL}/api/orders/getOrders`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { error: errorData.message },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Возвращаем данные о продажах
    return NextResponse.json({
      status: 'success',
      data: data.data, // Предполагаем, что API возвращает данные в ключе data
    });
  } catch (error) {
    console.error('Ошибка при получении продаж:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении данных' },
      { status: 500 }
    );
  }
}
