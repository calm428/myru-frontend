'use client';

import { MdDashboard } from 'react-icons/md';

import { Separator } from '@/components/ui/separator';
import CTASection from '@/components/profiles/cta';
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className='p-4'>
      <CTASection
        title={t('dashboard')}
        description={t('dashboard_description')}
        icon={MdDashboard}
      />
      <Separator className='my-4' />
    </div>
  );
}
