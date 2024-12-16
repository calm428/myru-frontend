import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { headers } from 'next/headers';
import cookie from 'cookie';

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    // Получение тела запроса
    const { status } = await request.json();

    // Проверка статуса
    const validStatuses = ['pending', 'completed', 'canceled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Некорректный статус' },
        { status: 400 }
      );
    }

    // Получение сессии и accessToken
    const session = await getServerSession(authOptions);
    let accessToken = session?.accessToken;

    // Проверка accessToken
    if (!accessToken) {
      const cookies = headers().get('cookie') || '';
      const parsedCookies = cookie.parse(cookies);
      accessToken = parsedCookies.access_token;
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Отправка обновления заказа через внешний API
    const res = await fetch(
      `${process.env.API_URL}/api/orders/${params.orderId}/status`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }
    );

    // Проверка на успешность обновления
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Ошибка при обновлении статуса заказа:', errorData);
      return NextResponse.json(
        { error: 'Ошибка при обновлении статуса' },
        { status: 500 }
      );
    }

    const updatedOrder = await res.json();

    return NextResponse.json({
      message: 'Статус заказа успешно обновлен',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Ошибка при обработке обновления статуса:', error);
    return NextResponse.json(
      { message: 'Ошибка при обновлении статуса заказа' },
      { status: 500 }
    );
  }
}
