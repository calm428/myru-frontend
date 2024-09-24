'use client';

import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function CryptoTransactions() {
  const t = useTranslations('main');

  const { data: fetchedTransaction, error: transactionFetchError } = useSWR(
    `/api/crypto/balance/get`,
    fetcher
  );

  if (!fetchedTransaction) {
    return (
      <div className='flex justify-center'>
        <Loader2 className='animate-spin' />
      </div>
    );
  }

  return (
    <div className='mx-auto mt-8'>
      <h1 className='mb-4 text-2xl font-bold'>Крипта</h1>
      <div className='overflow-x-auto'>
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
            {fetchedTransaction.data.map((transaction: any) => (
              <tr key={transaction.ID} className='bg-gray-50 dark:bg-black'>
                <td className='whitespace-break-spaces border-b px-4 py-2'>
                  {transaction.Description}
                </td>
                <td className='border-b px-4 py-2'>{transaction.Amount}</td>
                <td className='border-b px-4 py-2'>{transaction.CreatedAt}</td>
                <td className='border-b px-4 py-2 text-right'>
                  {transaction.Status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
