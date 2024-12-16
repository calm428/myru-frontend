import authOptions from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import cookie from 'cookie';
// import formidable from 'formidable';

export async function POST(req: NextRequest) {
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
    const formData = await req.formData();

    const files = formData.getAll('photo') as File[];

    const body = new FormData();

    console.log(files);
    files.forEach((file) => {
      body.append('photo', file); // Название поля должно быть 'photo'
    });

    const res = await fetch(`${process.env.API_URL}/api/users/changePhoto`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: body,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Что-то пошло не так');
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
