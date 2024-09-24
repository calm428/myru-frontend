'use client';

import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { SiPastebin } from 'react-icons/si';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function CryptoTransactions() {
  const t = useTranslations('main');
  const [isRechargeLoading, setIsRechargeLoading] = useState(false);
  const [walletData, setWalletData] = useState<any>(null); // Добавляем состояние для хранения информации о кошельке
  const [walletCreated, setWalletCreated] = useState(false); // Состояние для отслеживания созданного кошелька

  const { data: fetchedTransaction, error: transactionFetchError } = useSWR(
    `/api/crypto/balance/get`,
    fetcher
  );

  // Асинхронная функция для создания кошелька
  async function createWallet() {
    setIsRechargeLoading(true);
    try {
      const response = await axios.post('/api/crypto/wallet/create');
      const { address, public_key } = response.data.balance;
      setWalletData({ address, public_key }); // Сохраняем данные кошелька
      setWalletCreated(true); // Отмечаем, что кошелек создан
    } catch (error) {
      console.error('Ошибка создания кошелька:', error);
      alert('Ошибка при создании кошелька');
    } finally {
      setIsRechargeLoading(false);
    }
  }

  // Если произошла ошибка загрузки баланса
  if (transactionFetchError) {
    // Проверяем, если кошелек еще не создан
    if (!walletCreated) {
      return (
        <div className='my-8 flex flex-col items-center justify-center gap-8'>
          <p className='text-center text-red-500'>Кошелек еще не создан</p>
          <Button
            onClick={createWallet}
            className='btn btn--wide float-left !m-0 !max-w-md !rounded-md'
          >
            {isRechargeLoading && (
              <Loader2 className='mr-2 size-4 animate-spin' />
            )}
            {!isRechargeLoading && 'Создать крипто кошелек'}
          </Button>
        </div>
      );
    } else {
      // После успешного создания кошелька показываем информацию о нем
      return (
        <div className='my-8 flex flex-col items-center justify-center gap-8'>
          <p className='text-center text-green-500'>Кошелек успешно создан!</p>
          <p className='break-words text-center text-sm'>
            Ваш адрес: <strong>{walletData?.address}</strong>
          </p>
          <SiPastebin size={16} />

          <p className='break-words text-center text-sm'>
            Ваш публичный ключ: <strong>{walletData?.public_key}</strong>
          </p>
        </div>
      );
    }
  }

  // Если данные еще загружаются
  if (!fetchedTransaction) {
    return (
      <div className='my-8 flex justify-center'>
        <Loader2 className='animate-spin' />
      </div>
    );
  }

  // Отображение данных транзакций, если кошелек уже создан
  return (
    <div className='mx-auto mt-8'>
      <h1 className='mb-4 text-2xl font-bold'>Крипта</h1>
      <p className='flex flex-col gap-4 text-lg'>
        <p>Баланс вашего криптокошелька: {fetchedTransaction.data?.balance}</p>
        <div>
          {' '}
          <SiPastebin size={24} />
          <p className='break-words text-sm'>
            Адрес кошелька {fetchedTransaction.data?.Wallet}{' '}
          </p>
        </div>
        <div>
          <SiPastebin size={24} />
          <p className=' break-words text-sm'>
            Ключ {fetchedTransaction.data?.Public_key}
          </p>
        </div>
      </p>
    </div>
  );
}
