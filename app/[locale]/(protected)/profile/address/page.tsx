'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Address {
  id: string;
  addressName: string;
  city: string;
  street: string;
  building: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
  postalCode: string;
  phoneNumber: string;
}

const AddressManager = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/addresses');
      const data = await response.json();

      const formattedAddresses = data.data.data.map((address: any) => ({
        id: address.ID,
        addressName: address.AddressName,
        city: address.City,
        street: address.Street,
        building: address.Building,
        apartment: address.Apartment,
        entrance: address.Entrance,
        floor: address.Floor,
        intercom: address.Intercom,
        postalCode: address.PostalCode,
        phoneNumber: address.PhoneNumber,
      }));

      setAddresses(formattedAddresses);
    } catch (error) {
      console.error('Ошибка при получении адресов', error);
    }
    setIsLoading(false);
  };

  const validateForm = () => {
    if (
      !selectedAddress?.addressName ||
      !selectedAddress?.city ||
      !selectedAddress?.street ||
      !selectedAddress?.building ||
      !selectedAddress?.postalCode ||
      !selectedAddress?.phoneNumber
    ) {
      setErrorMessage('Все обязательные поля должны быть заполнены');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `/api/addresses/${selectedAddress?.id}`
      : '/api/addresses';

    try {
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedAddress),
      });
      fetchAddresses();
      setSelectedAddress(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Ошибка при сохранении адреса', error);
    }
    setIsLoading(false);
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;

    setIsLoading(true);
    try {
      await fetch(`/api/addresses/${addressToDelete.id}`, {
        method: 'DELETE',
      });
      fetchAddresses();
      setAddressToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Ошибка при удалении адреса', error);
    }
    setIsLoading(false);
  };

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = (address: Address) => {
    setAddressToDelete(address);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedAddress(null);
    setIsEditing(false);
    setIsModalOpen(false);
    setErrorMessage('');
  };

  return (
    <div className='container mx-auto py-6'>
      <h1 className='pb-4 text-3xl font-bold'>Ваши адреса доставки</h1>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <button
            className='mb-4 rounded bg-green-500 px-4 py-2 text-white'
            onClick={() => {
              setSelectedAddress({
                id: '',
                addressName: '',
                city: '',
                street: '',
                building: '',
                postalCode: '',
                phoneNumber: '',
              });
              setIsEditing(false);
              setIsModalOpen(true);
            }}
          >
            Добавить новый адрес
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Редактировать адрес' : 'Добавить новый адрес'}
            </DialogTitle>
            <DialogDescription>
              Заполните форму ниже для{' '}
              {isEditing ? 'редактирования' : 'добавления'} адреса.
            </DialogDescription>
          </DialogHeader>
          {errorMessage && <p className='mb-4 text-red-500'>{errorMessage}</p>}
          <form>
            <label className='mb-2 block text-sm font-medium'>
              Название адреса (Дом, Офис)
            </label>
            <input
              type='text'
              value={selectedAddress?.addressName || ''}
              onChange={(e) =>
                setSelectedAddress({
                  ...selectedAddress!,
                  addressName: e.target.value,
                })
              }
              className='mb-4 w-full rounded border p-2'
            />

            <label className='mb-2 block text-sm font-medium'>Город</label>
            <input
              type='text'
              value={selectedAddress?.city || ''}
              onChange={(e) =>
                setSelectedAddress({
                  ...selectedAddress!,
                  city: e.target.value,
                })
              }
              className='mb-4 w-full rounded border p-2'
            />

            <label className='mb-2 block text-sm font-medium'>Улица</label>
            <input
              type='text'
              value={selectedAddress?.street || ''}
              onChange={(e) =>
                setSelectedAddress({
                  ...selectedAddress!,
                  street: e.target.value,
                })
              }
              className='mb-4 w-full rounded border p-2'
            />

            <label className='mb-2 block text-sm font-medium'>Номер дома</label>
            <input
              type='text'
              value={selectedAddress?.building || ''}
              onChange={(e) =>
                setSelectedAddress({
                  ...selectedAddress!,
                  building: e.target.value,
                })
              }
              className='mb-4 w-full rounded border p-2'
            />

            <label className='mb-2 block text-sm font-medium'>
              Почтовый индекс
            </label>
            <input
              type='text'
              value={selectedAddress?.postalCode || ''}
              onChange={(e) =>
                setSelectedAddress({
                  ...selectedAddress!,
                  postalCode: e.target.value,
                })
              }
              className='mb-4 w-full rounded border p-2'
            />

            <label className='mb-2 block text-sm font-medium'>
              Контактный телефон
            </label>
            <input
              type='text'
              value={selectedAddress?.phoneNumber || ''}
              onChange={(e) =>
                setSelectedAddress({
                  ...selectedAddress!,
                  phoneNumber: e.target.value,
                })
              }
              className='mb-4 w-full rounded border p-2'
            />
          </form>
          <DialogFooter>
            <button
              onClick={handleSaveAddress}
              className='rounded bg-blue-500 px-4 py-2 text-white'
            >
              {isEditing ? 'Обновить' : 'Сохранить'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтвердите удаление</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Вы уверены, что хотите удалить этот адрес?
          </DialogDescription>
          <DialogFooter>
            <button
              onClick={handleDeleteAddress}
              className='rounded bg-red-500 px-4 py-2 text-white'
            >
              Да, удалить
            </button>
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className='rounded  px-4 py-2'
            >
              Отмена
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className='text-left'>
          <p className='text-lg font-semibold '>
            У вас нет сохранённых адресов.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {addresses.map((address) => (
            <div key={address.id} className='rounded-lg border p-4 shadow-lg'>
              <h2 className='text-xl font-semibold'>{address.addressName}</h2>
              <p className='text-sm'>
                {address.city}, {address.street}, {address.building}
                {address.apartment && `, кв. ${address.apartment}`}
              </p>
              <p className='text-sm '>Почтовый индекс: {address.postalCode}</p>
              <p className='text-sm '>Телефон: {address.phoneNumber}</p>

              <div className='mt-4 flex items-center justify-between'>
                <button
                  className='inline-block rounded bg-blue-500 px-4 py-2 text-white'
                  onClick={() => handleEditAddress(address)}
                >
                  Редактировать
                </button>
                <button
                  className='ml-4 inline-block rounded bg-red-500 px-4 py-2 text-white'
                  onClick={() => handleConfirmDelete(address)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Компонент скелетона для загрузки
const SkeletonCard = () => (
  <div className='animate-pulse rounded-lg border p-4 shadow-lg'>
    <div className='mb-4 h-6 w-32 bg-gray-300'></div>
    <div className='mb-2 h-4 w-48 bg-gray-200'></div>
    <div className='mb-2 h-4 w-40 bg-gray-200'></div>
    <div className='h-4 w-24 bg-gray-200'></div>
    <div className='mt-4 h-8 w-32 bg-blue-300'></div>
  </div>
);

export default AddressManager;
