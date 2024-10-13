'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { selectCartItems, removeFromCart, clearCart } from '@/store/cartSlice';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Используем useRouter из next/navigation
import authOptions from '@/lib/authOptions';
// import { headers } from 'next/headers';
import cookie from 'cookie';
import { getServerSession } from 'next-auth';

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false); // Проверяем, смонтирован ли компонент на клиенте
  const cartItems = useSelector(selectCartItems); // Получаем товары из состояния
  const dispatch = useDispatch();
  const { data: session, status } = useSession(); // Проверка авторизации
  const router = useRouter();

  // Устанавливаем флаг, когда компонент смонтирован на клиенте
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id)); // Удаление товара
  };

  const handleClearCart = () => {
    dispatch(clearCart()); // Очистка корзины
  };

  const handleCheckout = async () => {
    // const session = await getServerSession(authOptions);

    // let accessToken = session?.accessToken;
    // if (!accessToken) {
    //   const cookies = headers().get('cookie') || '';
    //   const parsedCookies = cookie.parse(cookies);
    //   accessToken = parsedCookies.access_token;
    //   console.log('Session:', headers().get('cookie'));
    // }

    // if (!accessToken) {
    //   router.push('/auth/signin'); // Если не авторизован, перенаправляем на страницу входа
    //   return;
    // }

    router.push('/checkout'); // Если авторизован, перенаправляем на страницу оформления заказа
  };

  // Пока компонент не смонтирован на клиенте, ничего не рендерим
  if (!isMounted) {
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className='container mx-auto my-4'>
        <h1 className='text-2xl font-bold'>Ваша корзина пуста</h1>
        <Link href='/'>
          <Button className='mt-4'>Вернуться к покупкам</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='container mx-auto my-4'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Ваша корзина</h1>
        <Button
          className='!w-auto'
          variant='destructive'
          onClick={handleClearCart}
        >
          Очистить корзину
        </Button>
      </div>

      <div className='space-y-6'>
        {cartItems.map((item) => (
          <div
            key={item.id}
            className='flex items-center justify-between border-b pb-4'
          >
            <div className='flex items-center space-x-4'>
              <img
                src={item.image}
                alt={item.title}
                className='h-16 w-16 rounded-md object-cover'
              />
              <div>
                <h2 className='text-lg font-semibold'>{item.title}</h2>
                <p className='text-gray-600'>{item.price} руб.</p>
              </div>
            </div>
            <div>
              <Button
                variant='destructive'
                onClick={() => handleRemoveItem(item.id)}
                className='flex items-center space-x-2'
              >
                <RiDeleteBinLine size={18} />
                <span>Удалить</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-6 flex flex-col justify-between gap-2 md:flex-row'>
        <Button className='!w-full' onClick={handleCheckout}>
          Перейти к оформлению
        </Button>
      </div>
    </div>
  );
}
