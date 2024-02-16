'use client';

import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FilterModal } from './filter-modal';

export function CTASection() {
  const t = useTranslations('main');
  const searchParams = useSearchParams();
  const router = useRouter();
  const [keyword, setKeyword] = useState<string>(
    searchParams.get('title') && searchParams.get('title') !== 'all'
      ? searchParams.get('title') || ''
      : ''
  );

  const handleSearch = useDebouncedCallback((value: string) => {
    setKeyword(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('title', value.trim() || 'all');

    router.push(`?${newSearchParams.toString()}`);
  }, 300);

  return (
    <div className='flex flex-col items-start justify-start gap-3 sm:flex-row sm:justify-between'>
      <ToggleGroup
        type='single'
        variant='outline'
        value={searchParams.get('mode') || 'flow'}
        className='w-auto gap-0 rounded-lg shadow-lg'
        onValueChange={(value: string) => {
          if (value) {
            router.push(`?mode=${value}`);
          }
        }}
      >
        <ToggleGroupItem
          value='profile'
          className={`rounded-r-none  bg-card-gradient-menu`}
        >
          {t('profile')}
        </ToggleGroupItem>
        <ToggleGroupItem
          value='flow'
          className={`rounded-l-none border-l-0 bg-card-gradient-menu`}
        >
          {t('flow')}
        </ToggleGroupItem>
      </ToggleGroup>

      <div className='flex w-full gap-3 sm:w-auto'>
        <div className='relative w-full sm:w-80'>
          <Search className='absolute inset-y-0 left-3 my-auto size-4 text-gray-500' />
          <Input
            type='text'
            placeholder={t('search')}
            className='pl-12 pr-4 dark:bg-input'
            defaultValue={keyword}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <FilterModal />
      </div>
    </div>
  );
}