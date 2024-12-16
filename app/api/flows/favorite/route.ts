import authOptions from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import cookie from 'cookie';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  const headersList = headers();
  const cookiesHeader = headersList.get('cookie');
  const cookiesParsed = cookiesHeader ? cookie.parse(cookiesHeader) : {};
  const userIdCookie = cookiesParsed['UserID'];

  // Получаем ID пользователя из сессии или из куки
  const userId = session?.user?.id || userIdCookie || null;

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
    const { id, actionType } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing blogID' }, { status: 400 });
    }

    // Если тип действия "add", добавляем в избранное
    if (actionType === 'add') {
      const res = await fetch(`${process.env.API_URL}/api/blog/addFav`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UniqId: id,
          actionType: 'add',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add to favorites');
      }

      return NextResponse.json({ success: true });
    }
    // Если тип действия "remove", удаляем из избранного
    else if (actionType === 'remove') {
      const res = await fetch(`${process.env.API_URL}/api/blog/delFav`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UniqId: id,
          actionType: 'remove',
        }),
      });

      console.log(await res.json());

      if (!res.ok) {
        throw new Error('Failed to remove from favorites');
      }

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
