import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  // Здесь можно сохранить данные в базе данных или обработать другим образом
  const { cartItems, customerDetails } = body;

  if (!cartItems || !customerDetails) {
    return NextResponse.json(
      { message: 'Ошибка: недостаточно данных' },
      { status: 400 }
    );
  }

  // Пример ответа (можно добавить логику обработки данных)
  return NextResponse.json({ message: 'Заказ успешно оформлен', order: body });
}
