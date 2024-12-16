'use client';

import { useEffect, useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { PaxContext } from '@/context/context'; // Импортируем контекст

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

// Маппинг статусов на русском языке
const statusTranslations: Record<string, string> = {
  pending: 'В обработке',
  completed: 'Отправлен',
  canceled: 'Отменен',
};

export default function MySales() {
  const [sales, setSales] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusOptions] = useState(['pending', 'completed', 'canceled']); // Статусы заказа
  const [newStatus, setNewStatus] = useState('pending'); // Статус для обновления
  const { user } = useContext(PaxContext); // Достаем информацию о пользователе из контекста
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false); // Модальное окно для конвертации

  useEffect(() => {
    if (user?.seller) {
      fetchSales();
    }
  }, [user]);

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales');
      const data = await response.json();
      setSales(data.data);
    } catch (error) {
      console.error('Ошибка при загрузке продаж', error);
    }
  };

  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.Status); // Устанавливаем текущий статус
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  // Обновление статуса заказа
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success('Статус заказа обновлен!');
        fetchSales(); // Обновляем список заказов после изменения статуса
        closeModal();
      } else {
        toast.error('Ошибка при обновлении статуса');
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса', error);
      toast.error('Ошибка при обновлении статуса');
    }
  };

  // Открытие модального окна для конвертации аккаунта в продавца
  const openConversionModal = () => {
    setIsConversionModalOpen(true);
  };

  const closeConversionModal = () => {
    setIsConversionModalOpen(false);
  };

  const handleConvertToSeller = async () => {
    // Логика отправки запроса на конвертацию аккаунта
    try {
      const response = await fetch('/api/convert-to-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (response.ok) {
        toast.success('Запрос на конвертацию отправлен!');
        closeConversionModal();
      } else {
        toast.error('Ошибка при отправке запроса');
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса', error);
      toast.error('Ошибка при отправке запроса');
    }
  };

  return (
    <div className='container mx-auto py-6'>
      {user?.seller ? (
        <>
          <h2 className='mb-4 text-2xl font-bold'>Продажи</h2>

          {/* Отображение списка продаж */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {sales.map((sale) => (
              <div key={sale.ID} className='rounded-lg border p-4 shadow-lg'>
                <h3 className='text-lg font-semibold'>Заказ № {sale.ID}</h3>
                <p>Сумма: {sale.TotalAmount} ₽</p>
                <p>Статус: {statusTranslations[sale.Status]}</p>
                <p>Дата: {new Date(sale.CreatedAt).toLocaleDateString()}</p>

                {/* Кнопка для открытия модального окна */}
                <Button className='mt-4' onClick={() => openModal(sale)}>
                  Подробнее
                </Button>
              </div>
            ))}
          </div>

          {/* Модальное окно для деталей заказа */}
          {selectedOrder && (
            <Dialog open={isModalOpen} onOpenChange={closeModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Детали заказа № {selectedOrder.ID}</DialogTitle>
                  <DialogDescription>
                    Информация о продаже и данные клиента
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

                  <h3 className='mt-4 text-lg font-semibold'>
                    Адрес доставки:
                  </h3>
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
                  <p>
                    Почтовый индекс: {selectedOrder.DeliveryAddress.PostalCode}
                  </p>
                  <p>
                    Контактный телефон:{' '}
                    {selectedOrder.DeliveryAddress.PhoneNumber}
                  </p>

                  <h3 className='mt-4 text-lg font-semibold'>
                    Изменить статус:
                  </h3>
                  <select
                    className='mt-2 w-full rounded-md border p-2'
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {statusTranslations[status]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='mt-4 flex justify-end gap-2'>
                  <Button
                    onClick={() =>
                      updateOrderStatus(selectedOrder.ID, newStatus)
                    }
                    className='bg-blue-500 text-white'
                  >
                    Обновить статус
                  </Button>
                  <Button onClick={closeModal} variant='secondary'>
                    Закрыть
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      ) : (
        <div className='text-center'>
          <h2 className='text-xl font-bold'>
            Ваш аккаунт не является продавцом.
          </h2>
          <Button onClick={openConversionModal} className='mt-4'>
            Конвертировать аккаунт в продавца
          </Button>

          {/* Модальное окно для конвертации аккаунта */}
          <Dialog
            open={isConversionModalOpen}
            onOpenChange={closeConversionModal}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Конвертация аккаунта</DialogTitle>
                <DialogDescription>
                  Хотите конвертировать ваш аккаунт в аккаунт продавца? Это
                  позволит вам продавать товары и услуги на платформе.
                </DialogDescription>
              </DialogHeader>
              <div className='mt-4 flex justify-end'>
                <Button
                  onClick={handleConvertToSeller}
                  className='bg-blue-500 text-white'
                >
                  Подтвердить
                </Button>
                <Button onClick={closeConversionModal} variant='secondary'>
                  Отмена
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
