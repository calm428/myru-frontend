'use client';

import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { SiPastebin } from 'react-icons/si';

// Определение типов данных
interface TransactionType {
  OnlineTime?: {
    online_time: number;
    reward_amount: number;
  };
  // Добавьте другие типы транзакций здесь
}

interface TransactionResponse {
  id: string;
  hash: string;
  data: string;
  timestamp: string;
  transaction_type: TransactionType;
  user_id: string;
  signature: number[];
}

type TransactionsResponse = TransactionResponse[];

interface BalanceResponse {
  balance: number;
  wallet: string;
  public_key: string;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function CryptoTransactions() {
  const t = useTranslations('main');
  const [isRechargeLoading, setIsRechargeLoading] = useState(false);
  const [walletData, setWalletData] = useState<{
    address: string;
    public_key: string;
  } | null>(null);
  const [walletCreated, setWalletCreated] = useState(false);

  // Запрос к API для получения баланса
  const { data: fetchedBalance, error: balanceFetchError } =
    useSWR<BalanceResponse>('/api/crypto/balance/get', fetcher);

  // Запрос к API для получения транзакций
  const { data: fetchedTransactions, error: transactionsFetchError } =
    useSWR<TransactionsResponse>('/api/crypto/transactions/get', fetcher);

  // Асинхронная функция для создания кошелька
  async function createWallet() {
    setIsRechargeLoading(true);
    try {
      const response = await axios.post('/api/crypto/wallet/create');
      const { address, public_key } = response.data.balance;
      setWalletData({ address, public_key });
      setWalletCreated(true);
    } catch (error) {
      console.error('Ошибка создания кошелька:', error);
      alert('Ошибка при создании кошелька');
    } finally {
      setIsRechargeLoading(false);
    }
  }

  // Обработка ошибок загрузки баланса или транзакций
  if (balanceFetchError || transactionsFetchError) {
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
  if (!fetchedBalance || !fetchedTransactions) {
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
        <p>Баланс вашего криптокошелька: {fetchedBalance.balance}</p>
        <div>
          <SiPastebin size={24} />
          <p className='break-words text-sm'>
            Адрес кошелька: <strong>{fetchedBalance.wallet}</strong>
          </p>
        </div>
        <div>
          <SiPastebin size={24} />
          <p className='break-words text-sm'>
            Ключ: <strong>{fetchedBalance.public_key}</strong>
          </p>
        </div>
      </p>

      {/* Таблица транзакций */}
      <div className='mt-8 overflow-x-auto'>
        <table className='responsive-table min-w-full shadow-sm'>
          <thead>
            <tr className='bg-gray-100 dark:bg-black'>
              <th className='border-b px-4 py-2 text-left'>
                {t('transaction_description')}
              </th>
              <th className='border-b px-4 py-2 text-left'>{t('amount')}</th>
              <th className='border-b px-4 py-2 text-left'>{t('date')}</th>
              <th className='border-b px-4 py-2 text-right'>{t('status')}</th>
            </tr>
          </thead>
          <tbody>
            {fetchedTransactions.map((transaction) => (
              <tr key={transaction.id} className='bg-gray-50 dark:bg-black'>
                <td className='whitespace-break-spaces border-b px-4 py-2'>
                  {transaction.data}
                </td>
                <td className='border-b px-4 py-2'>
                  {transaction.transaction_type?.OnlineTime?.reward_amount ||
                    '—'}
                </td>
                <td className='border-b px-4 py-2'>
                  {new Date(transaction.timestamp).toLocaleString()}
                </td>
                <td className='border-b px-4 py-2 text-right'>
                  {/* Определение статуса на основе типа транзакции */}
                  {transaction.transaction_type?.OnlineTime
                    ? 'Completed'
                    : 'Pending'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
