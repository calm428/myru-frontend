import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { headers } from 'next/headers';
import cookie from 'cookie';

// Функция для получения списка заказов покупателя
export async function GET(request: Request) {
  try {
    // Получаем сессию и accessToken
    const session = await getServerSession(authOptions);
    let accessToken = session?.accessToken;
    if (!accessToken) {
      const cookies = headers().get('cookie') || '';
      const parsedCookies = cookie.parse(cookies);
      accessToken = parsedCookies.access_token;
    }

    // Если токен отсутствует, возвращаем ошибку авторизации
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Запрашиваем список заказов у сервера (используя API для бэкенда)
    const res = await fetch(
      `${process.env.API_URL}/api/orders/getOrdersBuyers`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Проверка на успешность ответа
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Ошибка API:', errorData);
      return NextResponse.json(
        { message: 'Ошибка при получении заказов' },
        { status: res.status }
      );
    }

    const orders = await res.json();

    // Успешный ответ с данными заказов
    return NextResponse.json({
      status: 'success',
      data: orders.data, // данные заказов
    });
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    return NextResponse.json(
      { message: 'Ошибка при получении заказов' },
      { status: 500 }
    );
  }
}
