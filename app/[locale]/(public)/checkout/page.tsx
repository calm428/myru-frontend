'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { selectCartItems, clearCart } from '@/store/cartSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { format } from 'date-fns'; // Модуль для форматирования даты
import { ru } from 'date-fns/locale'; // Импорт локали ru

// Компонент для скелетона адресов
const SkeletonAddress = () => (
  <div className='animate-pulse p-4'>
    <div className='mb-2 h-4 w-40 bg-gray-300'></div>
    <div className='mb-2 h-4 w-56 bg-gray-300'></div>
    <div className='mb-2 h-4 w-40 bg-gray-300'></div>
  </div>
);

interface Address {
  id: string;
  addressName: string;
  city: string;
  street: string;
  building: string;
  postalCode: string;
  phoneNumber: string;
}

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const router = useRouter();

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true); // Состояние загрузки

  useEffect(() => {
    setIsMounted(true);
    fetchSavedAddresses();
  }, []);

  // Получаем сохраненные адреса пользователя
  const fetchSavedAddresses = async () => {
    try {
      const response = await fetch('/api/addresses');
      const data = await response.json();
      const formattedAddresses = data.data.data.map((address: any) => ({
        id: address.ID,
        addressName: address.AddressName,
        city: address.City,
        street: address.Street,
        building: address.Building,
        postalCode: address.PostalCode,
        phoneNumber: address.PhoneNumber,
      }));

      setSavedAddresses(formattedAddresses);
    } catch (error) {
      console.error('Ошибка при загрузке адресов', error);
    } finally {
      setIsLoading(false); // Окончание загрузки
    }
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Выберите адрес доставки!', {
        position: 'top-right',
      });
      return;
    }

    const orderData = {
      cartItems,
      customerDetails: { addressId: selectedAddressId },
      shippingMethod,
      paymentMethod,
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

      if (response.ok) {
        toast.success('Заказ оформлен успешно!', {
          position: 'top-right',
        });

        handleClearCart();
        router.push('/checkout/done');
      } else {
        alert('Ошибка: ' + result.message);
      }
    } catch (error) {
      alert('Произошла ошибка при оформлении заказа');
      console.error(error);
    }
  };

  // Вычисляем ориентировочную дату доставки (+3 дня от текущей)
  const estimatedDeliveryDate = () => {
    const currentDate = new Date();
    const deliveryDate = new Date(currentDate);
    deliveryDate.setDate(currentDate.getDate() + 3); // Прибавляем 3 дня
    return format(deliveryDate, 'dd MMMM yyyy', { locale: ru }); // Форматируем дату
  };

  const totalAmount = cartItems.reduce((total, item) => total + item.price, 0);

  if (!isMounted) {
    return null;
  }

  return (
    <div className='container mx-auto my-4'>
      <h1 className='mb-6 text-2xl font-bold'>Оформление заказа</h1>

      {isLoading ? (
        // Отображаем скелетон во время загрузки адресов
        <div className='space-y-4'>
          {[...Array(3)].map((_, i) => (
            <SkeletonAddress key={i} />
          ))}
        </div>
      ) : savedAddresses.length > 0 ? (
        <div className='mt-8'>
          <h2 className='text-xl font-semibold'>Адрес доставки</h2>

          <div className='mb-4'>
            <label className='block text-sm font-medium'>
              Выберите адрес доставки
            </label>
            <select
              className='mt-2 w-full rounded-md border border-gray-300 p-2'
              value={selectedAddressId || ''}
              onChange={(e) => setSelectedAddressId(e.target.value)}
            >
              <option value=''>-- Выбрать адрес --</option>
              {savedAddresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.addressName} - {address.city}, {address.street},{' '}
                  {address.building}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className='mt-8'>
          <h2 className='text-xl font-semibold'>Нет адреса для доставки</h2>
          <p className='text-red-500'>
            У вас нет сохранённых адресов. Пожалуйста, добавьте адрес в профиле
            для оформления заказа.
          </p>
          <Link href='/profile/address'>
            <Button className='mt-4'>
              Перейти в профиль для добавления адреса
            </Button>
          </Link>
        </div>
      )}

      {savedAddresses.length > 0 && (
        <>
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
              <p className='text-sm'>
                Ориентировочная дата доставки:{' '}
                <strong>{estimatedDeliveryDate()}</strong>
              </p>
            </div>
          </div>

          <div className='mt-8'>
            <h2 className='text-xl font-semibold'>Способ оплаты</h2>
            <div className='space-y-4'>
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

          <div className='mt-8'>
            <h2 className='text-xl font-semibold'>
              Общая сумма заказа:{' '}
              {totalAmount.toLocaleString('ru-RU', {
                style: 'currency',
                currency: 'RUB',
              })}
            </h2>
          </div>

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
        </>
      )}
    </div>
  );
}
