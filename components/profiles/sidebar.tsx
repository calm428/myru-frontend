'use client';

import { HiUserGroup } from 'react-icons/hi';
import { MdDashboard } from 'react-icons/md';
import { RiArticleLine, RiUserSettingsFill } from 'react-icons/ri';
import { useContext, useState } from 'react';

import { NavItem } from '@/types/nav';
import { cn } from '@/lib/utils';

import { ProfileNav } from './profile-nav';
import { usePathname } from '@/navigation';
import { PaxContext } from '@/context/context';

const navItems: NavItem[] = [
  {
    title: 'dashboard',
    href: '/profile/dashboard',
    disabled: false,
    external: false,
    icon: MdDashboard,
    label: 'Dashboard',
    description: '',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Лента', href: '/profile/dashboard' },
      { label: 'Товары', href: '/profile/dashboard?tabs=products' },
    ],
  },
  {
    title: 'my_posts',
    href: '/profile/posts',
    disabled: false,
    external: false,
    icon: RiArticleLine,
    label: 'My Posts',
    description: '',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Витрина', href: '/profile/posts' },
      { label: 'Продажи', href: '/profile/posts?tabs=sales' },
    ],
  },
  {
    title: 'settings',
    href: '/profile/setting',
    disabled: false,
    external: false,
    icon: RiUserSettingsFill,
    label: 'Setting',
    description: '',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Настройки профиля', href: '/profile/setting' },
      { label: 'Избранное', href: '/profile/favorites' },
      { label: 'Покупки', href: '/profile/purchases' },
      { label: 'Адреса доставки', href: '/profile/address' },
    ],
  },
  {
    title: 'conference',
    href: '/profile/conference',
    external: false,
    disabled: false,
    icon: HiUserGroup,
    label: 'Conference',
    description: '',
    hasDropdown: false,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useContext(PaxContext);
  const [isOpen, setIsOpen] = useState(false); // Добавляем состояние для открытия/закрытия меню

  const isChatPage = /^\/profile\/chat(\/(?!.*\/).*)?$/.test(pathname);
  const isMessagesPage = /^\/profile\/messages(\/(?!.*\/).*)?$/.test(pathname);

  const filteredNavItems = navItems.filter((item) => {
    if (item.title === 'my_posts' && !user?.seller) {
      return true; // Скрываем пункт "Витрина", если user.seller === false
    }
    return true;
  });

  return (
    <div>
      {!isChatPage && !isMessagesPage ? (
        <nav
          className={cn(
            `fixed bottom-0 z-30 w-full bg-background sm:relative sm:h-screen sm:w-auto sm:border-r sm:pt-0 md:min-h-full lg:w-72`
          )}
        >
          <div className='sm:space-y-4 sm:py-4'>
            <div className='px-3 py-0'>
              <div className='space-y-1'>
                {/* Передаем setIsOpen в ProfileNav */}
                <ProfileNav
                  items={filteredNavItems} // Передаем отфильтрованные элементы навигации
                  hideSidebar={isChatPage}
                  setOpen={setIsOpen}
                />
              </div>
            </div>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
