import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const videoPath = url.searchParams.get('path'); // Пример параметра для видео

  if (!videoPath) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${process.env.API_URL}/api/settings/youtube/${videoPath}`
    );
    const data = await response.text(); // Вы можете изменить это на нужный формат данных
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка запроса' }, { status: 500 });
  }
}
