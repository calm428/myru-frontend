'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { FaRegCopy } from 'react-icons/fa';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useEffect } from 'react';

import toast from 'react-hot-toast';
interface FormValues {
  walletAddress: any;
  from_wallet: string;
  to_wallet: string;
  amount: number;
  public_key: string;
}
// Определение типов данных
interface TransactionType {
  OnlineTime?: {
    online_time: number;
    reward_amount: number;
  };
  FiatConversion?: {
    from_currency: string;
    to_currency: string;
    amount: number;
    conversion_rate: number;
    wallet_address: string;
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

interface TransactionsAPIResponse {
  data: TransactionResponse[];
  status: string;
}

interface BalanceResponse {
  data: any;
  balance: number;
  wallet: string;
  public_key: string;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.success('Скопировано в буфер обмена', {
        position: 'top-right',
      });
    })
    .catch((err) => {
      toast.error('Не удалось скопировать текст', {
        position: 'top-right',
      });
    });
};

export default function CryptoTransactions() {
  const t = useTranslations('main');
  const [isRechargeLoading, setIsRechargeLoading] = useState(false);
  const [walletData, setWalletData] = useState<{
    address: string;
    public_key: string;
  } | null>(null);
  const [walletCreated, setWalletCreated] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Отслеживаем процесс отправки

  // Запрос к API для получения баланса
  const { data: fetchedBalance, error: balanceFetchError } =
    useSWR<BalanceResponse>('/api/crypto/balance/get', fetcher);

  // Запрос к API для получения транзакций
  const { data: fetchedTransactions, error: transactionsFetchError } =
    useSWR<TransactionsAPIResponse>('/api/crypto/transactions/get', fetcher);

  // Асинхронная функция для создания кошелька
  async function createWallet() {
    setIsRechargeLoading(true);
    try {
      const response = await axios.post('/api/crypto/wallet/create');
      const { address, public_key } = response.data.balance;
      setWalletData({ address, public_key });
      setWalletCreated(true);
    } catch (error) {
      toast.error('Ошибка при создании кошелька', {
        position: 'top-right',
      });
    } finally {
      setIsRechargeLoading(false);
    }
  }

  const {
    register,
    handleSubmit,
    setValue, // Используем для задания начальных значений
    formState: { errors },
  } = useForm<FormValues>();

  // Устанавливаем значения полей при загрузке данных
  useEffect(() => {
    if (fetchedBalance?.data?.wallet) {
      setValue('from_wallet', fetchedBalance.data.wallet);
    }
    if (fetchedBalance?.data?.public_key) {
      setValue('public_key', fetchedBalance.data.public_key);
    }
  }, [fetchedBalance, setValue]);

  // Функция для отправки данных на API
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true); // Начинаем процесс отправки
    try {
      const response = await axios.post('/api/crypto/wallet/send', {
        to_wallet: data.walletAddress,
        public_key: data.public_key,
        from_wallet: data.from_wallet,
        amount: data.amount,
      });
      toast.success('Перевод успешно выполнен', {
        position: 'top-right',
      });
      setOpenModal(false);
    } catch (error) {
      toast.error('Ошибка при отправке данных', {
        position: 'top-right',
      });
    } finally {
      setIsSubmitting(false); // Завершаем процесс отправки
    }
  };

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
        <div className='tems-center my-8 justify-center gap-8'>
          <p className='text-center text-green-500'>Кошелек успешно создан!</p>
          <p className='break-words text-center text-sm'>
            Ваш адрес: <strong>{walletData?.address}</strong>
          </p>
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
        <span>
          <p className='my-4 items-center gap-4'>
            Баланс вашего криптокошелька: {fetchedBalance.data.balance} RUDT
            {/* <Image
              src='/logo-circle.svg'
              className='rounded-full'
              alt=''
              width={40}
              height={40}
            /> */}
          </p>
          <Button
            onClick={() => setOpenModal(true)}
            className='btn btn--wide float-left !m-0 !rounded-md'
          >
            {isRechargeLoading && (
              <Loader2 className='mr-2 size-4 animate-spin' />
            )}
            Сделать перевод
          </Button>
        </span>

        {/* Модальное окно для ввода адреса кошелька */}
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Перевод средств</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Поле для ввода адреса отправителя (from_wallet) */}
              <div className='mb-4'>
                <label
                  htmlFor='from_wallet'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-100'
                >
                  Адрес кошелька отправителя
                </label>
                <Input
                  id='from_wallet'
                  type='text'
                  disabled
                  defaultValue={fetchedBalance?.data?.wallet} // Используем defaultValue для неконтролируемых форм
                  {...register('from_wallet', {
                    required: false, // Отключаем обязательность, так как поле заблокировано
                    pattern: {
                      value: /^0x[a-fA-F0-9]{64}$/, // Ethereum-кошелек (40 символов после 0x)
                      message: 'Неверный формат кошелька (0x...)',
                    },
                  })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errors.from_wallet ? 'border-red-500' : ''
                  }`}
                />
                {errors.from_wallet && (
                  <p className='mt-2 text-sm text-red-600'>
                    {errors.from_wallet.message}
                  </p>
                )}
              </div>

              {/* Поле для ввода публичного ключа (public_key) */}
              <div className='mb-4'>
                <label
                  htmlFor='public_key'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-100'
                >
                  Ключ подписи
                </label>
                <Input
                  disabled
                  id='public_key'
                  type='text'
                  defaultValue={fetchedBalance?.data?.public_key} // Используем defaultValue для неконтролируемых форм
                  {...register('public_key', {
                    required: false, // Отключаем обязательность, так как поле заблокировано
                  })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errors.public_key ? 'border-red-500' : ''
                  }`}
                />
                {errors.public_key && (
                  <p className='mt-2 text-sm text-red-600'>
                    {errors.public_key.message}
                  </p>
                )}
              </div>

              {/* Поле для ввода адреса получателя (to_wallet) */}
              <div className='mb-4'>
                <label
                  htmlFor='to_wallet'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-100'
                >
                  Адрес кошелька получателя
                </label>
                <Input
                  id='to_wallet'
                  type='text'
                  {...register('to_wallet', {
                    required: 'Поле обязательно',
                    pattern: {
                      value: /^0x[a-fA-F0-9]{64}$/, // Ethereum-кошелек (40 символов после 0x)
                      message: 'Неверный формат кошелька (0x...)',
                    },
                  })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errors.to_wallet ? 'border-red-500' : ''
                  }`}
                />
                {errors.to_wallet && (
                  <p className='mt-2 text-sm text-red-600'>
                    {errors.to_wallet.message}
                  </p>
                )}
              </div>

              {/* Поле для ввода суммы (amount) */}
              <div className='mb-4'>
                <label
                  htmlFor='amount'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-100'
                >
                  Сумма перевода
                </label>
                <Input
                  id='amount'
                  type='number'
                  step='any'
                  {...register('amount', {
                    required: 'Поле обязательно',
                    min: {
                      value: 0.01,
                      message: 'Минимальная сумма перевода: 0.01',
                    },
                  })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errors.amount ? 'border-red-500' : ''
                  }`}
                />
                {errors.amount && (
                  <p className='mt-2 text-sm text-red-600'>
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type='submit'
                  className='btn btn--wide'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className='mr-2 size-4 animate-spin' />
                  ) : (
                    'Отправить'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <div>
          <span className=''>
            <p className='break-all text-sm'>
              <FaRegCopy
                size={24}
                className='float-left mr-2'
                onClick={() => copyToClipboard(fetchedBalance.data.wallet)}
              />
              Адрес кошелька: <strong>{fetchedBalance.data.wallet}</strong>
            </p>
          </span>
        </div>
        <div>
          <span className=''>
            <FaRegCopy
              size={24}
              className='float-left mr-2'
              onClick={() => copyToClipboard(fetchedBalance.data.public_key)}
            />
            <p className='break-all text-sm'>
              Ключ: <strong>{fetchedBalance.data.public_key}</strong>
            </p>
          </span>
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
            {fetchedTransactions.data.map((transaction) => (
              <tr key={transaction.id} className='bg-gray-50 dark:bg-black'>
                <td className='whitespace-break-spaces border-b px-4 py-2'>
                  {/* Определяем данные в зависимости от типа транзакции */}
                  {transaction.transaction_type?.OnlineTime ? (
                    <>
                      Онлайн время:{' '}
                      {transaction.transaction_type.OnlineTime.online_time}{' '}
                      минут
                    </>
                  ) : transaction.transaction_type?.FiatConversion ? (
                    <>
                      Конвертация:{' '}
                      {transaction.transaction_type.FiatConversion.amount}{' '}
                      {
                        transaction.transaction_type.FiatConversion
                          .from_currency
                      }{' '}
                      →{' '}
                      {transaction.transaction_type.FiatConversion.to_currency}{' '}
                      по курсу{' '}
                      {
                        transaction.transaction_type.FiatConversion
                          .conversion_rate
                      }{' '}
                      к 1
                    </>
                  ) : (
                    transaction.data
                  )}
                </td>
                <td className='flex flex-row items-center gap-2 border-b px-4 py-2'>
                  {transaction.transaction_type?.OnlineTime?.reward_amount ||
                    transaction.transaction_type?.FiatConversion?.amount ||
                    '—'}{' '}
                  RUDT
                  {/* <Image
                    src='/logo-circle.svg'
                    className='rounded-full'
                    alt=''
                    width={20}
                    height={20}
                  /> */}
                </td>
                <td className='border-b px-4 py-2'>
                  {new Date(transaction.timestamp).toLocaleString()}
                </td>
                <td className='border-b px-4 py-2 text-right'>
                  {/* Определение статуса на основе типа транзакции */}
                  Исполнен
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
