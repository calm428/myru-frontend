'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { selectCartItems, clearCart } from '@/store/cartSlice';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false); // Проверяем, что компонент смонтирован
  const cartItems = useSelector(selectCartItems); // Получаем товары из состояния корзины
  const dispatch = useDispatch();

  // Состояния для метода доставки и оплаты
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  useEffect(() => {
    setIsMounted(true); // Устанавливаем флаг после монтирования компонента
  }, []);

  const handleClearCart = () => {
    dispatch(clearCart()); // Очистка корзины после оформления
  };

  const handlePlaceOrder = () => {
    // Логика оформления заказа
    alert('Заказ оформлен!');
    handleClearCart(); // Очищаем корзину
  };

  // Пока компонент не смонтирован, возвращаем null для предотвращения ошибки гидратации
  if (!isMounted) {
    return null;
  }

  return (
    <div className='container mx-auto my-10'>
      <h1 className='mb-6 text-2xl font-bold'>Оформление заказа</h1>

      <div className='space-y-6'>
        <h2 className='text-xl font-semibold'>Товары в корзине</h2>
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
          </div>
        ))}
      </div>

      {/* Раздел выбора метода доставки */}
      <div className='mt-8'>
        <h2 className='text-xl font-semibold'>Способ доставки</h2>
        <div className='space-y-4'>
          <label className='flex items-center space-x-2'>
            <input
              type='radio'
              value='standard'
              checked={shippingMethod === 'standard'}
              onChange={() => setShippingMethod('standard')}
            />
            <span>Стандартная доставка (бесплатно)</span>
          </label>
          <label className='flex items-center space-x-2'>
            <input
              type='radio'
              value='express'
              checked={shippingMethod === 'express'}
              onChange={() => setShippingMethod('express')}
            />
            <span>Экспресс-доставка (500 руб.)</span>
          </label>
        </div>
      </div>

      {/* Раздел выбора метода оплаты */}
      <div className='mt-8'>
        <h2 className='text-xl font-semibold'>Способ оплаты</h2>
        <div className='space-y-4'>
          <label className='flex items-center space-x-2'>
            <input
              type='radio'
              value='credit_card'
              checked={paymentMethod === 'credit_card'}
              onChange={() => setPaymentMethod('credit_card')}
            />
            <span>Банковская карта</span>
          </label>
          <label className='flex items-center space-x-2'>
            <input
              type='radio'
              value='cash'
              checked={paymentMethod === 'cash'}
              onChange={() => setPaymentMethod('cash')}
            />
            <span>Оплата наличными</span>
          </label>
        </div>
      </div>

      {/* Кнопка для оформления заказа */}
      <div className='mt-8 flex flex-col gap-4'>
        <Button className='!w-full' onClick={handlePlaceOrder}>
          Оформить заказ
        </Button>
        <Link href='/cart'>
          <Button className='!w-full' variant='secondary'>
            Вернуться в корзину
          </Button>
        </Link>
      </div>
    </div>
  );
}
