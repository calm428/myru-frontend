'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Компонент для скелетона
const SkeletonCard = () => (
  <div className='animate-pulse rounded-lg border p-4 shadow-lg'>
    <div className='mb-4 h-6 w-32 bg-gray-300'></div>
    <div className='mb-2 h-4 w-48 bg-gray-200'></div>
    <div className='mb-2 h-4 w-40 bg-gray-200'></div>
    <div className='h-4 w-24 bg-gray-200'></div>
    <div className='mt-4 h-8 w-32 bg-blue-300'></div>
  </div>
);

interface OrderItem {
  ID: string;
  Product: string;
  Price: number;
  Quantity: number;
}

interface DeliveryAddress {
  AddressName: string;
  City: string;
  Street: string;
  Building: string;
  Apartment?: string;
  Entrance?: string;
  Floor?: string;
  Intercom?: string;
  PostalCode: string;
  PhoneNumber: string;
}

interface Order {
  ID: string;
  TotalAmount: number;
  Status: string;
  CreatedAt: string;
  OrderItems: OrderItem[];
  DeliveryAddress: DeliveryAddress;
}

// Объект для локализации статусов на русский язык
const statusTranslations: { [key: string]: string } = {
  pending: 'В обработке',
  completed: 'Отправлен',
  canceled: 'Отклонен',
};

export default function ProfilePur() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Состояние загрузки

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true); // Начало загрузки
      const response = await fetch('/api/orders/get'); // API для получения покупок
      const data = await response.json();
      setOrders(data.data);
    } catch (error) {
      console.error('Ошибка при загрузке покупок', error);
    } finally {
      setIsLoading(false); // Окончание загрузки
    }
  };

  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  return (
    <div className='container mx-auto py-6'>
      <h2 className='mb-4 text-2xl font-bold'>Ваши покупки</h2>

      {/* Отображение скелетонов во время загрузки */}
      {isLoading ? (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p>У вас нет покупок.</p>
      ) : (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {orders.map((order) => (
            <div key={order.ID} className='rounded-lg border p-4 shadow-lg'>
              <h3 className='text-lg font-semibold'>Заказ № {order.ID}</h3>
              <p>Сумма: {order.TotalAmount} ₽</p>
              <p>Статус: {statusTranslations[order.Status] || order.Status}</p>
              <p>Дата: {new Date(order.CreatedAt).toLocaleDateString()}</p>

              {/* Кнопка для открытия модального окна */}
              <Button className='mt-4' onClick={() => openModal(order)}>
                Подробнее
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно для деталей заказа */}
      {selectedOrder && (
        <Dialog open={isModalOpen} onOpenChange={closeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Детали заказа № {selectedOrder.ID}</DialogTitle>
              <DialogDescription>
                Информация о покупке и данные доставки
              </DialogDescription>
            </DialogHeader>

            <div className='mt-4'>
              <h3 className='text-lg font-semibold'>Товары:</h3>
              <ul className='list-disc pl-5'>
                {selectedOrder.OrderItems.map((item) => (
                  <li key={item.ID}>
                    {item.Product} - {item.Quantity} шт. - {item.Price} ₽
                  </li>
                ))}
              </ul>

              <h3 className='mt-4 text-lg font-semibold'>Адрес доставки:</h3>
              <p>{selectedOrder.DeliveryAddress.AddressName}</p>
              <p>
                {selectedOrder.DeliveryAddress.City},{' '}
                {selectedOrder.DeliveryAddress.Street},{' '}
                {selectedOrder.DeliveryAddress.Building}
              </p>
              {selectedOrder.DeliveryAddress.Apartment && (
                <p>Квартира: {selectedOrder.DeliveryAddress.Apartment}</p>
              )}
              {selectedOrder.DeliveryAddress.Entrance && (
                <p>Подъезд: {selectedOrder.DeliveryAddress.Entrance}</p>
              )}
              {selectedOrder.DeliveryAddress.Floor && (
                <p>Этаж: {selectedOrder.DeliveryAddress.Floor}</p>
              )}
              {selectedOrder.DeliveryAddress.Intercom && (
                <p>Домофон: {selectedOrder.DeliveryAddress.Intercom}</p>
              )}
              <p>Почтовый индекс: {selectedOrder.DeliveryAddress.PostalCode}</p>
              <p>
                Контактный телефон: {selectedOrder.DeliveryAddress.PhoneNumber}
              </p>

              <h3 className='mt-4 text-lg font-semibold'>Статус заказа:</h3>
              <p>
                {statusTranslations[selectedOrder.Status] ||
                  selectedOrder.Status}
              </p>
            </div>

            <div className='mt-4 flex justify-end'>
              <Button onClick={closeModal} variant='secondary'>
                Закрыть
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
