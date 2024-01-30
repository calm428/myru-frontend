import { useTranslation } from 'next-i18next';
import { SectionBadge } from '../common/section-badge';
import { SectionDescription } from '../common/section-description';
import { SectionTitle } from '../common/section-title';
import { Button } from '../ui/button';

export function AboutSection() {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col items-center justify-center px-0 pb-[40px] md:pb-[80px]'>
      <SectionBadge>{t('about')}</SectionBadge>
      <SectionTitle className='px-7 leading-[30px]'>
        {t('what_is_paxintrade')}
      </SectionTitle>
      <SectionDescription className='px-7 leading-[25.15px]'>
        {t('what_is_paxintrade_description')}
      </SectionDescription>
      <div className='relative mt-10 flex w-full items-center justify-center'>
        <Button
          className='w-36'
          aria-label='About us'
          style={{
            boxShadow: '0px 4px 15px 8px rgba(88, 170, 241, 0.15)',
          }}
        >
          {t('about_us')}
        </Button>
      </div>
    </div>
  );
}
