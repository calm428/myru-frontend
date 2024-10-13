import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import cookie from 'cookie'; // Для парсинга cookies

// Функция для получения accessToken
async function getAccessToken(req: NextRequest) {
  const session = await getServerSession(authOptions);

  let accessToken = session?.accessToken;

  if (!accessToken) {
    const cookies = req.headers.get('cookie') || '';
    const parsedCookies = cookie.parse(cookies);
    accessToken = parsedCookies.access_token;
  }

  return accessToken;
}

// Создаём запрос на создание нового адреса
export async function POST(req: NextRequest) {
  const accessToken = await getAccessToken(req);

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Удаляем поле "id" из тела запроса, если оно присутствует
    const { id, ...addressData } = body; // Используем деструктуризацию, чтобы исключить поле id

    // Отправляем запрос на бэкенд Fiber
    const res = await fetch(`${process.env.API_URL}/api/orders/addAddr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`, // Используем токен
      },
      body: JSON.stringify(addressData), // Отправляем данные без "id"
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { status: 'error', message: errorData.message },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ status: 'success', data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Ошибка при добавлении адреса' },
      { status: 500 }
    );
  }
}

// Обновление адреса доставки
export async function PUT(req: NextRequest) {
  const accessToken = await getAccessToken(req);

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const res = await fetch(`${process.env.API_URL}/api/orders/editAddr`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`, // Используем токен
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { status: 'error', message: errorData.message },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ status: 'success', data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Ошибка при обновлении адреса' },
      { status: 500 }
    );
  }
}

// Удаление адреса доставки
export async function DELETE(req: NextRequest) {
  const accessToken = await getAccessToken(req);

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const addressId = url.searchParams.get('id'); // Получаем ID адреса из URL параметров

    const res = await fetch(`${process.env.API_URL}/api/orders/delAddr`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`, // Используем токен
      },
      body: JSON.stringify({ id: addressId }), // Передаем ID адреса в теле запроса
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { status: 'error', message: errorData.message },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ status: 'success', data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Ошибка при удалении адреса' },
      { status: 500 }
    );
  }
}

// Получение списка адресов доставки
export async function GET(req: NextRequest) {
  const accessToken = await getAccessToken(req);

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Отправляем запрос на бэкенд Fiber
    const res = await fetch(`${process.env.API_URL}/api/orders/getAddresses`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`, // Используем токен
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { status: 'error', message: errorData.message },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ status: 'success', data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Ошибка при получении списка адресов' },
      { status: 500 }
    );
  }
}
