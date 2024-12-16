import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import cookie from 'cookie';

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

// Обработчик GET запроса (Получение адреса)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessToken = await getAccessToken(req);

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const res = await fetch(`${process.env.API_URL}/api/orders/getAddr/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Ошибка при получении адреса' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ status: 'success', data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// Обработчик PUT запроса (Редактирование адреса)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessToken = await getAccessToken(req);

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await req.json();
    const res = await fetch(
      `${process.env.API_URL}/api/orders/editAddr/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

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
      { status: 'error', message: 'Ошибка при редактировании адреса' },
      { status: 500 }
    );
  }
}

// Обработчик DELETE запроса (Удаление адреса)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const accessToken = await getAccessToken(req);

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const res = await fetch(`${process.env.API_URL}/api/orders/delAddr/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { status: 'error', message: errorData.message },
        { status: res.status }
      );
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Ошибка при удалении адреса' },
      { status: 500 }
    );
  }
}
