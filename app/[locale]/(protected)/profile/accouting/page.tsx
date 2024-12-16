'use client';

import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { NewInvoice } from '@/components/profiles/setting/request4newBank';
import { Separator } from '@/components/ui/separator';
import FiatTransactions from '@/components/accounting/FiatTransactions';
import CryptoTransactions from '@/components/accounting/CryptoTransactions';
import BackButton from '@/components/home/back-button';

export default function AccountingPage() {
  const t = useTranslations('main');
  const [isRechargeLoading, setIsRechargeLoading] = useState(false);
  const [openBankModal, setOpenBankModal] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Получение активной вкладки из параметров URL
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'crypto');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Обновление URL с параметром `tab`
    router.push(`${pathname}?tab=${tab}`);
  };

  return (
    <div className='container px-3 py-4'>
      <BackButton callback={searchParams.get('callback') || ''} />

      {/* <div className='text-2xl font-semibold'>{t('accounting')}</div> */}

      {/* Вкладки для выбора между Фиат и Крипта */}
      <div className='mt-4 flex'>
        {/* <div
          className={`me-2 w-full cursor-pointer ${
            activeTab === 'fiat' ? 'border-b-2 border-primary' : ''
          }`}
          onClick={() => handleTabChange('fiat')}
        >
          <div
            className={`inline-flex w-full items-center justify-center p-4 ${
              activeTab === 'fiat' ? 'text-primary' : 'text-gray-500'
            }`}
          >
            Фиат
          </div>
        </div> */}
        <div
          className={`me-2 w-full cursor-pointer ${
            activeTab === 'crypto' ? 'border-b-2 border-primary' : ''
          }`}
          onClick={() => handleTabChange('crypto')}
        >
          <div
            className={`inline-flex w-full items-start justify-start py-4 ${
              activeTab === 'crypto' ? 'text-primary' : 'text-gray-500'
            }`}
          >
            Данные кошелька
          </div>
        </div>
      </div>

      <Separator />

      {/* Отображение контента на основе выбранной вкладки */}
      {/* {activeTab === 'fiat' && <FiatTransactions />} */}
      {activeTab === 'crypto' && <CryptoTransactions />}
    </div>
  );
}
