'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { formatDateNew, formatAmount, getStatusTranslation } from '@/lib/utils';
import toast from 'react-hot-toast';
import { NewInvoice } from '@/components/profiles/setting/request4newBank';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function AccountingPage() {
  const t = useTranslations('main');
  const [rechargecode, setRechargecode] = useState('');
  const [isRechargeLoading, setIsRechargeLoading] = useState(false);
  const [openBankModal, setOpenBankModal] = useState(false);

  const { data: fetchedTransaction, error: transactionFetchError } = useSWR(
    `/api/profiles/balance/get`,
    fetcher
  );

  const submitBankRecharge = async () => {
    setOpenBankModal(true);
  };

  return (
    <div className='container px-3 py-4'>
      <div className='text-2xl font-semibold'>{t('accounting')}</div>
      <div className='mt-4 flex w-full  items-start gap-4'>
        {/* <Input
        placeholder={t('enter_recharge_code')}
        value={rechargecode}
        onChange={(e) => setRechargecode(e.target.value)}
      ></Input>
      <Button
        onClick={submitRechargecode}
        className='btn btn--wide !rounded-md'
      >
        {isRechargeLoading && (
          <Loader2 className='mr-2 size-4 animate-spin' />
        )}
        {t('recharge_via_code')}
      </Button> */}
        <Button
          onClick={submitBankRecharge}
          className='btn btn--wide float-left !m-0 !rounded-md'
        >
          {isRechargeLoading && (
            <Loader2 className='mr-2 size-4 animate-spin' />
          )}
          {t('recharge_via_bank_card')}
        </Button>
        <NewInvoice
          openBankModal={openBankModal}
          setOpenBankModal={setOpenBankModal}
          requestType='payment'
        />
      </div>
      <div>
        <div className=' mx-auto mt-8'>
          <h1 className='mb-4 text-2xl font-bold'>{t('transactions')}</h1>
          <div className='overflow-x-auto'>
            <table className='responsive-table min-w-full shadow-sm'>
              <thead>
                <tr className='bg-gray-100 dark:bg-black'>
                  <th className='border-b px-4 py-2 text-left'>
                    {t('transaction_description')}
                  </th>
                  <th className='border-b px-4 py-2 text-left'>
                    {t('amount')}
                  </th>
                  <th className='border-b px-4 py-2 text-left'>{t('date')}</th>

                  <th className='border-b px-4 py-2 text-right'>
                    {t('status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {fetchedTransaction && fetchedTransaction.data ? (
                  fetchedTransaction.data.map((transaction: any) => (
                    <tr
                      key={transaction.ID}
                      className='bg-gray-50 dark:bg-black'
                    >
                      <td
                        data-label={t('transaction_description')}
                        className='whitespace-break-spaces border-b px-4 py-2'
                      >
                        {getStatusTranslation<typeof t>(
                          transaction.Description,
                          t
                        )}
                      </td>
                      <td
                        data-label={t('amount')}
                        className='border-b px-4 py-2'
                      >
                        {formatAmount(transaction.Amount)}
                      </td>
                      <td data-label={t('date')} className='border-b px-4 py-2'>
                        {' '}
                        {formatDateNew(transaction.CreatedAt)}
                      </td>
                      <td
                        data-label={t('status')}
                        className='border-b px-4 py-2 text-right'
                      >
                        {getStatusTranslation<typeof t>(transaction.Status, t)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className='border-b px-4 py-2'>
                      Loading...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
