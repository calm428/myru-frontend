import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { headers } from 'next/headers';
import cookie from 'cookie';

export async function POST(request: Request) {
  try {
    // Получение тела запроса
    const body = await request.json();
    const { cartItems, customerDetails, shippingMethod, paymentMethod } = body;

    // Проверка на наличие товаров и данных клиента
    if (!cartItems || !customerDetails || !shippingMethod || !paymentMethod) {
      return NextResponse.json(
        { message: 'Ошибка: недостаточно данных' },
        { status: 400 }
      );
    }

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

    // Группировка товаров по продавцу
    const groupedBySeller = cartItems.reduce((acc: any, item: any) => {
      (acc[item.seller] = acc[item.seller] || []).push(item);
      return acc;
    }, {});

    // Проход по каждому продавцу и создание заказов
    const orderPromises = Object.keys(groupedBySeller).map(async (sellerID) => {
      const itemsForSeller = groupedBySeller[sellerID];

      const order = {
        cartItems: itemsForSeller.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          seller: item.seller, // Имя продавца
        })),
        customerDetails: {
          addressId: customerDetails.addressId, // Передаем ID адреса клиента
        },
        shippingMethod, // Способ доставки
        paymentMethod, // Способ оплаты
      };

      // Отправка заказа в API
      const res = await fetch(`${process.env.API_URL}/api/orders/newOrder`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order), // Передаем заказ в теле запроса
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Ошибка API:', errorData);
        throw new Error(`Ошибка при создании заказа для продавца ${sellerID}`);
      }

      const orderResponse = await res.json();
      console.log('Создан заказ:', orderResponse);

      return orderResponse;
    });

    // Дождаться выполнения всех заказов
    const orders = await Promise.all(orderPromises);

    // Успешный ответ
    return NextResponse.json({
      message: 'Заказы успешно оформлены',
      orders: orders,
    });
  } catch (error) {
    console.error('Ошибка при обработке заказа:', error);
    return NextResponse.json(
      { message: 'Ошибка при создании заказа' },
      { status: 500 }
    );
  }
}
