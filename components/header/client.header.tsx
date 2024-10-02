'use client';
import React from 'react';
import { MobileMenu } from './mobile-menu';
import { RightNav } from './right-nav';
import { usePathname } from 'next/navigation';
import { MainNav } from '@/components/header/main-nav';
import { siteConfig } from '@/config/site';
import AlarmNav from './alarm-nav';
import Notification from './notification';
import dynamic from 'next/dynamic';

// Динамически импортируем клиентский компонент для корзины
const DynamicCartIcon = dynamic(() => import('@/components/cart/CartIcon'), {
  ssr: false,
});

interface ClientHeaderProps {
  data: {
    data: {
      user: {
        email: string;
        photo: string;
        name: string;
      };
    };
  } | null;
}

export default function ClientHeader({ data }: ClientHeaderProps) {
  const pathname = usePathname();

  return !pathname.includes('/meet/') ? (
    <header className={`bg-h sticky top-0 z-50 w-full bg-background`}>
      <div className='border-gardient-h relative top-[57px] w-full'></div>
      <div className='flex h-14 items-center space-x-4 px-2 sm:justify-between sm:space-x-0 md:px-4'>
        <MainNav items={siteConfig.mainNav} />
        <div className='flex items-center gap-4'>
          <AlarmNav authenticated={!!data} />
          <DynamicCartIcon /> {/* Отображаем иконку корзины динамически */}{' '}
          <Notification authenticated={!!data} />
        </div>
        <RightNav
          user={
            data
              ? {
                  email: data.data.user.email,
                  avatar: data.data.user.photo,
                  username: data.data.user.name,
                }
              : null
          }
        />
        <MobileMenu
          user={
            data
              ? {
                  email: data.data.user.email,
                  avatar: data.data.user.photo,
                  username: data.data.user.name,
                }
              : null
          }
        />
      </div>
    </header>
  ) : null;
}
