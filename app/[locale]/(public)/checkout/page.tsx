'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { selectCartItems, clearCart } from '@/store/cartSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false); // Проверяем, что компонент смонтирован
  const cartItems = useSelector(selectCartItems); // Получаем товары из состояния корзины
  const dispatch = useDispatch();
  const router = useRouter(); // Используем хук для перехода на другую страницу

  // Состояния для метода доставки, оплаты, адреса и контактов
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [contactDetails, setContactDetails] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setIsMounted(true); // Устанавливаем флаг после монтирования компонента
  }, []);

  const handleClearCart = () => {
    dispatch(clearCart()); // Очистка корзины после оформления
  };

  const handlePlaceOrder = async () => {
    if (!name || !email || !address || !phone) {
      toast.error('Пожалуйста, заполните все поля!'),
        {
          position: 'top-right',
        };
      return;
    }

    const orderData = {
      cartItems,
      customerDetails: { name, email, address, phone },
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      // Логика оформления заказа
      if (response.ok) {
        toast.success(
          `Заказ оформлен! Адрес доставки: ${address}, Контакт: ${email}, ${address}, ${phone}`
        ),
          {
            position: 'top-right',
          };

        handleClearCart(); // Очищаем корзину

        // Перенаправляем на страницу с успешным оформлением
        router.push('/checkout/done');
      } else {
        alert('Ошибка: ' + result.message);
      }
    } catch (error) {
      alert('Произошла ошибка при оформлении заказа');
      console.error(error);
    }
  };

  // Вычисляем общую сумму заказа
  const totalAmount = cartItems.reduce((total, item) => total + item.price, 0);

  // Пока компонент не смонтирован, возвращаем null для предотвращения ошибки гидратации
  if (!isMounted) {
    return null;
  }

  return (
    <div className='container mx-auto my-4'>
      <h1 className='mb-6 text-2xl font-bold'>Оформление заказа</h1>

      {/* Раздел для ввода адреса доставки */}
      {/* Форма ввода реквизитов покупателя */}
      <div className='mt-8'>
        <h2 className='text-xl font-semibold'>Ваши данные</h2>
        <input
          type='text'
          placeholder='Ваше имя'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='mb-4 w-full rounded-md border border-gray-300 p-2'
        />
        <input
          type='email'
          placeholder='Ваш email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='mb-4 w-full rounded-md border border-gray-300 p-2'
        />
        <input
          type='text'
          placeholder='Контактный телефон'
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className='mb-4 w-full rounded-md border border-gray-300 p-2'
        />
        <input
          type='text'
          placeholder='Адрес доставки'
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className='mb-4 w-full rounded-md border border-gray-300 p-2'
        />
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

      {/* Вывод общей суммы заказа */}
      <div className='mt-8'>
        <h2 className='text-xl font-semibold'>
          Общая сумма заказа:{' '}
          {totalAmount.toLocaleString('ru-RU', {
            style: 'currency',
            currency: 'RUB',
          })}
        </h2>
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
